"""Application blueprints grouped by domain."""

from __future__ import annotations

from typing import Iterable

from flask import Blueprint, Flask

from .api import api_bp
from .quiz import quiz_bp
from .settings import settings_bp
from .words import words_bp

BLUEPRINTS: tuple[Blueprint, ...] = (words_bp, settings_bp, quiz_bp, api_bp)


def register_blueprints(app: Flask, *, blueprints: Iterable[Blueprint] | None = None) -> None:
    """Register the configured blueprints on the provided Flask app."""
    for blueprint in blueprints or BLUEPRINTS:
        app.register_blueprint(blueprint)
