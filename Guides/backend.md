# Backend — Blueprints y Lógica

## Blueprint `words` (blueprints/words.py)

### Rutas

- `GET /` -> `index()` — Dashboard: cuenta palabras, idiomas, features, precisión media, pendientes
- `GET|POST /maspalabras` -> `create_word()` — Formulario alta palabra
- `GET /verpalabras` -> `view_words()` — Listado paginado con filtros y ordenación
- `GET /get_word/<id>` -> `get_word()` — JSON de una palabra
- `GET|POST /edit/<id>` -> `edit_word()` — Editar palabra
- `POST /delete/<id>` -> `delete_word()` — Eliminar palabra
- `POST /bulk_delete` -> `bulk_delete_words()` — Borrado masivo (JSON body `{word_ids: [...]}`)
- `GET|POST /import_words` -> `import_words()` — Importar desde JSON file
- `GET /export_words` -> `export_words()` — Exportar todas como JSON attachment

### Parámetros de `view_words` (query string)

- `search` — texto libre (busca en english_word, translation, explanation con ILIKE)
- `language` — ID idioma (0 = todos)
- `feature` — ID categoría (0 = todas)
- `sort_by` — `english_word`, `translation`, `created_at_desc`, `created_at_asc`, `accuracy_desc`, `accuracy_asc`, `needs_practice`
- `page` — página (default 1)
- `per_page` — items/página (1–100, default 25)

### Lógica de importación (`process_import`)

Recibe lista de dicts. Para cada item:
1. `_sanitize_import_item()` — valida campos requeridos, normaliza, parsea stats y fechas
2. `_ensure_relations()` — resuelve/crea Language y Feature
3. `_find_existing_word()` — busca duplicado por idioma + normalized_english
4. Si existe → skip o update según `overwrite_mode`
5. Si no existe → `_build_new_word()` y bulk_save

`overwrite_mode`: `skip` (default) o `update`
`create_missing_mode`: `create` (default) o `skip`

---

## Blueprint `quiz` (blueprints/quiz.py)

### Rutas

- `GET|POST /quiz` -> `configure_quiz()` — Config + inicio sesión
- `GET|POST /quiz_question` -> `quiz_question()` — Mostrar pregunta / procesar respuesta
- `GET /end_quiz` -> `end_quiz()` — Forzar fin de sesión

### Flujo del quiz

```
configure_quiz [POST]
  → cierra sesión activa si existe
  → filtra palabras por language, feature, difficulty
  → genera UUID, shuffle(word_ids)
  → crea QuizSession en BD
  → session["quiz_session_id"] = UUID
  → redirect /quiz_question

quiz_question [GET]
  → recupera QuizSession por cookie
  → lee word_ids[current_index]
  → determina quiz_type (to_spanish/to_original/mixed)
  → render quiz.html con stats

quiz_question [POST]
  → normaliza respuesta del usuario vs correcta
  → actualiza Word.times_practiced, times_correct, last_practiced
  → avanza current_index
  → si completo → _finalize_quiz() con stats

query param ?skip=1 → avanza sin contar acierto
```

### Tipos de quiz
- `to_spanish` — muestra english_word, espera translation
- `to_original` — muestra translation, espera english_word
- `mixed` — alterna entre ambos

### Filtros de dificultad (`only_difficult`)
- `all` — todas las palabras
- `needs_practice` — times_practiced < 3 OR accuracy < 70%
- `new` — times_practiced == 0

---

## Blueprint `settings` (blueprints/settings.py)

- `GET|POST /settings` — Gestión idiomas y categorías
- `POST /delete_language/<id>` — Elimina o desactiva idioma
- `POST /delete_feature/<id>` — Elimina o desactiva categoría

- Si el idioma/categoría tiene palabras -> soft-delete (`active=False`)
- Si no tiene palabras -> hard-delete
- Si se da de alta uno que existe inactivo -> se reactiva

---

## Blueprint `api_v1` (blueprints/api.py)

Ver guía `api.md`.

## Helpers clave

- `utils/text.py` -> `normalize_text(value)` — `unicodedata.normalize("NFD", casefold())` + quitar categoría Mn. Usado para comparar respuestas y detectar duplicados.
- `utils/database.py` -> `init_db(app)` — Wrapper de `db.init_app()`
- `config.py` -> `apply_env_overrides(app)` — Lee env vars y pisa config de la app
