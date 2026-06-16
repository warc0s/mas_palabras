# API

The current HTTP surface supports the app itself: forms, redirects, and JSON download.

## Current Surface

- App Router pages for reads and rendering
- server actions for forms and internal mutations
- internal route handlers only for concrete I/O needs

## Real HTTP Endpoints

### `GET /export_words`

- returns all words as downloadable JSON
- responds with `Content-Disposition: attachment; filename="words.json"`
- exports the current SQLite vocabulary

### `GET /end_quiz`

- ends the active quiz session if one exists
- rejects requests with 403 when `sec-fetch-site` is `cross-site` or `same-site`
- clears the quiz cookie
- redirects to `/quiz` with an informational message

## Important Note

Treat route handlers as app internals, not as a stable external API contract.
