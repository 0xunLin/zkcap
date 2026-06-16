import uuid
from datetime import datetime, timezone

from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class Commit(Base):
    """A Git commit captured from a GitHub webhook."""

    __tablename__ = "commits"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    commit_hash: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    message: Mapped[str] = mapped_column(String(1000), nullable=False)
    author: Mapped[str] = mapped_column(String(255), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="commits")
    attestation: Mapped["Attestation"] = relationship(
        "Attestation", back_populates="commit", uselist=False, cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Commit {self.commit_hash[:8]}>"
