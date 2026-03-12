"""add_invite_code_to_users

Revision ID: 7df8d4608017
Revises: da1e5dfd4ad5
Create Date: 2026-03-11 21:49:58.933547

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7df8d4608017'
down_revision: Union[str, Sequence[str], None] = 'da1e5dfd4ad5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('invite_code', sa.String(6), nullable=True))
    op.create_index(op.f('ix_users_invite_code'), 'users', ['invite_code'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_users_invite_code'), table_name='users')
    op.drop_column('users', 'invite_code')
