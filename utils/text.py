"""Utility helpers for text processing."""

import unicodedata


def normalize_text(value: str | None) -> str:
    """Return a lowercase, accent-free representation of the text."""
    if value is None:
        return ""
    normalized = unicodedata.normalize("NFD", value.casefold())
    return "".join(char for char in normalized if unicodedata.category(char) != "Mn")

