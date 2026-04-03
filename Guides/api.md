# API

La app ya no expone una API REST pública tipo `/api/v1/*`.

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
- limpia la cookie del quiz
- redirige a `/quiz` con mensaje informativo

## Nota importante

Si en el futuro se necesita una API pública, habrá que diseñarla como una capacidad nueva. Nada del contrato REST anterior debe darse por existente.
