# Security

## Validation

- Form mutations go through server actions.
- Input validation uses Zod in `lib/validators.ts`.
- Duplicate detection and domain rules are also enforced on the server against the database.
- `GET /end_quiz` rejects requests when `sec-fetch-site` is `cross-site` or `same-site`.

## Secrets and Local Files

- `.env`, `.env.*`, `.next/`, `prisma/dev.db`, local logs, and local tool folders are ignored.
- `.env.example` is tracked and must only contain safe placeholder values.
- Do not commit real database files, tokens, keys, or generated build output.

## Errors

- `app/error.tsx` shows a generic error message and does not expose `error.message`.
- The error is logged with `console.error` in `useEffect`.
- If `error.digest` exists, it is shown as a debugging reference.

## Sessions

- The quiz uses an `httpOnly` cookie named `mas-palabras-quiz`.
- `sameSite` is `lax`.
- `secure` is enabled in production.
- Cookie clearing repeats `httpOnly`, `sameSite`, `secure`, `path`, and `maxAge: 0`.

There is no user login or full user-session system yet.

## Uploads

- Import accepts JSON only.
- The import action enforces a 10 MB limit.
- Parsing and sanitization happen server-side.

## Database

- Prisma uses typed queries.
- The app does not use manual SQL at runtime.
- SQLite access depends on `DATABASE_URL` pointing to the expected path.

## Missing Controls

- no authentication or authorization
- no rate limiting
- no custom CSP
- no action audit log
- no authenticated public API

## Risks Before Public Deployment

- `GET /export_words` downloads all vocabulary because there are no users yet.
- `GET /end_quiz` mutates state through GET, even with partial CSRF mitigation.
- Font Awesome is loaded from a CDN without a custom CSP or SRI.
- Data is global and not isolated by user.

The repository can be public as source code after secret cleanup, but the running app should not be exposed as a multi-user service until authentication, authorization, rate limiting, and per-user data isolation exist.
