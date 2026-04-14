# Youth programme — data entry and reporting

Web app for multi-site session reporting: form entry, **Neon (Postgres)** storage, aggregation dashboard, PDF export, and missing-data alerts.

## Prerequisites

- A [Neon](https://neon.tech) project and a **connection string** (`DATABASE_URL`).

## Setup

Dependencies are installed **inside `web/`** only. From the repository root you can run `npm install --prefix web` (or `cd web && npm install`).

From this `web/` directory:

1. Copy environment file and add your Neon URL:

   ```bash
   cp .env.example .env.local
   ```

   Paste `DATABASE_URL` from Neon (Dashboard → your project → **Connect** → choose **Serverless** / HTTP if shown; the pooled or direct Postgres URI both work with this app).

2. Apply schema and seed demo sites:

   ```bash
   npm install
   npm run db:push
   npm run db:seed
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

- `db:seed` only inserts demo sites when the `sites` table is empty.
- The app uses the **Neon serverless HTTP** driver (`@neondatabase/serverless` + `drizzle-orm/neon-http`), which fits Vercel and other serverless hosts.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run build` / `npm start` | Production build and run |
| `npm run db:push` | Push Drizzle schema to Neon (`DATABASE_URL` required) |
| `npm run db:seed` | Insert demo sites (once) |

## Deploying (e.g. Vercel)

- Set **Root Directory** to `web` if the repo root is above this folder.
- Add **`DATABASE_URL`** in the project **Environment Variables** (same value as Neon’s connection string).
- Redeploy after the variable is set.

## Production notes

- Add authentication, roles (facilitator vs programme admin), and audit logging before handling sensitive youth data.
