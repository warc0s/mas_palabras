# Desarrollo y Despliegue

## Setup local

```bash
pnpm install
cp .env.example .env
pnpm prisma:migrate:dev --name init
```

## Desarrollo

```bash
pnpm dev
```

La app corre en `http://127.0.0.1:3000`.

## Build de producción

```bash
pnpm build
pnpm start:local
```

`pnpm start:local` ejecuta el servidor standalone de Next y fija `DATABASE_URL` absoluta para usar `prisma/dev.db`.

## Migraciones

```bash
pnpm prisma:migrate:dev --name nombre_del_cambio
pnpm prisma:migrate:deploy
pnpm prisma:generate
```

## Variables de entorno

Mínimo:

```env
DATABASE_URL="file:./dev.db"
```

Opcionales:

```env
NEXT_PUBLIC_SITE_URL="https://tu-dominio.example"
```

`NEXT_PUBLIC_SITE_URL` fija la base de URLs absolutas para metadata OG/canonical (`metadataBase` en `app/layout.tsx`). Si no se define, el fallback es `http://localhost:3000`.

Para desarrollo, build y arranque local, los scripts `dev`, `build` y `start:local` convierten esa ruta a absoluta al arrancar Next.

## Despliegue self-host

El flujo esperado es:

1. `pnpm install`
2. `pnpm prisma:migrate:deploy`
3. `pnpm build`
4. `DATABASE_URL="file:/ruta/absoluta/prod.db" pnpm start`

`pnpm start` respeta el `DATABASE_URL` del entorno. Usa `pnpm start:local` solo para arrancar contra `prisma/dev.db`.
