import uuid
import enum
from datetime import datetime, timezone

from sqlalchemy import String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class AttestationStatus(str, enum.Enum):
    """Possible states for an attestation."""
    PENDING = "pending"
    GENERATED = "generated"
    ONCHAIN = "onchain"
    FAILED = "failed"


class Attestation(Base):
    """An attestation generated for a commit."""

    __tablename__ = "attestations"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
    )
    commit_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("commits.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    status: Mapped[AttestationStatus] = mapped_column(
        Enum(AttestationStatus, name="attestation_status"),
        default=AttestationStatus.PENDING,
        nullable=False,
    )
    attestation_hash: Mapped[str] = mapped_column(
        String(64), nullable=True,
    )
    onchain_tx: Mapped[str] = mapped_column(
        String(255), nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    commit: Mapped["Commit"] = relationship("Commit", back_populates="attestation")

    def __repr__(self) -> str:
        return f"<Attestation {self.status.value}>"
