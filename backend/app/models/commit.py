from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.base_class import Base

class Commit(Base):
    __tablename__ = "commits"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    commit_hash = Column(String, index=True, nullable=False, unique=True)
    author = Column(String, nullable=False)
    message = Column(String, nullable=False)
    timestamp = Column(String, nullable=False)
    
    # zkTLS Proof of commit existence (JSON)
    zkTLS_proof = Column(JSON, nullable=True)
    # Structure: {
    #   "proof": str,
    #   "claim": dict,
    #   "timestamp": str
    # }
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    project = relationship("Project", back_populates="commits")
    attestation = relationship("Attestation", back_populates="commit", uselist=False, cascade="all, delete-orphan")
