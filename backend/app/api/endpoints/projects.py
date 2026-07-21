from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.project import Project, ProjectCreate
from app.services import project_service
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("", response_model=Project)
def create_project(project: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_project = project_service.get_project_by_repo(db, github_repo=project.github_repo, user_id=current_user.id)
    if db_project:
        raise HTTPException(status_code=400, detail="Project already registered")
    return project_service.create_project(db=db, project=project, user_id=current_user.id)

@router.get("", response_model=List[Project])
def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    projects = project_service.get_projects(db, user_id=current_user.id, skip=skip, limit=limit)
    return projects

@router.get("/{project_id}", response_model=Project)
def read_project(project_id: int, db: Session = Depends(get_db)):
    db_project = project_service.get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project
