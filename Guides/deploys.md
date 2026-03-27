# Desarrollo y Despliegue

## Setup local

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Variables de entorno mínimas

Crear `.env` en la raíz:
```
SECRET_KEY=tu-clave-secreta
SQLALCHEMY_DATABASE_URI=sqlite:///instance/app.db
FLASK_CONFIG=development
```

## Ejecutar en desarrollo

```bash
flask --app app run
# o directamente:
python app.py
```

La app corre en `http://127.0.0.1:5000`.

Modo check (valida que la app arranca sin lanzar servidor):
```bash
python app.py --check
```

## Base de datos

```bash
# Inicializar migraciones (solo primera vez)
flask db init

# Crear migración tras cambios en modelos
flask db migrate -m "descripción del cambio"

# Aplicar migraciones
flask db upgrade
```

## Tests

```bash
pytest                      # Ejecutar todos
pytest -v                   # Verbose
pytest -k test_quiz         # Solo tests de quiz
pytest --tb=short           # Tracebacks cortos
```

## Tipado estático

```bash
mypy --config-file mypy.ini
```

## Despliegue en producción

```bash
gunicorn -c gunicorn.conf.py wsgi:app
```

### Config Gunicorn (`gunicorn.conf.py`)

Define: `preload_app`, keep-alive, timeouts razonables.

### Config necesaria en producción

```
SECRET_KEY=clave-secreta-fuerte
SQLALCHEMY_DATABASE_URI=sqlite:///ruta/absoluta/produccion.db
FLASK_CONFIG=production
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_SAMESITE=Strict
STRUCTURED_LOGS=true
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ENVIRONMENT=production
```

## Comandos útiles

- `flask shell` — REPL con context de app
- `flask db current` — Migración actual
- `flask db history` — Historial migraciones
- `python app.py --check` — Valida arranque sin servidor

## Dependencias (requirements.txt)

- flask — Framework web
- flask-sqlalchemy — ORM
- flask-wtf — Forms + CSRF
- flask-migrate — Migraciones Alembic
- sentry-sdk — Monitorización errores
- python-dotenv — Carga .env
- gunicorn — Servidor WSGI producción
- mypy — Tipado estático
- pytest — Testing
