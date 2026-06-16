# Import / Export

## Export

Route: `GET /export_words`

Returns a downloadable JSON array:

```json
[
  {
    "id": 1,
    "english_word": "house",
    "translation": "casa",
    "explanation": "where people live",
    "language": "English",
    "tag": "A1",
    "times_practiced": 0,
    "times_correct": 0,
    "accuracy": 0,
    "last_practiced": null,
    "created_at": "2026-04-03T15:00:00.000Z"
  }
]
```

The download filename is `words.json`.

## Import

Route: `/import_words`

The form accepts a JSON array:

```json
[
  {
    "english_word": "house",
    "translation": "casa",
    "explanation": "where people live",
    "language": "English",
    "tag": "A1",
    "times_practiced": 2,
    "times_correct": 1,
    "last_practiced": "2026-04-03T15:00:00Z"
  }
]
```

## Options

### Duplicates

- `skip` - skip the word when it already exists by language plus normalized word
- `update` - update the existing word

### Missing Relations

- `create` - create missing languages or tags
- `skip` - skip the word

## Date Parsing

Accepted:

- `dd/mm/yyyy`, also with dashes
- `yyyy/mm/dd`
- ISO 8601
- numeric Unix timestamp in seconds, only as `number`
- `null`, `""`, `Never`, `never`

Restrictions:

- Native date parsing must produce a year from `2000` through `2100`.
- Purely numeric strings such as `"5"` or `"2024"` are rejected as `invalid_date_format`.
- If you want a Unix timestamp, send a JSON number, not a string.

## Stat Parsing

- `times_practiced` and `times_correct` are optional and independent.
- In `update` mode, partial stat updates preserve missing fields.
- `times_correct <= times_practiced` is validated on create, full update, and partial update.
- Violations are reported as `invalid_stats`.
- Integers accept JSON numbers and strings matching `/^-?\d+$/`.
- Booleans, arrays, objects, hex strings, and exponent notation are rejected as `invalid_integer`.

## Transaction Model

Every JSON item is processed in its own Prisma transaction.

- If one item fails, previously imported items stay committed.
- This trades cross-item atomicity for resilience.
- Prisma `P2002` is classified as duplicate skipped.
- Other database errors are recorded as `unknown_error` and processing continues.
- `createdLanguages` and `createdTags` are updated only after each item transaction commits.

## Per-Item Incident Codes

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
