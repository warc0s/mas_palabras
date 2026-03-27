# Arquitectura General

## Stack

- Framework: Flask (factory pattern)
- BD: SQLite + SQLAlchemy + Alembic
- Templates: Jinja2 + Tailwind CSS (CDN)
- Forms: Flask-WTF + WTForms
- Producción: Gunicorn + reverse proxy
- Observabilidad: Sentry SDK
- Tipado: mypy (estricto en módulos supervisados)

## Estructura de ficheros

```
app.py                  # Factory create_app(), entry point
config.py               # Config, DevelopmentConfig, TestingConfig, ProductionConfig
wsgi.py                 # Wrapper para Gunicorn
gunicorn.conf.py        # Config Gunicorn (preload, timeouts)

blueprints/
  __init__.py           # register_blueprints(app)
  words.py              # CRUD palabras + dashboard + import/export
  quiz.py               # Config + gameplay del quiz
  api.py                # REST API /api/v1/*
  settings.py           # Gestión de idiomas y categorías

utils/
  database.py           # db = SQLAlchemy(), init_db()
  models.py             # Word, Language, Feature, QuizSession
  forms.py              # WordForm, QuizForm, QuizConfigForm, SearchForm, ImportForm...
  text.py               # normalize_text() — casefold + quitar acentos
  logging_config.py     # configure_logging(), init_sentry()
  api.py                # (vacío, residual)

templates/              # Jinja2, extienden base.html
  base.html             # Layout: nav, flashes, footer, Tailwind config
  index.html            # Dashboard con estadísticas
  maspalabras.html      # Formulario alta palabra
  verpalabras.html      # Listado con filtros/paginación
  edit.html             # Edición palabra
  quiz_config.html      # Configurar quiz
  quiz.html             # Pregunta activa
  import_words.html     # Importar JSON
  settings.html         # Idiomas y categorías
  404.html / 500.html / 413.html

tests/
  test_app.py           # Tests integración (~680 líneas)
  test_typing.py        # Tests de tipado

migrations/             # Alembic
  alembic.ini
  env.py
  versions/
    ...2024022501_initial_schema.py
    ...2024072001_normalized_words_and_quiz_session.py

instance/
  palabras.json         # Datos de ejemplo (export)
```

## Flujo de arranque

```
create_app(config_name?)
  ├── load_dotenv(.env + instance/.env)
  ├── from_object(Config subclass)
  ├── apply_env_overrides(app)          # env vars pisan config
  ├── _normalise_sqlite_uri()           # resuelve rutas relativas SQLite
  ├── configure_logging() + init_sentry()
  ├── init_db() → db.init_app()
  ├── Migrate.init_app()
  ├── CSRFProtect.init_app()
  ├── register_blueprints()             # words, quiz, api, settings
  ├── inject_csrf_token()               # context processor
  └── errorhandlers: 404, 500, 413
```

## Convenciones

- Tipado: todo está type-hintado. mypy falla si introduces funciones sin tipar.
- Nombres en BD: snake_case. Los modelos usan `__tablename__` implícito (nombre de clase lower).
- Blueprints: cada uno su propio archivo, registrados en `blueprints/__init__.py`.
- Mensajes flash: siempre en español. Categorías: `success`, `error`, `warning`, `info`.
- Tests: `unittest.TestCase` con `setUp/tearDown` que crean BD temporal en tmp.
