# Security Policy

## Supported Versions

This repository is currently maintained from `main`.

## Reporting a Vulnerability

Please open a private security advisory on GitHub if available, or contact the repository owner directly.

Do not open a public issue with exploit details for a real vulnerability.

## Current Security Status

Mas Palabras is safe to publish as source code after secrets and generated local files are kept out of git.

Known security notes:

- keep real `.env` files and SQLite databases out of git
- one state-changing quiz endpoint still uses GET
- no custom CSP
- the export route returns the current SQLite vocabulary
- Font Awesome loads from a CDN without a custom CSP or SRI

Do not expose a running instance directly to an untrusted network without adding protection at the deployment boundary.

## Secret Handling

- Keep secrets in `.env`.
- Track only `.env.example` with placeholder values.
- Never commit SQLite databases, generated builds, API tokens, private keys, or logs.
