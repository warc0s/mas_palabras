# AGENTS.md — Mas_Palabras

App Flask para gestionar vocabulario personal y practicarlo con quizzes adaptativos.

## Qué leer antes de tocar código

Lectura obligatoria antes de cada sesión de trabajo:

1. Este fichero (`AGENTS.md`)
2. Todas las guías de `Guides/` (son breves, léelas enteras)
3. La guía específica del área que vayas a tocar, una segunda vez con atención

### Mapa de guías

- `Guides/architecture.md` — Stack, estructura de ficheros, flujo de arranque de la app
- `Guides/backend.md` — Blueprints, rutas, lógica de negocio, helpers
- `Guides/api.md` — REST API /api/v1/*, endpoints, formatos, errores
- `Guides/database.md` — Esquema (4 tablas), relaciones, migraciones, métodos de modelo
- `Guides/frontend.md` — Templates, Tailwind config, componentes, dónde tocar estilos
- `Guides/security.md` — CSRF, sesiones, env vars, lo que falta por implementar
- `Guides/testing.md` — Cómo ejecutar tests, estructura, convenciones
- `Guides/deploys.md` — Setup local, migraciones, Gunicorn, config por entorno
- `Guides/import-export.md` — Formato JSON, opciones de import, códigos de error

### Lectura rápida por tipo de cambio

- Tocar rutas o lógica -> `Guides/backend.md`
- Tocar modelos o BD -> `Guides/database.md`
- Tocar API REST -> `Guides/api.md`
- Tocar templates o estilos -> `Guides/frontend.md`
- Tocar config, env vars, despliegue -> `Guides/deploys.md` + `Guides/security.md`
- Tocar import/export -> `Guides/import-export.md`
- Añadir tests -> `Guides/testing.md`

## Estructura del proyecto

```
app.py              # Factory create_app(), entry point
config.py           # Config classes + apply_env_overrides
wsgi.py             # Wrapper Gunicorn
gunicorn.conf.py    # Config producción
blueprints/         # 4 blueprints: words, quiz, api, settings
utils/              # models, forms, text, database, logging_config
templates/          # Jinja2 + Tailwind CDN (sin build step)
tests/              # pytest + unittest
migrations/         # Alembic
instance/           # .env alternativo, datos de ejemplo
Guides/             # Documentación de referencia
```

## Principios

- Prioriza base sólida sobre features rápidas. Si falta información, deja un TODO explícito antes que inventar.
- Cambios pequeños y focalizados. Nada de refactors masivos no pedidos.
- Si una decisión cambia el enfoque o el alcance, pausa y pide confirmación.
- Ataca la causa raíz. No maquilles estados ni acumules deuda sin señalarla.
- Cierra el ciclo: explorar, cambiar, validar, resumir.

## Reglas de código

- Código e identificadores en inglés. Mensajes flash en español.
- Las rutas y views deben ser ligeras. Lógica de negocio fuera de templates.
- Las plantillas solo presentan, no calculan ni deciden.
- Centraliza validaciones y reglas compartidas. Si algo crece, extráelo a un módulo.
- Comentarios solo cuando aclaren una decisión no obvia.
- Todo type-hintado. mypy falla si hay funciones sin tipar en módulos supervisados.

## Modelo de dominio — reglas clave

El modelo gira en torno a 4 tablas: `word`, `language`, `feature`, `quiz_session`.

Reglas que no se pueden romper:

- Los duplicados se detectan por `(language_id, normalized_english_word)`. La normalización quita acentos y pasa a casefold.
- Language y Feature hacen soft-delete (active=False) si tienen palabras asociadas.
- El tracking de progreso (`times_practiced`, `times_correct`, `last_practiced`) se actualiza en cada respuesta de quiz.
- Una palabra "necesita práctica" si: nunca practicada, menos de 3 intentos, o precisión menor al 70%.

Antes de cambiar el esquema: documenta el motivo, revisa impacto en datos existentes, define migración.

## Validación

- Todo cambio funcional necesita validación explícita.
- Prioriza tests automatizados. Si no hay tests, valida manual y documenta qué comprobaste.
- Cambios en quizzes, scoring, progreso o persistencia requieren validación cuidadosa.
- Cambios documentales o estructurales: explica por qué no aplica test.

## Seguridad

- Nunca commitees secretos. Variables sensibles en `.env`.
- CSRF activado globalmente (Flask-WTF).
- Valida siempre inputs de usuario.
- Antes de borrados o migraciones irreversibles, confirma intención.
- La app no tiene autenticación ni rate limiting. Ver `Guides/security.md` para gaps conocidos.

## Guías: fuente única y documentación viva

- Las guías son la base de verdad del proyecto. Siempre deben reflejar el estado actual del código.
- Cada cambio en el código que afecte a una guía debe ir acompañado de la actualización de esa guía.
- Si añades una ruta, un modelo, un helper, un template o cambias un comportamiento: actualiza la guía correspondiente.
- Cada tema tiene una guía fuente. No repitas contenido que ya está en su guía.
- Si detectas duplicidad entre guías, corrígela.
- Si falta una guía necesaria, créala mínima o deja un TODO.
- Formato de las guías: solo texto, almohadillas (`#`) para headings y backticks para código. Sin tablas, sin negritas.

## Git

Conventional Commits, una sola línea, sin cuerpo.

Formato: `type: subject`

Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`
Subject: breve, en inglés, imperativo.

Ejemplos: `feat: add quiz result summary`, `fix: prevent duplicate vocabulary entries`

## Ejecución

- Responde siempre en español.
- No dejes procesos persistentes corriendo sin avisar.
- Si un comando puede tardar o modificar datos, avisa antes.