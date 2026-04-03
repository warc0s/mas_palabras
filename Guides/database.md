# Base de Datos

## ORM

Prisma con SQLite.

- esquema fuente: `prisma/schema.prisma`
- cliente singleton: `lib/prisma.ts`
- migraciones: `prisma/migrations/`

## Tablas

### `word`

- `id`
- `english_word`
- `normalized_english_word`
- `translation`
- `explanation`
- `language_id`
- `feature_id`
- `times_practiced`
- `times_correct`
- `last_practiced`
- `created_at`

Restricción única:

`(language_id, normalized_english_word)`

### `language`

- `id`
- `language`
- `active`
- `created_at`
- `updated_at`

### `feature`

- `id`
- `feature`
- `active`
- `created_at`
- `updated_at`

### `quiz_session`

- `id`
- `session_id`
- `word_ids`
- `total_questions`
- `correct_answers`
- `current_index`
- `is_completed`
- `quiz_config`
- `created_at`

## Reglas de dominio

- los duplicados se detectan por idioma + palabra inglesa normalizada
- `normalized_english_word` se calcula con NFD, eliminación de marcas y lowercase
- `Language` y `Feature` hacen soft-delete si tienen palabras asociadas
- cada respuesta de quiz actualiza `times_practiced`, `times_correct` y `last_practiced`
- una palabra necesita práctica si nunca se practicó, tiene menos de 3 intentos o precisión menor al 70%

## Migraciones

Comandos habituales:

```bash
npx prisma migrate dev --name nombre_del_cambio
npx prisma migrate deploy
npx prisma generate
```

## Ruta de la base

- Para Prisma CLI, `.env` usa `DATABASE_URL="file:./dev.db"` y la resuelve desde `prisma/`.
- Para `pnpm dev`, `pnpm build` y `pnpm start`, los scripts fijan una ruta absoluta a `prisma/dev.db`.
- Si cambias esta estrategia, asegúrate de que `dev`, `build`, `start` y Prisma CLI sigan apuntando a la misma BD.
