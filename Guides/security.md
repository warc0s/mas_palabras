# Seguridad

## CSRF

- Flask-WTF CSRFProtect activado globalmente en `create_app()`
- Token inyectado en todos los templates via context processor (`csrf_token()`)
- Meta tag en `base.html`: `<meta name="csrf-token" content="{{ csrf_token() }}">`
- `WTF_CSRF_TIME_LIMIT = 3600` (1 hora)
- Desactivado solo en `TestingConfig`

## Sesiones

Development:
- SESSION_COOKIE_HTTPONLY: True
- SESSION_COOKIE_SAMESITE: Lax
- SESSION_COOKIE_SECURE: False
- PERMANENT_SESSION_LIFETIME: 86400s (24h)

Production:
- SESSION_COOKIE_HTTPONLY: True
- SESSION_COOKIE_SAMESITE: Strict
- SESSION_COOKIE_SECURE: True
- PERMANENT_SESSION_LIFETIME: 86400s

Todos sobreescribibles via env vars.

## Variables de entorno (.env)

Requeridas (la app crashea si faltan):
- `SECRET_KEY`
- `SQLALCHEMY_DATABASE_URI`

Opcionales:
- `FLASK_CONFIG` — `development` | `testing` | `production`
- `FLASK_DEBUG` — `true`/`false`
- `MAX_CONTENT_LENGTH` — bytes (default 10MB)
- `SESSION_COOKIE_SECURE` — bool
- `SESSION_COOKIE_SAMESITE` — string
- `SESSION_LIFETIME_SECONDS` — int
- `LOG_LEVEL` — DEBUG/INFO/WARNING/ERROR
- `STRUCTURED_LOGS` — bool
- `SENTRY_DSN` — string
- `SENTRY_ENVIRONMENT` — string
- `SENTRY_TRACES_SAMPLE_RATE` — float

## Uploads

- `MAX_CONTENT_LENGTH = 10MB` — limite global Flask
- Error handler 413 custom
- Import solo acepta `.json` (validación WTForms `FileAllowed`)

## Protección BD

- `SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}` — detecta conexiones caídas
- `db.session.rollback()` en error handler 500 y en paths de error de import/bulk_delete
- SQLite URI normalizada a path absoluto (evita sorpresas con rutas relativas)

## Sentry

Configurado en `utils/logging_config.py`:
- Solo se activa si `SENTRY_DSN` está configurado
- Sample rate configurable via `SENTRY_TRACES_SAMPLE_RATE`
- Environment configurable via `SENTRY_ENVIRONMENT`

## Lo que NO hay

- Sin autenticación/autorización: la app es single-user o se delega al reverse proxy
- Sin rate limiting: no hay throttle en endpoints
- Sin CSP headers: no hay Content-Security-Policy
- Sin validación de input en API: más allá de tipos básicos y campos requeridos
- API sin auth: `/api/v1/*` es completamente público con CORS abierto

Si la app va a exponerse públicamente, estos puntos hay que abordarlos.
