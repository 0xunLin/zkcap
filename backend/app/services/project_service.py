from sqlalchemy.orm import Session
from app.models.project import Project
from app.schemas.project import ProjectCreate

def get_project(db: Session, project_id: str):
    return db.query(Project).filter(Project.id == project_id).first()

def get_project_by_repo(db: Session, github_repo: str, user_id: str):
    return db.query(Project).filter(Project.github_repo == github_repo, Project.user_id == user_id).first()

def get_projects(db: Session, user_id: str, skip: int = 0, limit: int = 100):
    return db.query(Project).filter(Project.user_id == user_id).offset(skip).limit(limit).all()

def create_project(db: Session, project: ProjectCreate, user_id: str):
    name = project.github_repo.split("/")[-1] if "/" in project.github_repo else project.github_repo
    db_project = Project(name=name, github_repo=project.github_repo, user_id=user_id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project
