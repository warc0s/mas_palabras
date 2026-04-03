# mas_palabras

Aplicación Next.js para gestionar vocabulario personal y practicarlo con quizzes adaptativos.

## Instalación

```bash
pnpm install
cp .env.example .env
npx prisma migrate dev --name init
```

## Desarrollo local

```bash
pnpm dev
```

La app corre en `http://127.0.0.1:3000`.

## Tests y chequeo estático

```bash
pnpm test
pnpm build
```

## Despliegue en producción

La aplicación está preparada para ejecutarse como build standalone de Next:

```bash
pnpm build
pnpm start
```
