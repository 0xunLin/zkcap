from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.attestation import Attestation
from app.services import attestation_service

router = APIRouter()

@router.get("/", response_model=List[Attestation])
def read_attestations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    attestations = attestation_service.get_attestations(db, skip=skip, limit=limit)
    return attestations

@router.get("/{attestation_id}", response_model=Attestation)
def read_attestation(attestation_id: str, db: Session = Depends(get_db)):
    db_attestation = attestation_service.get_attestation(db, attestation_id=attestation_id)
    if db_attestation is None:
        raise HTTPException(status_code=404, detail="Attestation not found")
    return db_attestation
