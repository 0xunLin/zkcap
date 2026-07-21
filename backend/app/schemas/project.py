from datetime import datetime
from pydantic import BaseModel

class ProjectCreate(BaseModel):
    github_repo: str

class Project(BaseModel):
    id: str
    name: str
    github_repo: str
    created_at: datetime
    commit_count: int = 0

    class Config:
        from_attributes = True
    
# --- Aliases to satisfy duplicate routers ---
ProjectCreateRequest = ProjectCreate
ProjectResponse = Project