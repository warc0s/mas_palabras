# Import / Export

## Export

Ruta: `GET /export_words`

Devuelve un array JSON descargable con esta forma:

```json
[
  {
    "id": 1,
    "english_word": "house",
    "translation": "casa",
    "explanation": "donde la gente vive",
    "language": "Inglés",
    "tag": "A1",
    "times_practiced": 0,
    "times_correct": 0,
    "accuracy": 0,
    "last_practiced": null,
    "created_at": "2026-04-03T15:00:00.000Z"
  }
]
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
    "tag": "A1",
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

- `create` — crea idiomas o etiquetas inexistentes
- `skip` — omite la palabra

## Parseo de fechas

Se aceptan:

- `dd/mm/yyyy` (también con guiones `dd-mm-yyyy`)
- `yyyy/mm/dd`
- ISO 8601
- timestamp Unix numérico en segundos (solo como `number`, no como string)
- `null`, `""`, `Nunca`, `nunca`, `never`

Restricciones:

- En los formatos nativos (`new Date(string)`) el año debe estar entre `2000` y `2100` (ambos incluidos). Fechas fuera de ese rango se rechazan con `invalid_date_format`.
- Los strings puramente numéricos (como `"5"` o `"2024"`) se rechazan con `invalid_date_format`. Son ambiguos: V8 los interpreta de formas sorprendentes (p. ej. `"5"` pasa a año 2001). Si quieres usar un timestamp Unix, envía un `number`, no un string.
- Los formatos `dd/mm/yyyy` y `yyyy/mm/dd` también validan el año dentro del rango `2000`-`2100`.

## Parseo de estadísticas

- `times_practiced` y `times_correct` son opcionales e independientes en el JSON.
- Si el JSON trae solo `times_practiced`, en modo `update` solo se actualiza ese campo; `times_correct` se preserva. Lo simétrico aplica si solo viene `times_correct`.
- Invariante `times_correct <= times_practiced` validada en los tres caminos:
  - create: contra defaults (0/0). `{ times_correct: 1 }` solo se rechaza porque implica 1 > 0.
  - update con ambos campos: contra los valores nuevos.
  - update parcial: contra los valores efectivos (campo nuevo + valor existente del otro).
- Cualquier violación se reporta como `invalid_stats`.
- Solo se aceptan `number` y `string` con formato `/^-?\d+$/`. Cualquier otro tipo (booleanos, arrays, objetos, hex, exponenciales) se rechaza con `invalid_integer`.

## Modelo de transacciones

Cada línea del JSON se procesa en su propia transacción Prisma (`$transaction` por item).

- Si un item falla (error inesperado, `P2002`, FK roto, etc.), los demás items ya importados se conservan.
- Pierde atomicidad entre items a cambio de resiliencia: mejor importar 48 de 50 líneas que perder todo por un fallo en la línea 49.
- `P2002` (unique constraint) en `create` o `update` se clasifica como `duplicate` (skipped): normalmente significa que la palabra se creó entre el `findFirst` y el `create` (race condition con otro proceso o con un item anterior).
- Cualquier otro error de base de datos se registra como `unknown_error` (error) y se continúa con el siguiente item.
- Los conjuntos de `createdLanguages` / `createdTags` solo se alimentan tras confirmar el commit de la mini-tx del item, para no reportar relaciones que se hayan rollback-eado.
- `pendingNewRecords` sigue como red de seguridad intra-import, aunque con una tx por item el `findFirst` ya ve los commits previos.

## Códigos de incidencia por línea

- `missing_fields`
- `empty_fields`
- `invalid_fields`
- `invalid_record`
- `negative_stats`
- `invalid_stats`
- `invalid_integer`
- `invalid_date_format`
- `language_missing`
- `tag_missing`
- `duplicate`
- `unknown_error`
