"""
Attestations API routes.

POST /api/attestations              — Create an attestation for a commit.
GET  /api/attestations              — List attestations for the current user.
POST /api/attestations/{id}/onchain — Mark an attestation for on-chain anchoring.
"""

import hashlib
import json
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.project import Project
from app.models.commit import Commit
from app.models.attestation import Attestation, AttestationStatus
from app.core.auth import get_current_user
from app.schemas.attestation import (
    AttestationCreateRequest,
    AttestationResponse,
    OnchainResponse,
)

router = APIRouter(prefix="/api/attestations", tags=["attestations"])


def _compute_attestation_hash(commit_data: AttestationCreateRequest) -> str:
    """
    Compute a SHA-256 attestation hash from commit metadata.

    Hash = SHA-256(commit_hash + tree_hash + author + timestamp + sorted_parent_hashes)
    """
    parts = [
        commit_data.commit_hash,
        commit_data.tree_hash or "",
        commit_data.author,
        commit_data.timestamp.isoformat(),
    ]
    if commit_data.parent_hashes:
        parts.extend(sorted(commit_data.parent_hashes))

    payload = "|".join(parts)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


@router.post("", response_model=AttestationResponse, status_code=status.HTTP_201_CREATED)
async def create_attestation(
    body: AttestationCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create an attestation for a specific commit.

    The CLI fetches commit metadata from GitHub and sends it here.
    We store the commit, compute an attestation hash, and return it.
    """
    # Find the project (must be owned by current user)
    project = (
        db.query(Project)
        .filter(
            Project.github_repo == body.github_repo,
            Project.user_id == current_user.id,
        )
        .first()
    )
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Repository '{body.github_repo}' not linked. Run: zkcap repo add {body.github_repo}",
        )

    # Check if this commit was already attested
    existing_commit = (
        db.query(Commit)
        .filter(
            Commit.project_id == project.id,
            Commit.commit_hash == body.commit_hash,
        )
        .first()
    )
    if existing_commit and existing_commit.attestation:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Commit {body.commit_hash[:8]} already has an attestation",
        )

    # Create or reuse the commit record
    if existing_commit:
        commit = existing_commit
    else:
        commit = Commit(
            project_id=project.id,
            commit_hash=body.commit_hash,
            message=body.message,
            author=body.author,
            timestamp=body.timestamp,
            tree_hash=body.tree_hash,
            parent_hashes=json.dumps(body.parent_hashes) if body.parent_hashes else None,
            additions=body.additions,
            deletions=body.deletions,
            files_changed=body.files_changed,
        )
        db.add(commit)
        db.flush()  # Get the commit ID

    # Compute attestation hash
    attestation_hash = _compute_attestation_hash(body)

    # Create the attestation
    attestation = Attestation(
        commit_id=commit.id,
        status=AttestationStatus.GENERATED,
        attestation_hash=attestation_hash,
    )
    db.add(attestation)
    db.commit()
    db.refresh(attestation)
    db.refresh(commit)

    return AttestationResponse(
        id=str(attestation.id),
        commit_hash=commit.commit_hash,
        message=commit.message,
        author=commit.author,
        status=attestation.status.value,
        attestation_hash=attestation.attestation_hash,
        onchain_tx=attestation.onchain_tx,
        created_at=attestation.created_at,
    )


@router.get("", response_model=list[AttestationResponse])
async def list_attestations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all attestations for the current user's projects."""
    # Get all project IDs for this user
    project_ids = [
        p.id for p in
        db.query(Project).filter(Project.user_id == current_user.id).all()
    ]
    if not project_ids:
        return []

    # Get all commits with attestations
    commits = (
        db.query(Commit)
        .filter(Commit.project_id.in_(project_ids))
        .order_by(Commit.created_at.desc())
        .all()
    )

    results = []
    for c in commits:
        if c.attestation:
            results.append(
                AttestationResponse(
                    id=str(c.attestation.id),
                    commit_hash=c.commit_hash,
                    message=c.message,
                    author=c.author,
                    status=c.attestation.status.value,
                    attestation_hash=c.attestation.attestation_hash,
                    onchain_tx=c.attestation.onchain_tx,
                    created_at=c.attestation.created_at,
                )
            )
    return results


@router.post("/{attestation_id}/onchain", response_model=OnchainResponse)
async def submit_onchain(
    attestation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Mark an attestation for on-chain anchoring.

    This is a placeholder for Phase 4. Currently it updates the status
    to ONCHAIN and generates a mock transaction hash.
    """
    attestation = db.query(Attestation).filter(
        Attestation.id == uuid.UUID(attestation_id),
    ).first()

    if not attestation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attestation not found",
        )

    # Verify ownership: attestation -> commit -> project -> user
    commit = attestation.commit
    project = commit.project
    if project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this attestation",
        )

    if attestation.status == AttestationStatus.ONCHAIN:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Attestation is already on-chain",
        )

    # Placeholder: generate a mock tx hash from the attestation hash
    # In Phase 4 this would submit to an actual blockchain
    mock_tx = "0x" + hashlib.sha256(
        (attestation.attestation_hash or "").encode()
    ).hexdigest()[:40]

    attestation.status = AttestationStatus.ONCHAIN
    attestation.onchain_tx = mock_tx
    db.commit()
    db.refresh(attestation)

    return OnchainResponse(
        attestation_id=str(attestation.id),
        status=attestation.status.value,
        onchain_tx=attestation.onchain_tx,
    )
