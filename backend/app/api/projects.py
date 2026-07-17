"""
Projects API routes.

POST /api/projects — Link a GitHub repository.
GET  /api/projects — List the current user's linked repositories.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.project import Project
from app.core.auth import get_current_user
from app.schemas.project import ProjectCreateRequest, ProjectResponse

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    body: ProjectCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Link a GitHub repository to the current user.

    The `github_repo` should be in "owner/repo" format.
    """
    # Check for duplicate
    existing = db.query(Project).filter(
        Project.github_repo == body.github_repo,
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Repository '{body.github_repo}' is already linked",
        )

    # Derive a readable name from the repo slug
    name = body.github_repo.split("/")[-1] if "/" in body.github_repo else body.github_repo

    project = Project(
        user_id=current_user.id,
        name=name,
        github_repo=body.github_repo,
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    return ProjectResponse(
        id=str(project.id),
        name=project.name,
        github_repo=project.github_repo,
        created_at=project.created_at,
        commit_count=0,
    )


@router.get("", response_model=list[ProjectResponse])
async def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all repositories linked by the current user."""
    projects = (
        db.query(Project)
        .filter(Project.user_id == current_user.id)
        .order_by(Project.created_at.desc())
        .all()
    )

    results = []
    for p in projects:
        commit_count = len(p.commits) if p.commits else 0
        results.append(
            ProjectResponse(
                id=str(p.id),
                name=p.name,
                github_repo=p.github_repo,
                created_at=p.created_at,
                commit_count=commit_count,
            )
        )
    return results
