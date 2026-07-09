from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any

class CommitBase(BaseModel):
    commit_hash: str
    author: str
    message: str
    timestamp: str
    project_id: int

class CommitCreate(CommitBase):
    pass

class Commit(CommitBase):
    id: int
    zkTLS_proof: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
