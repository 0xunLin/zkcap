import uuid
from datetime import datetime, timezone

from sqlalchemy import String, DateTime, BigInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base_class import Base


class User(Base):
    """A GitHub-authenticated user of zkCAP."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
    )
    github_id: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        unique=True,
        index=True,
    )
    github_username: Mapped[str] = mapped_column(
        String(255), nullable=False,
    )
    github_avatar_url: Mapped[str] = mapped_column(
        String(500), nullable=True,
    )
    access_token_hash: Mapped[str] = mapped_column(
        String(255), nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    projects: Mapped[list["Project"]] = relationship(
        "Project", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User @{self.github_username}>"
