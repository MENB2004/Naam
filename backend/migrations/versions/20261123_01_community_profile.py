"""Add community locality and privacy consent metadata.

Revision ID: 20261123_01
Revises:
Create Date: 2026-11-23
"""

import sqlalchemy as sa
from alembic import op

revision = "20261123_01"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    if "users" not in inspector.get_table_names():
        raise RuntimeError("Initialize the application schema before applying community migrations")
    existing_columns = {column["name"] for column in inspector.get_columns("users")}
    if "locality" not in existing_columns:
        op.add_column("users", sa.Column("locality", sa.String(length=255), nullable=True))
    if "privacy_consent_at" not in existing_columns:
        op.add_column("users", sa.Column("privacy_consent_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "privacy_consent_at")
    op.drop_column("users", "locality")
