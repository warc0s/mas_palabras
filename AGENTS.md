# AGENTS.md - Mas Palabras

Mas Palabras is a Next.js app for managing a personal vocabulary library and practicing it with adaptive quizzes.

## Current Repository State

- Runtime: Next.js App Router with TypeScript.
- Persistence: Prisma with SQLite.
- Mutations: server actions in `lib/actions/`.
- Domain logic: services in `lib/`.
- Direct HTTP: minimal route handlers in `app/export_words/route.ts` and `app/end_quiz/route.ts`.
- Interface language: app UI is internationalized through `lib/i18n.ts` and the language selector in the shell.

## Mandatory Reading Before Code Changes

Read these files before every work session:

1. This file (`AGENTS.md`)
2. Every guide in `Guides/`
3. The specific guide for the area you will touch, a second time with extra care

## Guide Map

- `Guides/architecture.md` - stack, file structure, app startup flow
- `Guides/backend.md` - server actions, route handlers, business logic
- `Guides/api.md` - current HTTP surface: route handlers and server actions
- `Guides/database.md` - Prisma, SQLite, schema, migrations
- `Guides/frontend.md` - App Router, components, Tailwind, styling boundaries, i18n
- `Guides/security.md` - validation, quiz cookie, public-release risks
- `Guides/testing.md` - test commands, structure, conventions
- `Guides/deploys.md` - local setup, Prisma, standalone build, Node startup
- `Guides/import-export.md` - JSON format, import options, error codes

## Project Structure

```text
app/                # Next.js App Router routes
components/         # Shell, banner, table, and reusable UI
lib/                # Prisma, domain services, validation, i18n, and server actions
prisma/             # schema.prisma and migrations
tests/              # Vitest tests
Guides/             # Reference documentation
```

## Principles

- Prefer a solid base over fast features.
- Keep changes small and focused.
- If a decision changes scope or direction, pause and ask for confirmation.
- Fix the root cause instead of masking states.
- Close the loop: explore, change, validate, summarize.

## Code Rules

- Code, identifiers, comments, documentation, and default server messages must be in English.
- User-facing UI copy must go through `lib/i18n.ts` when it is part of the interactive interface.
- Pages and route handlers must stay light. Business logic belongs outside `app/`.
- Components present data; rules live in `lib/`.
- Centralize validation and shared rules.
- Comments are only for non-obvious decisions.
- Everything must be typed. `pnpm build` must pass without TypeScript errors.

## Domain Rules

The current model revolves around 4 tables: `word`, `language`, `tag`, and `quiz_session`.

Rules that must not be broken:

- Duplicates are detected by `(language_id, normalized_english_word)`. Normalization lives in `lib/text.ts`: `trim`, NFD, Unicode mark removal (`\p{Mark}`), format character removal (`\p{Cf}`), and `toLocaleLowerCase("es")`.
- `Language` and `Tag` use soft-delete (`active = false`) when associated words exist.
- Progress tracking (`times_practiced`, `times_correct`, `last_practiced`) updates on every quiz answer.
- A word needs practice when it has never been practiced, has fewer than 3 attempts, or has accuracy below 70%.

Before changing the schema, document the reason, review impact on existing data, and define a migration.

## Validation

- Every functional change needs explicit validation.
- Prefer automated tests. If there are no tests, validate manually and document what you checked.
- Quiz, scoring, progress, import/export, and persistence changes require careful validation.
- Documentation-only changes should state why tests do not apply.

## Security

- Never commit secrets. Sensitive values belong in `.env`.
- Validate user input in server actions or services.
- Confirm intent before destructive deletes or irreversible migrations.
- The app currently has no authentication or rate limiting. See `Guides/security.md` for known gaps.

## Documentation

- Guides are the project source of truth.
- Any behavior change that affects a guide must update that guide.
- If you add a route, server action, route handler, model, helper, component, or behavior, update the corresponding guide.
- Avoid duplicated documentation. Each topic should have one source guide.
- Guide format: plain text, `#` headings, backticks for code. No tables.

## Git

Use Conventional Commits, one line, no body.

Format: `type: subject`

Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`

Subject: short, English, imperative.

Examples: `feat: add quiz result summary`, `fix: prevent duplicate vocabulary entries`

## Commands

- `pnpm dev`
- `pnpm build`
- `pnpm start`
- `pnpm start:local`
- `pnpm test`

## Collaboration Workflow

All repository work must follow this flow:

1. Start each day or session from `main`.
2. Create a dedicated branch for that day or session.
3. Keep commits focused and validated.
4. Run `pnpm test` and `pnpm build` before opening a PR when the change can affect runtime behavior.
5. Commit all intended changes to the session branch.
6. Push the branch and open a pull request targeting `main`.
7. Merge into `main` only after PR checks pass and review feedback is resolved.
