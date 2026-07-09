"""Add TEE and Solana fields to attestations, add zkTLS proof to commits

Revision ID: 002_tee_solana_zktls
Revises: 001_initial
Create Date: 2026-07-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002_tee_solana_zktls'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add TEE fields to attestations table
    op.add_column('attestations', sa.Column('tee_invocation_id', sa.String(), nullable=True))
    op.add_column('attestations', sa.Column('tee_evaluation', postgresql.JSON(), nullable=True))
    op.add_column('attestations', sa.Column('tee_execution', postgresql.JSON(), nullable=True))
    
    # Add Solana fields to attestations table
    op.add_column('attestations', sa.Column('solana_tx_signature', sa.String(), nullable=True))
    op.add_column('attestations', sa.Column('solana_pda_address', sa.String(), nullable=True))
    op.add_column('attestations', sa.Column('sbt_mint_address', sa.String(), nullable=True))
    
    # Add metadata fields to attestations table
    op.add_column('attestations', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.add_column('attestations', sa.Column('error_message', sa.Text(), nullable=True))
    
    # Add indices for query performance
    op.create_index('ix_attestations_tee_invocation_id', 'attestations', ['tee_invocation_id'])
    op.create_index('ix_attestations_solana_tx_signature', 'attestations', ['solana_tx_signature'])
    
    # Add zkTLS proof to commits table
    op.add_column('commits', sa.Column('zkTLS_proof', postgresql.JSON(), nullable=True))
    op.add_column('commits', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()))


def downgrade() -> None:
    # Remove columns added in upgrade
    op.drop_index('ix_attestations_solana_tx_signature', table_name='attestations')
    op.drop_index('ix_attestations_tee_invocation_id', table_name='attestations')
    
    op.drop_column('attestations', 'error_message')
    op.drop_column('attestations', 'updated_at')
    op.drop_column('attestations', 'sbt_mint_address')
    op.drop_column('attestations', 'solana_pda_address')
    op.drop_column('attestations', 'solana_tx_signature')
    op.drop_column('attestations', 'tee_execution')
    op.drop_column('attestations', 'tee_evaluation')
    op.drop_column('attestations', 'tee_invocation_id')
    
    op.drop_column('commits', 'updated_at')
    op.drop_column('commits', 'zkTLS_proof')
