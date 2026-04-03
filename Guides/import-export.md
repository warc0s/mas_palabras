# Import / Export

## Export

Ruta: `GET /export_words`

Devuelve un array JSON descargable con esta forma:

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
  "created_at": "2026-04-03T15:00:00.000Z"
}
```

## Import

Ruta: `/import_words`

El formulario acepta un JSON array con objetos como:

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
    "last_practiced": "2026-04-03T15:00:00Z"
  }
]
```

## Opciones

### Duplicados

- `skip` — omite la palabra si ya existe por idioma + palabra normalizada
- `update` — actualiza la existente

### Relaciones faltantes

- `create` — crea idiomas o características inexistentes
- `skip` — omite la palabra

## Parseo de fechas

Se aceptan:

- ISO 8601
- `dd/mm/yyyy`
- `dd-mm-yyyy`
- `yyyy/mm/dd`
- timestamp Unix en segundos
- `null`, `""`, `Nunca`, `nunca`

## Códigos de incidencia por línea

- `missing_fields`
- `empty_fields`
- `invalid_fields`
- `invalid_record`
- `negative_stats`
- `invalid_integer`
- `invalid_date_format`
- `language_missing`
- `feature_missing`
- `duplicate`
