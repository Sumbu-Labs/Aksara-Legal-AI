from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector

# revision identifiers, used by Alembic.
revision = "20240928_01"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "documents",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("url", sa.String(length=512), nullable=False, unique=True),
        sa.Column("type", sa.Enum("html", "pdf", "markdown", name="document_type"), nullable=False),
        sa.Column("uploaded_by", sa.String(length=128), nullable=True),
        sa.Column("sha256", sa.String(length=128), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "chunks",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("document_id", sa.Integer(), sa.ForeignKey("documents.id", ondelete="CASCADE"), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("metadata", sa.dialects.postgresql.JSONB(), nullable=False),
        sa.Column("embedding", Vector(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_chunks_document_id", "chunks", ["document_id"])

    op.create_table(
        "templates",
        sa.Column("permit_type", sa.String(length=32), primary_key=True),
        sa.Column("region", sa.String(length=32), primary_key=True),
        sa.Column("json_schema", sa.dialects.postgresql.JSONB(), nullable=False),
        sa.Column("docx_template_url", sa.String(length=512), nullable=False),
        sa.Column("version_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "autopilot_jobs",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.String(length=128), nullable=False),
        sa.Column("permit_type", sa.String(length=32), nullable=False),
        sa.Column("region", sa.String(length=32), nullable=False),
        sa.Column("input_json", sa.dialects.postgresql.JSONB(), nullable=False),
        sa.Column("field_audit", sa.dialects.postgresql.JSONB(), nullable=True),
        sa.Column("status", sa.Enum("pending", "completed", "failed", "missing_required_fields", name="autopilot_status"), nullable=False),
        sa.Column("doc_url", sa.String(length=512), nullable=True),
        sa.Column("pdf_url", sa.String(length=512), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_autopilot_jobs_user_id", "autopilot_jobs", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_autopilot_jobs_user_id", table_name="autopilot_jobs")
    op.drop_table("autopilot_jobs")
    op.drop_table("templates")
    op.drop_index("ix_chunks_document_id", table_name="chunks")
    op.drop_table("chunks")
    op.drop_table("documents")
    op.execute("DROP TYPE IF EXISTS document_type")
    op.execute("DROP TYPE IF EXISTS autopilot_status")
