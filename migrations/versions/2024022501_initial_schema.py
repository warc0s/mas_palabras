"""Initial database schema with active flags"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "2024022501"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "language",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("language", sa.String(length=50), nullable=False),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.UniqueConstraint("language", name="uq_language_language"),
    )

    op.create_table(
        "feature",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("feature", sa.String(length=50), nullable=False),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.UniqueConstraint("feature", name="uq_feature_feature"),
    )

    op.create_table(
        "word",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("english_word", sa.String(length=100), nullable=False),
        sa.Column("translation", sa.String(length=100), nullable=False),
        sa.Column("explanation", sa.String(length=300)),
        sa.Column("language_id", sa.Integer(), sa.ForeignKey("language.id"), nullable=False),
        sa.Column("feature_id", sa.Integer(), sa.ForeignKey("feature.id"), nullable=False),
        sa.Column("times_practiced", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("times_correct", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_practiced", sa.DateTime()),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "quiz_session",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("session_id", sa.String(length=36), nullable=False),
        sa.Column("word_ids", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("total_questions", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("correct_answers", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_table("quiz_session")
    op.drop_table("word")
    op.drop_table("feature")
    op.drop_table("language")
