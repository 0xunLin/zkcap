from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.base_class import Base

class Attestation(Base):
    __tablename__ = "attestations"

    id = Column(Integer, primary_key=True, index=True)
    commit_id = Column(Integer, ForeignKey("commits.id"), nullable=False, unique=True)
    attestation_hash = Column(String, index=True, nullable=False, unique=True)
    
    # Status: pending -> tee_pending -> tee_evaluated -> solana_recorded or error states
    status = Column(String, default="pending")
    
    # TEE Invocation
    tee_invocation_id = Column(String, nullable=True, index=True)
    
    # TEE Evaluation Results (JSON)
    tee_evaluation = Column(JSON, nullable=True)
    # Structure: {
    #   "security_score": int (0-100),
    #   "pass_evaluation": bool,
    #   "vulnerabilities": [{"type": str, "severity": str, "description": str}],
    #   "reasoning": str
    # }
    
    # TEE Execution Proof (JSON)
    tee_execution = Column(JSON, nullable=True)
    # Structure: {
    #   "hardware_signature": str,
    #   "timestamp": str,
    #   "quote": str
    # }
    
    # Solana Blockchain
    solana_tx_signature = Column(String, nullable=True, index=True)
    solana_pda_address = Column(String, nullable=True)
    sbt_mint_address = Column(String, nullable=True)  # Soulbound Token mint
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    error_message = Column(Text, nullable=True)

    commit = relationship("Commit", back_populates="attestation")
