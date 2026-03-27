# Testing y Calidad

## Ejecutar tests

```bash
pytest                    # Suite completa
pytest tests/test_app.py  # Solo integración
mypy --config-file mypy.ini  # Chequeo estático
```

## Estructura de tests

`tests/test_app.py` — Tests de integración con `unittest.TestCase`:

- `test_config_values_loaded_from_environment` — Config se lee de env vars
- `test_404_handler_renders_custom_template` — Error handler 404
- `test_internal_error_handler_returns_500` — Error handler 500
- `test_delete_language_requires_post` — 405 en GET
- `test_delete_language_without_words_removes_language` — Hard-delete
- `test_delete_language_with_words_marks_inactive` — Soft-delete
- `test_delete_word_via_post_removes_record` — Borrado palabra
- `test_bulk_delete_*` — Borrado masivo: JSON requerido, elimina, rechaza IDs inválidos
- `test_word_form_blocks_normalized_duplicate` — "Café" bloquea "Cafe"
- `test_verpalabras_pagination_controls` — Paginación correcta
- `test_word_to_dict_includes_iso_dates` — Serialización
- `test_accuracy_sort_places_unpracticed_last` — Ordenación
- `test_process_import_reports_per_line_and_persists` — Import con errores
- `test_needs_practice_sorting_prioritises_new_words` — Prioridad práctica
- `test_quiz_session_persists_progress_and_skip` — Flujo quiz completo
- `test_dashboard_accuracy_stats_reflect_practice` — Stats dashboard
- `test_quiz_word_selection_is_unique` — Sin duplicados en pool
- `test_import_handles_normalized_duplicates_and_timestamps` — Import + export
- `test_production_session_security_settings` — Config producción
- `test_api_languages_returns_language_key` — API languages
- `test_api_words_crud_flow` — API CRUD completo
- `test_api_words_rejects_normalized_duplicates` — API duplicados
- `test_get_word_returns_json_error_when_missing` — API error 404

`tests/test_typing.py` — Validaciones de tipado.

## Setup/Teardown (patrón en todos los tests)

```python
def setUp(self):
    # Crea SQLite temporal en /tmp
    # Configura env vars
    # create_app("testing")
    # db.create_all()
    # self.client = app.test_client()

def tearDown(self):
    # db.session.remove()
    # db.drop_all()
    # Borra fichero temporal
```

## Helpers de test

```python
_create_language(name=None, active=True)  # Crea idioma de prueba
_create_feature(name=None, active=True)   # Crea feature de prueba
_create_word(language=None, feature=None, **kwargs)  # Crea palabra
```

## mypy

Config en `mypy.ini`. Falla si hay funciones sin tipar en los módulos supervisados. Todos los blueprints y utils están anotados.

## Convenciones

- Tests en español (nombres de variables en inglés, mensajes en español)
- Cada test es autónomo: BD limpia en setUp
- Se testean respuestas HTTP, contenido HTML y estado de BD
- Los tests de API usan `json=` param del test client
- Los tests de formularios usan `data=` + `follow_redirects=True`
