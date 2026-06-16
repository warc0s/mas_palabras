# API

The current HTTP surface is designed for the app itself, not as a public API.

## Current Surface

- App Router pages for reads and rendering
- server actions for forms and internal mutations
- internal route handlers only for concrete I/O needs

## Real HTTP Endpoints

### `GET /export_words`

- returns all words as downloadable JSON
- responds with `Content-Disposition: attachment; filename="words.json"`
- currently exports the global vocabulary because the app has no users yet

### `GET /end_quiz`

- ends the active quiz session if one exists
- rejects requests with 403 when `sec-fetch-site` is `cross-site` or `same-site`
- clears the quiz cookie
- redirects to `/quiz` with an informational message

## Important Note

If a public API is needed later, design it as a new capability after authentication, authorization, and rate limiting exist.
