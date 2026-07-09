from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.webhook import GithubWebhookPayload
from app.schemas.project import ProjectCreate
from app.schemas.commit import CommitCreate
from app.services import project_service, commit_service, attestation_service, zktls_service
from app.core.config import settings
import hmac
import hashlib
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

def verify_signature(payload_body: bytes, signature_header: str, secret: str) -> bool:
    if not signature_header:
        return False
    hash_object = hmac.new(secret.encode('utf-8'), msg=payload_body, digestmod=hashlib.sha256)
    expected_signature = "sha256=" + hash_object.hexdigest()
    return hmac.compare_digest(expected_signature, signature_header)

@router.post("/github")
async def github_webhook(
    request: Request,
    payload: GithubWebhookPayload,
    x_hub_signature_256: str = Header(None),
    db: Session = Depends(get_db)
):
    body = await request.body()
    
    # Verify GitHub webhook signature
    if settings.GITHUB_WEBHOOK_SECRET != "super_secret_webhook_key":
        if not verify_signature(body, x_hub_signature_256, settings.GITHUB_WEBHOOK_SECRET):
            raise HTTPException(status_code=403, detail="Invalid signature")

    repo_url = payload.repository.html_url
    repo_name = payload.repository.full_name

    # Create or retrieve project
    project = project_service.get_project_by_url(db, url=repo_url)
    if not project:
        project = project_service.create_project(
            db, ProjectCreate(name=repo_name, repository_url=repo_url)
        )

    processed_commits = []
    for commit_data in payload.commits:
        # Check for duplicates
        existing = commit_service.get_commit_by_hash(db, commit_hash=commit_data.id)
        if not existing:
            # Create commit record
            new_commit = commit_service.create_commit(db, CommitCreate(
                commit_hash=commit_data.id,
                author=commit_data.author.name,
                message=commit_data.message,
                timestamp=commit_data.timestamp,
                project_id=project.id
            ))
            
            # Queue zkTLS proof generation (async)
            if settings.ENABLE_ZKTLS_PROOFS:
                try:
                    import asyncio
                    loop = asyncio.get_event_loop()
                except RuntimeError:
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                
                loop.create_task(
                    zktls_service.generate_zktls_proof_for_commit(
                        db=db,
                        commit_id=new_commit.id,
                        repository_url=repo_url,
                        commit_hash=new_commit.commit_hash,
                        author=commit_data.author.name,
                    )
                )
            
            # Queue attestation generation with TEE invocation
            try:
                attestation_service.generate_attestation_for_commit(
                    db=db,
                    commit_id=new_commit.id,
                    commit_hash=new_commit.commit_hash,
                    commit_author=commit_data.author.name,
                    repository_url=repo_url,
                    commit_diff="",  # Will be fetched by TEE worker from GitHub
                )
                processed_commits.append(new_commit.commit_hash)
            except Exception as e:
                logger.error(f"Failed to generate attestation for commit {new_commit.commit_hash}: {str(e)}")

    return {"status": "ok", "processed_commits": processed_commits}
