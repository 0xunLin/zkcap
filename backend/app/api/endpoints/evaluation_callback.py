"""
TEE Evaluation Callback Endpoint
Receives hardware-signed evaluation results from Phala Network
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.attestation import Attestation
from app.models.commit import Commit
from app.schemas.attestation import TEEEvaluation, TEEExecution
from app.integrations.solana_program import get_solana_client
from app.core.config import settings
import hmac
import hashlib
import logging
import json
from typing import Optional

logger = logging.getLogger(__name__)

router = APIRouter()


class TEECallbackPayload:
    """Represents TEE callback payload"""
    def __init__(self, data: dict):
        self.invocation_id = data.get("invocation_id")
        self.commit_id = data.get("commit_id")
        self.evaluation = data.get("evaluation", {})
        self.tee_execution = data.get("tee_execution", {})


def verify_tee_signature(
    payload_body: bytes,
    signature_header: str,
    secret: str = "phala_tee_callback_secret",
) -> bool:
    """Verify TEE callback signature (HMAC-SHA256)"""
    if not signature_header:
        return False
    hash_object = hmac.new(
        secret.encode("utf-8"), msg=payload_body, digestmod=hashlib.sha256
    )
    expected_signature = "sha256=" + hash_object.hexdigest()
    return hmac.compare_digest(expected_signature, signature_header)


@router.post("/callback")
async def evaluation_callback(
    request: Request,
    db: Session = Depends(get_db),
    x_tee_signature: str = None,
):
    """
    Receive TEE evaluation results and update attestation status.
    
    Expected payload:
    {
        "invocation_id": "phala_inv_xyz",
        "commit_id": 123,
        "evaluation": {
            "security_score": 85,
            "pass_evaluation": true,
            "vulnerabilities": [
                {"type": "sql_injection", "severity": "high", "description": "..."}
            ],
            "reasoning": "..."
        },
        "tee_execution": {
            "hardware_signature": "...",
            "timestamp": "2026-07-01T...",
            "quote": "..."
        }
    }
    """
    body = await request.body()

    # Verify signature (optional for MVP)
    # if not verify_tee_signature(body, x_tee_signature):
    #     raise HTTPException(status_code=403, detail="Invalid TEE signature")

    try:
        payload_dict = json.loads(body)
        payload = TEECallbackPayload(payload_dict)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse TEE callback payload: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    # Validate required fields
    if not payload.invocation_id or not payload.commit_id:
        raise HTTPException(status_code=400, detail="Missing invocation_id or commit_id")

    # Find attestation by invocation_id
    attestation = db.query(Attestation).filter(
        Attestation.tee_invocation_id == payload.invocation_id
    ).first()

    if not attestation:
        logger.warning(f"Attestation not found for invocation: {payload.invocation_id}")
        raise HTTPException(status_code=404, detail="Attestation not found")

    try:
        # Update attestation with TEE results
        attestation.tee_evaluation = payload.evaluation
        attestation.tee_execution = payload.tee_execution
        attestation.status = "tee_evaluated"

        # Validate evaluation data
        if payload.evaluation:
            security_score = payload.evaluation.get("security_score", 0)
            if not (0 <= security_score <= 100):
                raise ValueError(f"Invalid security_score: {security_score}")

        db.commit()

        logger.info(
            f"TEE evaluation received: attestation_id={attestation.id}, "
            f"score={payload.evaluation.get('security_score', 'N/A')}"
        )

        # If Solana anchoring is enabled, record on chain
        if settings.ENABLE_SOLANA_ANCHORING:
            try:
                await record_attestation_on_solana(
                    attestation=attestation,
                    db=db,
                    payload=payload,
                )
            except Exception as e:
                logger.error(f"Failed to record attestation on Solana: {str(e)}")
                attestation.status = "solana_error"
                attestation.error_message = str(e)
                db.commit()

        return {
            "status": "ok",
            "attestation_id": attestation.id,
            "security_score": payload.evaluation.get("security_score"),
        }

    except Exception as e:
        logger.error(f"Error processing TEE callback: {str(e)}")
        attestation.status = "error"
        attestation.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail="Failed to process evaluation")


async def record_attestation_on_solana(
    attestation: Attestation,
    db: Session,
    payload: TEECallbackPayload,
):
    """
    Record attestation on Solana blockchain.
    This is called after TEE evaluation is received.
    """
    solana_client = get_solana_client(
        program_id=settings.SOLANA_PROGRAM_ID,
        rpc_endpoint=settings.SOLANA_RPC_ENDPOINT,
        operator_keypair_path=settings.SOLANA_OPERATOR_KEYPAIR_PATH,
    )

    # Get commit to extract hash
    commit = db.query(Commit).filter(Commit.id == attestation.commit_id).first()
    if not commit:
        raise ValueError(f"Commit not found: commit_id={attestation.commit_id}")

    # Extract TEE signature and evaluation
    tee_signature = payload.tee_execution.get("hardware_signature", "")
    security_score = payload.evaluation.get("security_score", 0)
    zkTLS_proof = commit.zkTLS_proof or {}

    # Record on Solana
    tx_signature = await solana_client.record_attestation(
        project_id=commit.project_id,
        commit_hash=commit.commit_hash,
        security_score=int(security_score),
        tee_hardware_signature=tee_signature,
        zkTLS_proof=json.dumps(zkTLS_proof) if zkTLS_proof else None,
    )

    # Update attestation with Solana details
    attestation.solana_tx_signature = tx_signature
    attestation.status = "solana_recorded"
    db.commit()

    logger.info(f"Attestation recorded on Solana: tx={tx_signature}")
