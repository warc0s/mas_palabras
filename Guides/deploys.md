# Desarrollo y Despliegue

## Setup local

```bash
pnpm install
cp .env.example .env
npx prisma migrate dev --name init
```

## Desarrollo

```bash
pnpm dev
```

La app corre en `http://127.0.0.1:3000`.

## Build de producción

```bash
pnpm build
pnpm start
```

`pnpm start` ejecuta el servidor standalone de Next y fija `DATABASE_URL` absoluta para usar `prisma/dev.db`.

## Migraciones

```bash
npx prisma migrate dev --name nombre_del_cambio
npx prisma migrate deploy
npx prisma generate
```

## Variables de entorno

Mínimo:

```env
DATABASE_URL="file:./dev.db"
```

Para desarrollo y build del repo actual, los scripts ya convierten esa ruta a absoluta al arrancar Next.

## Despliegue self-host

El flujo esperado es:

1. `pnpm install`
2. `npx prisma migrate deploy`
3. `pnpm build`
4. `pnpm start`

Si usas otra ubicación para SQLite, exporta `DATABASE_URL` absoluta antes de arrancar el proceso Node.
