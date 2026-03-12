"""add_coach_acknowledge_to_workout_logs

Revision ID: a3f9c2e81b04
Revises: 7df8d4608017
Create Date: 2026-03-11 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a3f9c2e81b04'
down_revision: Union[str, Sequence[str], None] = '7df8d4608017'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('workout_logs', sa.Column('coach_acknowledged', sa.Boolean(), nullable=True))
    op.add_column('workout_logs', sa.Column('coach_response', sa.Text(), nullable=True))
    op.add_column('workout_logs', sa.Column('acknowledged_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('workout_logs', 'acknowledged_at')
    op.drop_column('workout_logs', 'coach_response')
    op.drop_column('workout_logs', 'coach_acknowledged')
