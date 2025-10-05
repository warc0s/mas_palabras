"""Logging and observability helpers for the Flask application."""

from __future__ import annotations

import json
import logging
import logging.config
from datetime import datetime
from typing import Any, Dict

from flask import Flask, has_request_context, request


class JsonFormatter(logging.Formatter):
    """Render logs as JSON objects suitable for structured logging sinks."""

    def format(self, record: logging.LogRecord) -> str:  # noqa: D401 - inherited docstring
        payload: Dict[str, Any] = {
            "timestamp": datetime.utcfromtimestamp(record.created).isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        if has_request_context():
            payload["http"] = {
                "method": request.method,
                "path": request.path,
                "remote_addr": request.remote_addr,
            }

        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        for key, value in record.__dict__.items():
            if key.startswith("_"):
                continue
            if key in payload or key in {"msg", "args", "levelno", "levelname", "pathname", "lineno", "funcName", "created", "msecs", "relativeCreated", "thread", "threadName", "processName", "process", "exc_info", "exc_text", "stack_info"}:
                continue
            payload[key] = value

        return json.dumps(payload, ensure_ascii=False)


def configure_logging(app: Flask) -> None:
    """Configure logging handlers based on the current environment."""
    log_level = app.config.get("LOG_LEVEL", "INFO")
    structured_logs = app.config.get("STRUCTURED_LOGS", False)

    console_formatter = {
        "format": "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        "datefmt": "%Y-%m-%d %H:%M:%S",
    }

    config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "console": console_formatter,
            "json": {
                "()": "utils.logging_config.JsonFormatter",
            },
        },
        "handlers": {
            "app_handler": {
                "class": "logging.StreamHandler",
                "level": log_level,
                "formatter": "json" if structured_logs else "console",
            }
        },
        "root": {
            "level": log_level,
            "handlers": ["app_handler"],
        },
    }

    logging.config.dictConfig(config)


def init_sentry(app: Flask) -> None:
    """Initialise Sentry if a DSN is provided in configuration."""
    dsn = app.config.get("SENTRY_DSN")
    if not dsn:
        return

    try:
        import sentry_sdk
        from sentry_sdk.integrations.flask import FlaskIntegration
    except ImportError:  # pragma: no cover - dependency missing only in misconfiguration
        app.logger.warning("Sentry SDK is not installed; skipping Sentry initialisation.")
        return

    sentry_sdk.init(
        dsn=dsn,
        integrations=[FlaskIntegration()],
        traces_sample_rate=float(app.config.get("SENTRY_TRACES_SAMPLE_RATE", 0.0)),
        environment=app.config.get("SENTRY_ENVIRONMENT"),
        send_default_pii=False,
    )
    app.logger.info("Sentry initialised")
