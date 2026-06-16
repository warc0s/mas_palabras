# Frontend

## Visual Stack

- Next.js App Router
- React Server Components by default
- Client Components only for real interaction
- Tailwind CSS
- `next/font`
- Font Awesome through a global stylesheet in `app/layout.tsx`

## Main Components

- `components/site-shell.tsx` - nav, footer, shared structure
- `components/language-selector.tsx` - client language picker backed by a cookie
- `components/desktop-nav.tsx` - desktop navigation
- `components/mobile-nav.tsx` - responsive menu with Escape, backdrop, and focus restore
- `components/footer-nav.tsx` - footer navigation with `aria-current`
- `components/flash-banner.tsx` - status messages
- `components/words-table.tsx` - table with multi-select and deletion
- `components/submit-button.tsx` - pending-state submit button
- `components/page-header.tsx` - shared editorial page header

## UI Routes

- `/` - dashboard
- `/maspalabras` - create word
- `/verpalabras` - list and filter words
- `/edit/[id]` - edit word
- `/quiz` - quiz configuration
- `/quiz_question` - active question
- `/import_words` - JSON import
- `/settings` - languages and tags

## Internationalization

- Interface dictionaries live in `lib/i18n.ts`.
- Supported UI locales are English, Spanish, and Catalan.
- The active locale is stored in the `mas-palabras-locale` cookie.
- `RootLayout` reads the locale server-side and sets `<html lang>`.
- New visible interface copy should be added to `lib/i18n.ts` instead of being hardcoded in pages.
- Domain values such as a saved language name or tag name are user data and should not be translated.

## Visual Direction

The app uses an editorial personal-dictionary identity with modern surfaces:

- warm paper-like background
- rounded card stock surfaces
- clear typographic hierarchy
- dictionary-entry language for vocabulary content
- restrained rust, pine, ochre, and warm neutral palette

Shared buttons, inputs, selects, textareas, chips, and cards live in `app/globals.css`. Prefer existing classes before creating new styling.

Avoid inline SVG data URLs inside `@apply` rules. Tailwind can break on arbitrary values containing `<` or quotes; use plain CSS properties for those cases.

## Boundaries

- data-fetching pages stay as Server Components
- selection and confirmation interactions use Client Components
- forms call server actions
- submit buttons should use `SubmitButton` for pending-state behavior

## Accessibility

- `SubmitButton` is the standard form submit control.
- Mobile navigation exposes `aria-controls`, `aria-expanded`, closes on Escape/backdrop, and restores focus.
- Desktop, mobile, and footer navigation set `aria-current="page"`.
- Filter inputs in `/verpalabras` have accessible labels.
- `app/error.tsx` logs the error in `useEffect` and shows `error.digest` when present.
- `components/words-table.tsx` still uses `window.confirm` for deletes. Replace it with an accessible `ConfirmDialog` before treating deletion UX as finished.
