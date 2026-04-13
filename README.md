# dcars

Youth programme reporting app: Next.js app lives in **`web/`**.

## Vercel (fix `404 NOT_FOUND`)

The repo root is **not** the Next.js project. Do **one** of the following:

### Option A (recommended)

In [Vercel](https://vercel.com) → your project → **Settings** → **General** → **Root Directory** → set to **`web`** → **Save**, then **Redeploy** the latest deployment.

### Option B

Leave Root Directory as the repository root. This repo includes **`vercel.json`** and a root **`package.json`** so install/build run inside **`web/`** automatically. Redeploy after pulling the latest `main`.

Also confirm **Environment variables** include **`DATABASE_URL`** (Neon) for Production (and Preview if you use it).

See **`web/README.md`** for local development.
