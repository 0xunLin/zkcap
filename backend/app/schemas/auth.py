"""Pydantic schemas for authentication endpoints."""

from pydantic import BaseModel


class GitHubAuthRequest(BaseModel):
    """Request body for GitHub token exchange."""
    access_token: str


class AuthTokenResponse(BaseModel):
    """Response containing a zkCAP JWT."""
    token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """Response schema for user info."""
    id: str
    github_id: int
    github_username: str
    github_avatar_url: str | None = None

    class Config:
        from_attributes = True
