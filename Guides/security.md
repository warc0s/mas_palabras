# Seguridad

## Validación

- Toda mutación pasa por server actions.
- La validación de entrada usa Zod en `lib/validators.ts`.
- La detección de duplicados y reglas de dominio se valida además en servidor contra BD.

## Sesiones

- El quiz usa una cookie `httpOnly` llamada `mas-palabras-quiz`.
- `sameSite` es `lax`.
- `secure` se activa en producción.

No hay login ni sesiones de usuario completas.

## Uploads

- El import acepta solo JSON.
- Hay límite explícito de 10MB en la action de import.
- El parseo y la sanitización se hacen en servidor.

## Base de datos

- Prisma usa consultas tipadas.
- No hay SQL manual en la app.
- El acceso a SQLite depende de que `DATABASE_URL` apunte a la ruta correcta.

## Lo que NO hay

- sin autenticación/autorización
- sin rate limiting
- sin CSP personalizada
- sin auditoría de acciones
- sin API pública autenticada

Si la app va a exponerse fuera de un entorno personal, estos puntos siguen pendientes.
