# Public Product Checklist

This checklist tracks the work needed to move Mas Palabras from a personal vocabulary app toward a public, reference-quality product.

## P0 Before Running a Public Instance

- [x] Audit tracked files for obvious secrets and generated local data.
- [x] Ignore local tool folders such as `.zcode/`.
- [x] Move public-facing repository documentation to English.
- [x] Add an interface language selector.
- [x] Add English, Spanish, and Catalan UI dictionaries.
- [x] Add CI for tests and production build.
- [ ] Add authentication.
- [ ] Add route protection for private app areas.
- [ ] Associate words, languages, tags, and quiz sessions with a user.
- [ ] Enforce authorization in domain services, not only in UI.
- [ ] Convert `GET /export_words` into an authenticated per-user export.
- [ ] Replace quiz-ending mutation through GET with a safer explicit mutation flow.
- [ ] Add rate limiting for expensive actions.
- [ ] Add security headers and a CSP strategy.
- [ ] Decide whether to self-host Font Awesome, replace it, or protect it with CSP/SRI.
- [ ] Add integration or E2E tests for auth, vocabulary CRUD, quiz, import, and export.

## P1 Product Quality

- [ ] Rename the conceptual source-word model away from `englishWord`.
- [ ] Separate interface language, base language, and target language.
- [ ] Add collections or decks.
- [ ] Allow multiple tags per entry.
- [ ] Add richer lexical entries with examples, notes, senses, and alternative translations.
- [ ] Add a spaced-repetition model based on cards and review events.
- [ ] Add session summaries that explain progress and next review load.
- [ ] Improve import with CSV/TSV support and preview.
- [ ] Add accessible confirmation dialogs instead of `window.confirm`.
- [ ] Add automated accessibility checks.

## P2 Public Ecosystem

- [ ] Add optional public decks with attribution and licenses.
- [ ] Add private sharing links.
- [ ] Add moderation and reporting for public content.
- [ ] Add public API design only after permissions and rate limits are complete.
- [ ] Add installable PWA support.
- [ ] Add offline review for prepared sessions.

## P3 Later Expansion

- [ ] Add classroom or group spaces.
- [ ] Add creator profiles.
- [ ] Add public deck discovery.
- [ ] Add billing only if product direction requires it.
