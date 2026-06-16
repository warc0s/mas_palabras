# Contributing

Thanks for considering a contribution to Mas Palabras.

## Development Flow

1. Start from `main`.
2. Create a focused branch for the session or issue.
3. Keep changes small and related.
4. Update guides when behavior changes.
5. Run validation before opening a PR.
6. Open a pull request targeting `main`.

## Commands

```bash
pnpm install
cp .env.example .env
pnpm prisma:migrate:dev --name init
pnpm test
pnpm build
```

## Commit Style

Use Conventional Commits:

```text
type: subject
```

Allowed types:

- `feat`
- `fix`
- `docs`
- `chore`
- `refactor`
- `test`

Examples:

```text
feat: add locale selector
fix: prevent duplicate vocabulary entries
docs: document public release risks
```

## Code Expectations

- Code, identifiers, comments, and docs are in English.
- User-facing interface copy belongs in `lib/i18n.ts`.
- Pages and route handlers stay light.
- Domain rules live in `lib/`.
- Server-side validation is required for user input.
- Do not commit secrets, local databases, logs, `.env`, `.next`, or generated output.

## Pull Requests

Every PR should include:

- a short summary
- validation performed
- screenshots for meaningful UI changes
- guide updates when behavior changes

CI runs `pnpm test` and `pnpm build`.
