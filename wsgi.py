"""WSGI entry point for running the application with Gunicorn."""

from __future__ import annotations

import os

from app import create_app


app = create_app(os.getenv("FLASK_CONFIG"))
