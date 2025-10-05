import os
from datetime import timedelta
from pathlib import Path
from flask import Flask
from typing import Type


def _get_bool(env_key: str, default: bool = False) -> bool:
    value = os.environ.get(env_key)
    if value is None:
        return default
    return value.lower() in {"1", "true", "t", "yes", "on"}


def _get_int(env_key: str, default: int) -> int:
    value = os.environ.get(env_key)
    try:
        return int(value) if value is not None else default
    except (TypeError, ValueError):
        return default


def _get_float(env_key: str, default: float) -> float:
    value = os.environ.get(env_key)
    try:
        return float(value) if value is not None else default
    except (TypeError, ValueError):
        return default


BASE_DIR = Path(__file__).resolve().parent


DEFAULT_MAX_CONTENT_LENGTH = 10 * 1024 * 1024
DEFAULT_SESSION_LIFETIME_SECONDS = 86400


class Config:
    SECRET_KEY = None
    SQLALCHEMY_DATABASE_URI = None
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}

    MAX_CONTENT_LENGTH = DEFAULT_MAX_CONTENT_LENGTH
    WTF_CSRF_TIME_LIMIT = 3600
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = False
    PERMANENT_SESSION_LIFETIME = timedelta(seconds=DEFAULT_SESSION_LIFETIME_SECONDS)

    DEBUG = False
    LOG_LEVEL = "INFO"
    STRUCTURED_LOGS = False
    SENTRY_DSN: str | None = None
    SENTRY_ENVIRONMENT: str | None = None
    SENTRY_TRACES_SAMPLE_RATE = 0.0


class DevelopmentConfig(Config):
    DEBUG = True
    SESSION_COOKIE_SECURE = False
    LOG_LEVEL = "DEBUG"


class TestingConfig(Config):
    TESTING = True
    WTF_CSRF_ENABLED = False
    SESSION_COOKIE_SECURE = False


class ProductionConfig(Config):
    DEBUG = False
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_SAMESITE = "Strict"
    STRUCTURED_LOGS = True
    SENTRY_ENVIRONMENT = "production"


CONFIGURATIONS: dict[str, Type[Config]] = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}


def apply_env_overrides(app: Flask) -> None:
    app.config.setdefault("SECRET_KEY", os.environ.get("SECRET_KEY"))
    app.config.setdefault("SQLALCHEMY_DATABASE_URI", os.environ.get("SQLALCHEMY_DATABASE_URI"))

    if "SECRET_KEY" in os.environ:
        app.config["SECRET_KEY"] = os.environ["SECRET_KEY"]

    if "SQLALCHEMY_DATABASE_URI" in os.environ:
        app.config["SQLALCHEMY_DATABASE_URI"] = os.environ["SQLALCHEMY_DATABASE_URI"]

    app.config["MAX_CONTENT_LENGTH"] = _get_int("MAX_CONTENT_LENGTH", DEFAULT_MAX_CONTENT_LENGTH)

    app.config["WTF_CSRF_TIME_LIMIT"] = _get_int("WTF_CSRF_TIME_LIMIT", 3600)
    app.config["SESSION_COOKIE_SAMESITE"] = os.environ.get("SESSION_COOKIE_SAMESITE", app.config.get("SESSION_COOKIE_SAMESITE", "Lax"))
    app.config["SESSION_COOKIE_SECURE"] = _get_bool("SESSION_COOKIE_SECURE", app.config.get("SESSION_COOKIE_SECURE", False))

    session_seconds_default = int(app.config.get("PERMANENT_SESSION_LIFETIME", timedelta(seconds=DEFAULT_SESSION_LIFETIME_SECONDS)).total_seconds())
    app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(seconds=_get_int("SESSION_LIFETIME_SECONDS", session_seconds_default))

    app.config["DEBUG"] = _get_bool("FLASK_DEBUG", app.config.get("DEBUG", False))
    app.config["LOG_LEVEL"] = os.environ.get("LOG_LEVEL", app.config.get("LOG_LEVEL", "INFO")).upper()
    app.config["STRUCTURED_LOGS"] = _get_bool("STRUCTURED_LOGS", app.config.get("STRUCTURED_LOGS", False))
    app.config["SENTRY_DSN"] = os.environ.get("SENTRY_DSN", app.config.get("SENTRY_DSN"))
    app.config["SENTRY_ENVIRONMENT"] = os.environ.get("SENTRY_ENVIRONMENT", app.config.get("SENTRY_ENVIRONMENT"))
    app.config["SENTRY_TRACES_SAMPLE_RATE"] = _get_float(
        "SENTRY_TRACES_SAMPLE_RATE",
        app.config.get("SENTRY_TRACES_SAMPLE_RATE", 0.0),
    )
