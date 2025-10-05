"""Database helpers wrapping Flask-SQLAlchemy initialisation."""

from __future__ import annotations

from flask import Flask
from flask_sqlalchemy import SQLAlchemy


db: SQLAlchemy = SQLAlchemy()


def init_db(app: Flask) -> SQLAlchemy:
    """Bind the SQLAlchemy extension to the provided Flask app."""
    db.init_app(app)
    return db
