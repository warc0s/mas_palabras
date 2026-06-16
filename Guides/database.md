# Database

## ORM

The app uses Prisma with SQLite.

- source schema: `prisma/schema.prisma`
- client singleton: `lib/prisma.ts`
- migrations: `prisma/migrations/`

## Tables

### `word`

- `id`
- `english_word`
- `normalized_english_word`
- `translation`
- `explanation`
- `language_id`
- `tag_id`
- `times_practiced`
- `times_correct`
- `last_practiced`
- `created_at`

Unique constraint:

`(language_id, normalized_english_word)`

### `language`

- `id`
- `language`
- `active`
- `created_at`
- `updated_at`

### `tag`

- `id`
- `tag`
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

## Domain Rules

- duplicates are detected by language plus normalized source word
- `normalized_english_word` is computed in `lib/text.ts` with `trim`, NFD, Unicode mark removal (`\p{Mark}`), format character removal (`\p{Cf}`), and `toLocaleLowerCase("es")`
- `Language` and `Tag` use soft-delete when associated words exist
- each quiz answer updates `times_practiced`, `times_correct`, and `last_practiced`
- a word needs practice when it has never been practiced, has fewer than 3 attempts, or has accuracy below 70%

## JSON Fields

Prisma models `quiz_session.word_ids` as `wordIdsJson` and `quiz_session.quiz_config` as `quizConfigJson`.
Both are stored as JSON text in SQLite.

## Migrations

Common commands:

```bash
pnpm prisma:migrate:dev --name change_name
pnpm prisma:migrate:deploy
pnpm prisma:generate
```

## Database Path

- For Prisma CLI, `.env` uses `DATABASE_URL="file:./dev.db"` and Prisma resolves it from `prisma/`.
- For `pnpm dev`, `pnpm build`, and `pnpm start:local`, scripts set an absolute path to `prisma/dev.db`.
- For `pnpm start`, export an absolute `DATABASE_URL` in the environment.
- If this strategy changes, verify `dev`, `build`, `start:local`, `start`, and Prisma CLI point to the expected database.
