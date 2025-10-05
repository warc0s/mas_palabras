"""Add normalized english word and quiz session progress tracking"""

from __future__ import annotations

import unicodedata

from alembic import op
import sqlalchemy as sa


revision = "2024072001"
down_revision = "2024022501"
branch_labels = None
depends_on = None


def _normalize_text(value: str) -> str:
    if value is None:
        return ""
    normalized = unicodedata.normalize("NFD", value.casefold())
    return "".join(char for char in normalized if unicodedata.category(char) != "Mn")


def upgrade() -> None:
    op.add_column(
        "word",
        sa.Column("normalized_english_word", sa.String(length=100), nullable=True),
    )

    op.create_index(
        "ix_word_normalized_english_word",
        "word",
        ["normalized_english_word"],
        unique=False,
    )

    bind = op.get_bind()
    results = bind.execute(sa.text("SELECT id, english_word FROM word"))
    for row in results:
        normalized = _normalize_text(row.english_word)
        bind.execute(
            sa.text(
                "UPDATE word SET normalized_english_word = :normalized WHERE id = :id"
            ),
            {"normalized": normalized, "id": row.id},
        )

    with op.batch_alter_table("word") as batch_op:
        batch_op.alter_column(
            "normalized_english_word",
            existing_type=sa.String(length=100),
            nullable=False,
        )

    with op.batch_alter_table("word") as batch_op:
        batch_op.create_unique_constraint(
            "uq_words_language_normalized",
            ["language_id", "normalized_english_word"],
        )

    op.add_column(
        "quiz_session",
        sa.Column("current_index", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column(
        "quiz_session",
        sa.Column("is_completed", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column(
        "quiz_session",
        sa.Column("quiz_config", sa.Text(), nullable=True),
    )

    with op.batch_alter_table("quiz_session") as batch_op:
        batch_op.alter_column("current_index", existing_type=sa.Integer(), server_default=None)
        batch_op.alter_column("is_completed", existing_type=sa.Boolean(), server_default=None)


def downgrade() -> None:
    with op.batch_alter_table("quiz_session") as batch_op:
        batch_op.drop_column("quiz_config")
        batch_op.drop_column("is_completed")
        batch_op.drop_column("current_index")

    op.drop_constraint("uq_words_language_normalized", "word", type_="unique")
    op.drop_index("ix_word_normalized_english_word", table_name="word")
    op.drop_column("word", "normalized_english_word")
