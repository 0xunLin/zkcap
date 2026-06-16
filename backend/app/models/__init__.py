# Import all models so Alembic can detect them for autogeneration
from app.models.project import Project  # noqa: F401
from app.models.commit import Commit  # noqa: F401
from app.models.attestation import Attestation, AttestationStatus  # noqa: F401
