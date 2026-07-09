from pydantic import BaseModel
from typing import List, Optional

class WebhookAuthor(BaseModel):
    name: str
    email: str

class WebhookCommit(BaseModel):
    id: str
    message: str
    timestamp: str
    url: str
    author: WebhookAuthor

class WebhookRepository(BaseModel):
    id: int
    name: str
    full_name: str
    html_url: str

class GithubWebhookPayload(BaseModel):
    ref: str
    repository: WebhookRepository
    commits: List[WebhookCommit]
    head_commit: Optional[WebhookCommit] = None
