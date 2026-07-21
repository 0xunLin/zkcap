from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.commit import Commit
from app.services import commit_service

router = APIRouter()

@router.get("/", response_model=List[Commit])
def read_commits(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    commits = commit_service.get_commits(db, skip=skip, limit=limit)
    return commits

@router.get("/{commit_id}", response_model=Commit)
def read_commit(commit_id: str, db: Session = Depends(get_db)):
    db_commit = commit_service.get_commit(db, commit_id=commit_id)
    if db_commit is None:
        raise HTTPException(status_code=404, detail="Commit not found")
    return db_commit
