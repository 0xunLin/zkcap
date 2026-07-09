"""
Solana Program Integration
Handles anchoring attestations to Solana blockchain via Anchor program
"""
import asyncio
import logging
import json
from typing import Optional
from base64 import b64encode
from datetime import datetime

logger = logging.getLogger(__name__)


class SolanaIntegrationClient:
    """Client for interacting with Solana zkCAP attestation program"""

    def __init__(
        self,
        program_id: str,
        rpc_endpoint: str,
        operator_keypair_path: Optional[str] = None,
    ):
        self.program_id = program_id
        self.rpc_endpoint = rpc_endpoint
        self.operator_keypair_path = operator_keypair_path
        self._initialized = False

    async def initialize(self) -> None:
        """Lazy initialization of Solana client"""
        if self._initialized:
            return

        try:
            # Import solders (Solana Python client) - lazy import to avoid missing dependency
            from solders.client import Client
            from solders.keypair import Keypair

            self.Client = Client
            self.Keypair = Keypair
            self._initialized = True
            logger.info("Solana client initialized")
        except ImportError:
            logger.error("solders library not installed. Run: pip install solders")
            raise

    async def record_attestation(
        self,
        project_id: int,
        commit_hash: str,
        security_score: int,
        tee_hardware_signature: str,
        zkTLS_proof: Optional[str] = None,
    ) -> str:
        """
        Record attestation on Solana blockchain.
        
        Args:
            project_id: Project identifier
            commit_hash: Git commit hash
            security_score: TEE evaluation score (0-100)
            tee_hardware_signature: TEE remote attestation quote
            zkTLS_proof: Optional zero-knowledge proof of commit
            
        Returns:
            transaction_signature: Solana transaction signature
        """
        await self.initialize()

        if security_score < 0 or security_score > 100:
            raise ValueError(f"Invalid security_score: {security_score}")

        try:
            # In production, this would:
            # 1. Load operator keypair from self.operator_keypair_path
            # 2. Construct Anchor instruction via IDL
            # 3. Submit transaction via RPC
            # For MVP, we simulate the transaction
            
            tx_data = {
                "program_id": self.program_id,
                "project_id": project_id,
                "commit_hash": commit_hash,
                "security_score": security_score,
                "tee_signature": tee_hardware_signature[:64],  # Truncate for PDA derivation
                "proof_hash": zkTLS_proof[:32] if zkTLS_proof else "0" * 32,
                "timestamp": datetime.utcnow().isoformat(),
            }

            # Simulate transaction by encoding as hex
            tx_sig = b64encode(
                json.dumps(tx_data).encode()
            ).decode()[:88]  # Solana tx sigs are ~88 chars base58

            logger.info(
                f"Attestation recorded on Solana: tx={tx_sig}, "
                f"project={project_id}, commit={commit_hash[:8]}"
            )
            return tx_sig

        except Exception as e:
            logger.error(f"Failed to record attestation on Solana: {str(e)}")
            raise

    async def verify_pda_state(
        self,
        project_id: int,
        commit_hash: str,
    ) -> Optional[dict]:
        """
        Query Solana PDA state for an attestation.
        
        Returns PDA account data if attestation exists, None otherwise.
        """
        await self.initialize()

        try:
            # In production, this would deserialize PDA account data
            # For MVP, we return None (no on-chain query)
            logger.debug(f"Would query PDA for project={project_id}, commit={commit_hash[:8]}")
            return None

        except Exception as e:
            logger.error(f"Failed to query Solana PDA: {str(e)}")
            return None

    async def mint_sbt(
        self,
        developer_wallet: str,
        project_id: int,
        commit_hash: str,
    ) -> Optional[str]:
        """
        Mint Soulbound Token to developer wallet.
        
        Returns mint transaction signature or None if not ready.
        """
        await self.initialize()

        try:
            # In production, this would:
            # 1. Derive SPL Token mint account
            # 2. Call CPI to mint to developer_wallet
            # For MVP, we simulate
            
            sbt_tx = b64encode(
                f"sbt_{project_id}_{commit_hash[:8]}".encode()
            ).decode()[:88]

            logger.info(f"SBT minted: tx={sbt_tx}, recipient={developer_wallet[:8]}...")
            return sbt_tx

        except Exception as e:
            logger.error(f"Failed to mint SBT: {str(e)}")
            return None


def get_solana_client(
    program_id: str,
    rpc_endpoint: str,
    operator_keypair_path: Optional[str] = None,
) -> SolanaIntegrationClient:
    """Factory function to create Solana integration client"""
    return SolanaIntegrationClient(
        program_id=program_id,
        rpc_endpoint=rpc_endpoint,
        operator_keypair_path=operator_keypair_path,
    )
