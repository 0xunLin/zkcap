"""
Authentication API routes.

POST /api/auth/github — Exchange a GitHub access token for a zkCAP JWT.
GET  /api/auth/me     — Return the current authenticated user.
"""

import hashlib

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.core.auth import create_access_token, get_current_user
from app.schemas.auth import GitHubAuthRequest, AuthTokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/github", response_model=AuthTokenResponse)
async def github_auth(body: GitHubAuthRequest, db: Session = Depends(get_db)):
    """
    Exchange a GitHub access token for a zkCAP JWT.

    The CLI obtains a GitHub token via Device Flow, then sends it here.
    We verify it against the GitHub API, create/update the user, and
    return a zkCAP JWT for subsequent requests.
    """
    # Verify the GitHub token by fetching the user's profile
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://api.github.com/user",
            headers={
                "Authorization": f"Bearer {body.access_token}",
                "Accept": "application/vnd.github+json",
            },
        )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid GitHub access token",
        )

    gh_user = resp.json()
    github_id = gh_user["id"]
    github_username = gh_user["login"]
    github_avatar_url = gh_user.get("avatar_url", "")

    # Hash the access token for storage (we don't store plaintext)
    token_hash = hashlib.sha256(body.access_token.encode()).hexdigest()

    # Find or create user
    user = db.query(User).filter(User.github_id == github_id).first()
    if user is None:
        user = User(
            github_id=github_id,
            github_username=github_username,
            github_avatar_url=github_avatar_url,
            access_token_hash=token_hash,
        )
        db.add(user)
    else:
        # Update on every login
        user.github_username = github_username
        user.github_avatar_url = github_avatar_url
        user.access_token_hash = token_hash

    db.commit()
    db.refresh(user)

    # Issue a zkCAP JWT
    jwt_token = create_access_token(str(user.id))
    return AuthTokenResponse(token=jwt_token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user."""
    return UserResponse(
        id=str(current_user.id),
        github_id=current_user.github_id,
        github_username=current_user.github_username,
        github_avatar_url=current_user.github_avatar_url,
    )
