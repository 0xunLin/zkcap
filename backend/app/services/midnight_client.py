"""
Midnight Ledger Integration Client
Triggers the Compact prover harness via subprocess to verify and anchor attestations on-chain
"""
import os
import sys
import json
import logging
import subprocess
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from app.models.attestation import Attestation, AttestationStatus
from app.models.commit import Commit
from app.core.config import settings

logger = logging.getLogger(__name__)

class MidnightClient:
    """Client wrapper for triggering the Midnight ZK proving and ledger anchoring harness"""

    def __init__(self, workspace_root: str):
        self.workspace_root = workspace_root
        self.worker_dir = os.path.join(workspace_root, "worker", "midnight")

    def anchor_attestation(
        self,
        db: Session,
        attestation_id: str,
        project_id: str,
        attestation_hash: str,
        security_score: int,
        timestamp: int,
        repository_id: str,
        commit_hash: str,
        author_signature: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Runs the TypeScript prover harness in a subprocess to generate a ZK proof 
        and anchor the attestation to the Midnight ledger. Updates the database status.
        """
        logger.info(f"Initiating Midnight ZK proving and anchoring for attestation: {attestation_id}")

        # Update status to pending/anchoring
        attestation = db.query(Attestation).filter(Attestation.id == attestation_id).first()
        if not attestation:
            logger.error(f"Attestation {attestation_id} not found in database")
            return None

        # Build execution arguments
        args = [
            "npx",
            "ts-node",
            "src/prover.ts",
            project_id,
            attestation_hash,
            str(security_score),
            str(timestamp),
            repository_id,
            commit_hash,
            author_signature,
        ]

        env = os.environ.copy()
        # Inject relevant Midnight environment configs
        env["MIDNIGHT_CONTRACT_ADDRESS"] = getattr(settings, "MIDNIGHT_CONTRACT_ADDRESS", "")
        env["MIDNIGHT_RPC_ENDPOINT"] = getattr(settings, "MIDNIGHT_RPC_ENDPOINT", "https://indexer.testnet.midnight.network/graphql")
        env["MIDNIGHT_RPC_WEBSOCKET"] = getattr(settings, "MIDNIGHT_RPC_WEBSOCKET", "wss://indexer.testnet.midnight.network/graphql")
        env["MIDNIGHT_PROOF_SERVER"] = getattr(settings, "MIDNIGHT_PROOF_SERVER", "http://localhost:6300")

        try:
            # Run the ts-node process
            result = subprocess.run(
                args,
                cwd=self.worker_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                env=env,
                check=True
            )

            # Parse stdout JSON
            output = json.loads(result.stdout.strip())
            if output.get("success"):
                tx_id = output.get("midnight_tx_id")
                contract_address = output.get("contract_address")

                # Update attestation database record
                attestation.status = AttestationStatus.ONCHAIN
                attestation.onchain_tx = tx_id
                db.commit()
                db.refresh(attestation)

                logger.info(f"Attestation {attestation_id} successfully anchored to Midnight: tx_id={tx_id}")
                return {
                    "success": True,
                    "midnight_tx_id": tx_id,
                    "contract_address": contract_address
                }
            else:
                error_msg = output.get("error", "Unknown harness error")
                logger.error(f"Harness failed to prove/anchor: {error_msg}")
                attestation.status = AttestationStatus.FAILED
                db.commit()
                return {"success": False, "error": error_msg}

        except subprocess.CalledProcessError as e:
            # Check if stderr contains JSON error or standard error string
            stderr_content = e.stderr.strip()
            logger.error(f"Midnight subprocess failed with return code {e.returncode}. Stderr: {stderr_content}")
            try:
                err_json = json.loads(stderr_content)
                error_msg = err_json.get("error", stderr_content)
            except Exception:
                error_msg = stderr_content

            attestation.status = AttestationStatus.FAILED
            db.commit()
            return {"success": False, "error": error_msg}

        except Exception as e:
            logger.error(f"Unexpected error running Midnight anchor process: {str(e)}")
            attestation.status = AttestationStatus.FAILED
            db.commit()
            return {"success": False, "error": str(e)}


# Module-level client helper instantiation
_client: Optional[MidnightClient] = None

def get_midnight_client() -> MidnightClient:
    """Singleton getter for the Midnight client"""
    global _client
    if _client is None:
        # Resolve workspace root dynamically
        current_dir = os.path.dirname(os.path.abspath(__file__))
        # app/services is 3 levels deep from zkcap root
        workspace_root = os.path.abspath(os.path.join(current_dir, "..", "..", ".."))
        _client = MidnightClient(workspace_root=workspace_root)
    return _client
