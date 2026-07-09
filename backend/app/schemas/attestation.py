from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any

class Vulnerability(BaseModel):
    type: str
    severity: str  # "critical", "high", "medium", "low"
    description: str

class TEEEvaluation(BaseModel):
    security_score: int = Field(..., ge=0, le=100)
    pass_evaluation: bool
    vulnerabilities: List[Vulnerability] = []
    reasoning: str

class TEEExecution(BaseModel):
    hardware_signature: str
    timestamp: str
    quote: Optional[str] = None

class AttestationBase(BaseModel):
    commit_id: int
    attestation_hash: str
    status: str = "pending"

class AttestationCreate(AttestationBase):
    pass

class Attestation(AttestationBase):
    id: int
    tee_invocation_id: Optional[str] = None
    tee_evaluation: Optional[TEEEvaluation] = None
    tee_execution: Optional[TEEExecution] = None
    solana_tx_signature: Optional[str] = None
    solana_pda_address: Optional[str] = None
    sbt_mint_address: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    error_message: Optional[str] = None

    class Config:
        from_attributes = True
