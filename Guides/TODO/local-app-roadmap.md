# Local App Roadmap

This checklist tracks work that makes Mas Palabras easier to install, maintain, and use as a personal vocabulary app.

## P0 Repository and Install Quality

- [x] Audit tracked files for obvious secrets and generated local data.
- [x] Ignore local tool folders such as `.zcode/`.
- [x] Move public-facing repository documentation to English.
- [x] Add an interface language selector.
- [x] Add English, Spanish, and Catalan UI dictionaries.
- [x] Add CI for tests and production build.
- [ ] Document SQLite backup and restore.
- [ ] Add a first-run or sample-data flow.
- [ ] Replace quiz-ending mutation through GET with a safer explicit mutation flow.
- [ ] Add security headers and a CSP strategy.
- [ ] Decide whether to bundle Font Awesome locally or replace it.
- [ ] Add integration or E2E tests for vocabulary CRUD, quiz, import, and export.

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

## P2 Local Experience

- [ ] Add installable PWA support.
- [ ] Add offline review for prepared sessions.
- [ ] Add a compact backup export from the settings page.
- [ ] Add a restore flow with preview and conflict handling.
