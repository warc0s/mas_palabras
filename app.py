import argparse
import os
from pathlib import Path

from typing import Optional, Type, cast

from flask import Flask, flash, render_template, request, url_for
from flask.typing import ResponseReturnValue
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect, generate_csrf

from dotenv import load_dotenv

from config import CONFIGURATIONS, Config, apply_env_overrides
from utils.logging_config import configure_logging, init_sentry
from utils.database import db, init_db
from blueprints import register_blueprints


csrf = CSRFProtect()
migrate = Migrate()


def _get_config_class(config_name: str) -> Type[Config]:
    """Return the configuration class matching the provided identifier."""
    return cast(Type[Config], CONFIGURATIONS.get(config_name, Config))


def _normalise_sqlite_uri(uri: str, root_path: Path) -> str:
    """Resolve relative SQLite URIs to absolute paths under the project root."""
    prefix = "sqlite:///"
    if not uri or not uri.startswith(prefix):
        return uri

    path_fragment, separator, query = uri[len(prefix):].partition("?")
    if not path_fragment:
        return uri

    is_windows_absolute = (
        len(path_fragment) >= 2 and path_fragment[1] == ":" and path_fragment[0].isalpha()
    )

    raw_path = Path(path_fragment)
    if not raw_path.is_absolute() and not is_windows_absolute:
        raw_path = (root_path / raw_path).resolve()
    else:
        raw_path = Path(path_fragment).resolve()

    os.makedirs(raw_path.parent, exist_ok=True)

    rebuilt = f"{prefix}{raw_path.as_posix()}"
    if separator:
        rebuilt = f"{rebuilt}?{query}"
    return rebuilt


def create_app(config_name: Optional[str] = None) -> Flask:
    """Application factory used for tests, development and production."""
    app = Flask(__name__, instance_relative_config=True)

    os.makedirs(app.instance_path, exist_ok=True)

    project_root = Path(__file__).resolve().parent
    load_dotenv(project_root / ".env")
    load_dotenv(project_root / "instance" / ".env")

    config_target = config_name or os.environ.get("FLASK_CONFIG", "development")
    app.config.from_object(_get_config_class(config_target))
    apply_env_overrides(app)

    db_uri = app.config.get("SQLALCHEMY_DATABASE_URI")
    if isinstance(db_uri, str):
        app.config["SQLALCHEMY_DATABASE_URI"] = _normalise_sqlite_uri(db_uri, Path(app.root_path))

    configure_logging(app)
    init_sentry(app)

    required_keys = ["SECRET_KEY", "SQLALCHEMY_DATABASE_URI"]
    missing = [key for key in required_keys if not app.config.get(key)]
    if missing:
        raise RuntimeError(f"Missing required configuration keys: {', '.join(missing)}")

    init_db(app)
    migrate.init_app(app, db)
    csrf.init_app(app)

    register_blueprints(app)

    @app.context_processor
    def inject_csrf_token() -> dict[str, object]:
        return {"csrf_token": generate_csrf}

    @app.errorhandler(404)
    def not_found_error(error: Exception) -> ResponseReturnValue:
        flash("Página no encontrada.", "error")
        return render_template("404.html"), 404

    @app.errorhandler(500)
    def internal_error(error: Exception) -> ResponseReturnValue:
        app.logger.error(
            "Unhandled server error",
            extra={
                "endpoint": request.endpoint,
                "path": request.path,
                "method": request.method,
            },
            exc_info=(type(error), error, error.__traceback__),
        )
        db.session.rollback()
        flash("Error interno del servidor.", "error")
        return render_template("500.html"), 500

    @app.errorhandler(413)
    def request_entity_too_large(error: Exception) -> ResponseReturnValue:
        flash("El archivo es demasiado grande.", "error")
        return render_template("413.html"), 413

    return app


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Flask application entry point")
    parser.add_argument(
        "--check",
        action="store_true",
        help="Initialise the app and exit without starting the development server",
    )
    args = parser.parse_args()

    application = create_app()

    if args.check:
        with application.app_context():
            application.logger.info("Application loaded successfully (check mode)")
        raise SystemExit(0)

    try:
        application.run(
            debug=application.debug,
            use_reloader=False,
            use_debugger=False,
        )
    except PermissionError as exc:  # pragma: no cover - sandbox environments
        application.logger.error("Unable to start development server: %s", exc)
        raise
