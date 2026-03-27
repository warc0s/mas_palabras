# Base de Datos

## ORM

SQLAlchemy vía Flask-SQLAlchemy. Inicialización en `utils/database.py`:
```python
db = SQLAlchemy()
init_db(app)  # llama db.init_app(app)
```

## Esquema (4 tablas)

### `word`

- `id` — Integer PK, auto-increment
- `english_word` — String(100), NOT NULL, indexed
- `normalized_english_word` — String(100), NOT NULL, indexed. casefold + sin acentos. Se auto-actualiza via `@validates('english_word')`
- `translation` — String(100), NOT NULL
- `explanation` — String(300), nullable
- `language_id` — Integer FK -> `language.id`, NOT NULL, indexed
- `feature_id` — Integer FK -> `feature.id`, NOT NULL, indexed
- `times_practiced` — Integer, default 0
- `times_correct` — Integer, default 0
- `last_practiced` — DateTime, nullable
- `created_at` — DateTime, default `datetime.utcnow`

Unique constraint: `uq_words_language_normalized` sobre `(language_id, normalized_english_word)`

### `language`

- `id` — Integer PK
- `language` — String(50), NOT NULL, UNIQUE
- `active` — Boolean, default True, NOT NULL

### `feature`

- `id` — Integer PK
- `feature` — String(50), NOT NULL, UNIQUE
- `active` — Boolean, default True, NOT NULL

### `quiz_session`

- `id` — Integer PK
- `session_id` — String(36), UUID v4, NOT NULL
- `word_ids` — Text, JSON array de IDs
- `created_at` — DateTime
- `total_questions` — Integer, default 0
- `correct_answers` — Integer, default 0
- `current_index` — Integer, default 0, NOT NULL
- `is_completed` — Boolean, default False, NOT NULL
- `quiz_config` — Text, JSON con config del quiz

## Relaciones

```
Language 1──N Word  (backref='language')
Feature  1──N Word  (backref='feature')
```

## Métodos clave del modelo Word

```python
word.to_dict()           # dict con accuracy calculada, fechas ISO, nombres de language/feature
word.get_accuracy()      # (times_correct / times_practiced * 100) or 0
word.needs_practice()    # True si: nunca practicada, <3 intentos, o <70% accuracy
word.practice_priority() # 3=nueva, 2=<3 intentos, 1=<70% accuracy, 0=ok
word.set_normalized_english()  # actualiza normalized_english_word
```

## Migraciones

Alembic vía Flask-Migrate. Las migraciones están en `migrations/versions/`.

```bash
flask db migrate -m "descripción"
flask db upgrade
```

Dos migraciones existentes:
1. `2024022501_initial_schema` — esquema inicial
2. `2024072001_normalized_words_and_quiz_session` — añade normalized_english_word + QuizSession

## Normalización SQLite

`_normalise_sqlite_uri()` en `app.py` resuelve rutas relativas de SQLite al directorio raíz del proyecto. Crea el directorio padre si no existe.

## Convención de soft-delete

Language y Feature nunca se borran de verdad si tienen palabras asociadas. Se marca `active=False`. Al listar se filtra por `active=True` salvo que se pida explícitamente lo contrario.
