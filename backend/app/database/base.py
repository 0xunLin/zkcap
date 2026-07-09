# Import all the models, so that Base has them before being
# imported by Alembic
from app.database.base_class import Base
from app.models.project import Project
from app.models.commit import Commit
from app.models.attestation import Attestation
