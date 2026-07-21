import asyncio
import logging
import hashlib
from sqlalchemy.orm import Session
from app.models.attestation import Attestation
from app.models.commit import Commit
from app.schemas.attestation import AttestationCreate
from app.integrations.tee_worker import get_tee_client
from app.core.config import settings

logger = logging.getLogger(__name__)


def get_attestation(db: Session, attestation_id: str):
    return db.query(Attestation).filter(Attestation.id == attestation_id).first()


def get_attestations(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Attestation).order_by(Attestation.created_at.desc()).offset(skip).limit(limit).all()


def get_attestation_by_commit_id(db: Session, commit_id: str):
    return db.query(Attestation).filter(Attestation.commit_id == commit_id).first()


async def invoke_tee_evaluation(
    db: Session,
    attestation_id: str,
    commit_id: str,
    commit_hash: str,
    commit_author: str,
    repository_url: str,
    commit_diff: str = "",
):
    """
    Async task to invoke TEE worker for attestation.
    Updates attestation status and invocation_id in database.
    """
    try:
        tee_client = get_tee_client(
            endpoint_url=settings.PHALA_TEE_ENDPOINT,
            callback_base_url=settings.TEE_CALLBACK_BASE_URL,
        )

        invocation_id = await tee_client.invoke_evaluation(
            commit_id=commit_id,
            commit_hash=commit_hash,
            commit_diff=commit_diff,
            commit_author=commit_author,
            repository_url=repository_url,
        )

        # Update attestation with invocation ID
        attestation = db.query(Attestation).filter(Attestation.id == attestation_id).first()
        if attestation:
            attestation.tee_invocation_id = invocation_id
            attestation.status = "tee_pending"
            db.commit()
            logger.info(f"TEE invocation queued: attestation_id={attestation_id}, invocation_id={invocation_id}")
        else:
            logger.error(f"Attestation not found: attestation_id={attestation_id}")

    except Exception as e:
        logger.error(f"Failed to invoke TEE evaluation: {str(e)}")
        # Mark attestation as errored
        attestation = db.query(Attestation).filter(Attestation.id == attestation_id).first()
        if attestation:
            attestation.status = "error"
            attestation.error_message = str(e)
            db.commit()


def generate_attestation_for_commit(
    db: Session,
    commit_id: str,
    commit_hash: str,
    commit_author: str,
    repository_url: str,
    commit_diff: str = "",
):
    """
    Create attestation record and queue TEE evaluation.
    
    Returns: Attestation object
    """
    # Validate commit exists
    commit = db.query(Commit).filter(Commit.id == commit_id).first()
    if not commit:
        raise ValueError(f"Commit not found: commit_id={commit_id}")

    # Check if attestation already exists for this commit
    existing_attestation = get_attestation_by_commit_id(db, commit_id)
    if existing_attestation:
        logger.warning(f"Attestation already exists for commit_id={commit_id}")
        return existing_attestation

    # Create attestation record
    attestation_hash = hashlib.sha256(
        f"attest_{commit_id}_{commit_hash}".encode("utf-8")
    ).hexdigest()

    db_attestation = Attestation(
        commit_id=commit_id,
        attestation_hash=attestation_hash,
        status="pending",  # Initial status; will move to tee_pending after invocation
    )
    db.add(db_attestation)
    db.flush()  # Get the ID without committing
    db.commit()
    db.refresh(db_attestation)

    # Queue async TEE invocation
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    # Schedule the async task (non-blocking)
    loop.create_task(
        invoke_tee_evaluation(
            db=db,
            attestation_id=db_attestation.id,
            commit_id=commit_id,
            commit_hash=commit_hash,
            commit_author=commit_author,
            repository_url=repository_url,
            commit_diff=commit_diff,
        )
    )

    logger.info(f"Attestation created and TEE evaluation queued: attestation_id={db_attestation.id}")
    return db_attestation
