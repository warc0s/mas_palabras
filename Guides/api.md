# API REST v1

Prefijo: `/api/v1`
Blueprint: `blueprints/api.py`
CORS: habilitado para todo origen (`*`)

## Formato de respuesta

```json
// Éxito
{ "data": { ... }, "meta": { "count": N } }

// Error
{ "error": { "code": "error_code", "message": "Descripción", "details": { ... } } }
```

## Endpoints

### Words — /api/v1/words

- `GET /words` — Listar. Filtros query: `language_id`, `feature_id`. Status 200.
- `GET /words/<id>` — Obtener una. 200 o 404.
- `POST /words` — Crear. Body: `{english_word, translation, language_id, feature_id, explanation?}`. 201, 400 o 409.
- `PUT /words/<id>` — Actualizar. Mismo body que POST. 200, 400, 404 o 409.
- `DELETE /words/<id>` — Eliminar. 200 o 404.

Validaciones:
- Campos requeridos: `english_word`, `translation`, `language_id`, `feature_id`
- `language_id` y `feature_id` deben existir en BD
- No se permiten duplicados normalizados por idioma (error 409 `duplicate_word`)

### Languages — /api/v1/languages

- `GET /languages` — Listar. Filtro: `?include_inactive=true`. 200.
- `GET /languages/<id>` — Obtener. 200 o 404.
- `POST /languages` — Crear. Body: `{language, active?}`. 201 o 409.
- `PUT /languages/<id>` — Actualizar. Body: `{language?, active?}`. 200 o 409.
- `DELETE /languages/<id>` — Si tiene palabras -> soft-delete (`active=false`), respuesta incluye `meta.action: "deactivated"` y `meta.affected_words`. Si no -> hard-delete. 200 o 404.

### Features — /api/v1/features

- `GET /features` — Listar. Filtro: `?include_inactive=true`. 200.
- `GET /features/<id>` — Obtener. 200 o 404.
- `POST /features` — Crear. Body: `{feature, active?}`. 201 o 409.
- `PUT /features/<id>` — Actualizar. Body: `{feature?, active?}`. 200 o 409.
- `DELETE /features/<id>` — Mismo soft-delete que languages. 200 o 404.

## Códigos de error

- 400 `invalid_json` — Body no es JSON o malformado
- 400 `missing_fields` — Faltan campos requeridos
- 400 `invalid_field` — Campo con tipo incorrecto
- 404 `word_not_found` / `language_not_found` / `feature_not_found` — ID no existe
- 409 `duplicate_word` / `duplicate_language` / `duplicate_feature` / `integrity_error` — Duplicado o restricción BD

## Helpers internos

- `_ensure_json()` — Valida que el body sea JSON dict
- `_validate_required(data, fields)` — Comprueba campos presentes
- `_check_word_duplicate()` — Busca por normalized_english_word + language_id
- `_serialize_word/language/feature()` — Convierte modelo a dict plano

## Nota

La API no requiere autenticación. Si se necesita, habría que añadirla como middleware o decorator.
