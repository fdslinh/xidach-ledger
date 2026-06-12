# Deployment

This app deploys to Vercel and uses Neon PostgreSQL through Prisma.

## Required Services

- GitHub repository: `https://github.com/fdslinh/xidach-ledger`
- Vercel project using the GitHub repository
- Neon PostgreSQL database

## Neon URLs

Create a Neon project and copy both connection strings:

- `DATABASE_URL`: pooled connection string, usually containing `-pooler`
- `DIRECT_URL`: direct connection string, without `-pooler`

Use the pooled URL at runtime. Use the direct URL for Prisma migrations.

Local `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler.REGION.aws.neon.tech/DB?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST.REGION.aws.neon.tech/DB?sslmode=require"
```

Do not commit `.env` files.

## Prisma 7 Configuration

This project uses Prisma 7. The datasource URL is configured in `prisma.config.ts`, not in `prisma/schema.prisma`.

`prisma/schema.prisma` keeps only the provider:

```prisma
datasource db {
  provider = "postgresql"
}
```

`prisma.config.ts` uses `DIRECT_URL` for migration commands:

```ts
datasource: {
  url: env("DIRECT_URL"),
}
```

The app runtime uses `DATABASE_URL` through `@prisma/adapter-pg`.

## Local Setup

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma studio
```

`prisma migrate deploy` applies committed migrations to the configured database.

## Vercel Settings

Import the GitHub repository into Vercel.

- Framework Preset: Next.js
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: leave default

Add these Environment Variables for Production and Preview:

- `DATABASE_URL`: Neon pooled connection string
- `DIRECT_URL`: Neon direct connection string

## Production Migration Rule

For future schema changes:

```bash
npx prisma migrate dev --name <migration_name>
git add prisma/schema.prisma prisma/migrations
git commit -m "Add <migration_name> migration"
git push
```

Apply production migrations with:

```bash
npx prisma migrate deploy
```

Do not use `prisma db push` for production.
Do not commit `.env` files or local SQLite database files.
