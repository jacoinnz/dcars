# Youth programme — data entry and reporting

Web app for multi-site **participant registration** (unique ID per row), optional legacy **session** metrics, **Neon (Postgres)** storage, dashboard, PDF export, and missing-session alerts.

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
- Add **`DATABASE_URL`** in **Settings → Environment Variables** for **Production** (and Preview if needed), using the same Neon connection string as local `.env.local`. The app also reads **`POSTGRES_URL`** / **`POSTGRES_PRISMA_URL`** if your integration sets those instead.

### NextAuth (required — avoids `NO_SECRET` / 500 on `/api/auth/*`)

| Variable | Required | Notes |
| --- | --- | --- |
| **`AUTH_SECRET`** or **`NEXTAUTH_SECRET`** | **Yes in production** | Same purpose; use one. Generate: `openssl rand -base64 32`. If missing, NextAuth throws [`NO_SECRET`](https://next-auth.js.org/errors#no_secret) and `/api/auth/error` returns 500. |
| **`NEXTAUTH_URL`** | **Yes in production** | Full site URL with `https`, **no trailing slash**, e.g. `https://dcars-xxxx.vercel.app`. Must match the hostname users open. Wrong value breaks sign-in redirects. |

Copy values from `.env.example`, add them in Vercel **Settings → Environment Variables** for each environment (Production, Preview) that runs the app, then **redeploy**.

### After changing env

- Redeploy after adding or changing variables. Without a database URL, data pages error until `DATABASE_URL` is set. Without `AUTH_SECRET`, auth routes error until it is set.

## Production notes

- Participant records include **PII** (names, contacts, DOB, ethnicity). Use **HTTPS**, restrict access, and comply with your jurisdiction’s youth-data rules before production use.
- The app uses **NextAuth** with credentials and role flags; restrict who receives accounts and review audit needs for your organisation.
