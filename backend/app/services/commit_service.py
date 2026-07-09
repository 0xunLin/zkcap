from sqlalchemy.orm import Session
from app.models.commit import Commit
from app.schemas.commit import CommitCreate

def get_commit(db: Session, commit_id: int):
    return db.query(Commit).filter(Commit.id == commit_id).first()

def get_commit_by_hash(db: Session, commit_hash: str):
    return db.query(Commit).filter(Commit.commit_hash == commit_hash).first()

def get_commits(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Commit).order_by(Commit.created_at.desc()).offset(skip).limit(limit).all()

def create_commit(db: Session, commit: CommitCreate):
    db_commit = Commit(
        project_id=commit.project_id,
        commit_hash=commit.commit_hash,
        author=commit.author,
        message=commit.message,
        timestamp=commit.timestamp
    )
    db.add(db_commit)
    db.commit()
    db.refresh(db_commit)
    return db_commit
