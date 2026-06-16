# Security Policy

## Supported Versions

This repository is currently maintained from `main`.

## Reporting a Vulnerability

Please open a private security advisory on GitHub if available, or contact the repository owner directly.

Do not open a public issue with exploit details for a real vulnerability.

## Current Security Status

Mas Palabras is safe to publish as source code after secrets and generated local files are kept out of git.

The current running app is still personal-use grade:

- no authentication
- no authorization
- no per-user data isolation
- no rate limiting
- no custom CSP
- global vocabulary export

Do not deploy it as a public multi-user service until those gaps are closed.

## Secret Handling

- Keep secrets in `.env`.
- Track only `.env.example` with placeholder values.
- Never commit SQLite databases, generated builds, API tokens, private keys, or logs.
