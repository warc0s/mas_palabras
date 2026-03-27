# Import / Export de Palabras

## Export

Ruta: `GET /export_words`
Formato: JSON array, descarga como `palabras.json`

Cada objeto:
```json
{
  "id": 1,
  "english_word": "house",
  "translation": "casa",
  "explanation": "donde la gente vive",
  "language": "Inglés",
  "feature": "A1",
  "times_practiced": 0,
  "times_correct": 0,
  "accuracy": 0,
  "last_practiced": null,
  "created_at": "2024-02-25T10:00:00"
}
```

## Import

Ruta: `GET|POST /import_words`

### Formato esperado (JSON array)

```json
[
  {
    "english_word": "house",
    "translation": "casa",
    "explanation": "donde la gente vive",
    "language": "Inglés",
    "feature": "A1",
    "times_practiced": 2,
    "times_correct": 1,
    "last_practiced": "2024-07-10T12:00:00Z"
  }
]
```

Campos requeridos: `english_word`, `translation`, `language`, `feature`
Opcionales: `explanation`, `times_practiced`, `times_correct`, `last_practiced`

### Parseo de `last_practiced`

Acepta múltiples formatos:
- ISO 8601: `"2024-07-10T12:00:00Z"`, `"2024-07-10T15:00:00+02:00"`
- Fechas: `"2024-07-10"`, `"10/07/2024"`, `"10-07-2024"`, `"2024/07/10"`
- Timestamp Unix: `1720612800`
- Valores nulos: `null`, `""`, `"Nunca"`, `"nunca"` → `None`

### Opciones del formulario

Duplicados (`overwrite_duplicates`):
- `skip` (default) — omite palabras duplicadas, las cuenta como skipped
- `update` — sobrescribe translation, explanation, feature_id (y stats si vienen)

Datos faltantes (`create_missing`):
- `create` (default) — crea idiomas/categorías que no existan
- `skip` — omite palabras cuyo idioma o categoría no exista en BD

### Lógica de procesamiento (process_import en words.py)

```
Por cada item en el array:
  1. sanitize: valida campos, normaliza texto, parsea stats/fechas
     - Errores → se registran con código (missing_fields, empty_fields, invalid_fields, negative_stats...)
  2. ensure_relations: resuelve language y feature por nombre
     - Si no existen y create_missing="create" → los crea
     - Si no existen y create_missing="skip" → salta la palabra
  3. find_existing_word: busca por (language_id, normalized_english_word)
     - Si existe y overwrite="skip" → skipped
     - Si existe y overwrite="update" → actualiza campos
     - Si no existe → crea nueva
  4. bulk_save de todas las nuevas
  5. commit (o rollback si falla)
```

### Detección de duplicados

Se compara `normalized_english_word` (casefold + sin acentos).
"Café" == "cafe" == "CAFÉ" → mismo duplicado.

### Resultado (ImportResult)

```python
{
  "success": 5,        # palabras creadas/actualizadas
  "skipped": 2,        # omitidas (duplicados o datos faltantes)
  "errors": 1,         # errores (registro inválido)
  "created_languages": ["Francés"],
  "created_features": ["B2"],
  "issues": [
    {"line": 3, "code": "duplicate", "action": "skipped"},
    {"line": 7, "code": "missing_fields", "action": "error"}
  ]
}
```

### Códigos de error por línea

- `missing_fields` (error) — Faltan campos requeridos
- `empty_fields` (error) — Campos vacíos tras strip
- `invalid_fields` (error) — TypeError/ValueError al leer campos
- `invalid_record` (error) — Item no es dict
- `negative_stats` (error) — times_practiced/correct < 0
- `invalid_date_format` (error) — last_practiced no parseable
- `invalid_integer` (error) — times_practiced/correct no son int
- `language_missing` (skipped) — Idioma no existe y create_missing="skip"
- `feature_missing` (skipped) — Feature no existe y create_missing="skip"
- `duplicate` (skipped) — Palabra ya existe y overwrite="skip"
