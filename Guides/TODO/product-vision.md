# Product Vision

Mas Palabras is currently a well-structured personal vocabulary app. It lets a user create words, classify them by language and tag, browse a library, edit and delete entries, import and export JSON, and practice with a basic adaptive quiz.

The next product step is not adding more buttons. The important shift is from a global personal database to a trustworthy personal vocabulary system with ownership, privacy, and a memory engine.

## Core Idea

Mas Palabras should become a living personal dictionary with a memory system.

Users should be able to capture vocabulary they encounter, enrich it with context, organize it into useful study structures, practice it at the right time, and keep ownership of their data.

## Product Pillars

1. Capture: save vocabulary quickly from forms, imports, text, or external sources.
2. Understand: add translations, senses, examples, notes, usage, and context.
3. Remember: turn lexical entries into review cards and schedule them.
4. Visualize: show library, progress, review load, and weak areas clearly.
5. Own: keep data private by default, exportable, deletable, and shared only by explicit choice.

## Public Trust Requirements

Mas Palabras may contain personal study material, work vocabulary, travel notes, or sensitive examples. A public service version must treat that data seriously.

The product is not ready as a public multi-user service until:

- every private object belongs to a user or explicit shared space
- every read and mutation checks authorization server-side
- export is personal, not global
- delete-account and full data export flows exist
- public sharing is opt-in
- logs avoid sensitive content
- basic abuse protection exists

## Learning Requirements

The current quiz stores counters directly on the word. That is useful for a small personal tool, but a serious memory product needs cards and review events.

The future model should support:

- recognition and production cards
- cloze cards
- listening or dictation cards
- next-review dates
- review history
- answer ratings beyond correct/incorrect
- problem-card detection

## Design Requirements

The app should feel like a focused vocabulary tool, not a generic SaaS dashboard.

Good design means:

- the dashboard makes today's next action obvious
- the library works with both small and large collections
- practice sessions remove distractions
- mobile use is comfortable
- visual details help memory instead of adding decoration

## Internationalization Requirements

The repository now supports English, Spanish, and Catalan interface dictionaries. Product-language support still needs deeper domain work.

Future work should clearly separate:

- interface language
- source or target language of a lexical entry
- user's base language
- direction of practice

## Repository Publication Bar

For source-code publication, the repository should provide:

- no tracked secrets
- no tracked local databases or build output
- English README with screenshots
- English contribution and security docs
- CI that runs tests and build
- clear warning that the deployed app is personal-use grade until auth and authorization are implemented
