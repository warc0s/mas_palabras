# API

La superficie HTTP actual está pensada para la propia app.

## Qué existe ahora

- páginas de App Router para lectura/render
- server actions para formularios y mutaciones internas
- route handlers internos solo para necesidades concretas

## Endpoints HTTP reales

### `GET /export_words`

- devuelve todas las palabras en JSON
- responde con `Content-Disposition: attachment; filename="palabras.json"`

### `GET /end_quiz`

- termina la sesión activa si existe
- rechaza con 403 si `sec-fetch-site` indica `cross-site` o `same-site` (mitigación CSRF sobre GET)
- limpia la cookie del quiz
- redirige a `/quiz` con mensaje informativo

## Nota importante

Si en el futuro se necesita una API pública, habrá que diseñarla como una capacidad nueva.
