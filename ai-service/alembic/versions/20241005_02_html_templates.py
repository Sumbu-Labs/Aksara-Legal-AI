"""Rename template column for HTML rendering"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "20241005_02_html_templates"
down_revision = "20240928_01_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("templates") as batch_op:  # type: ignore[arg-type]
        batch_op.alter_column("docx_template_url", new_column_name="html_template_url")


def downgrade() -> None:
    with op.batch_alter_table("templates") as batch_op:  # type: ignore[arg-type]
        batch_op.alter_column("html_template_url", new_column_name="docx_template_url")
