# dcars

Youth programme reporting app: the Next.js app lives in **`web/`** (source, scripts, and full `node_modules` there).

## Vercel

**Preferred:** **Project → Settings → General → Root Directory** = **`web`**. Then you do **not** rely on the repo root `package.json` / [`vercel.json`](./vercel.json).

**If Root Directory stays the repository root** (common default): the root [`package.json`](./package.json) lists **`next` / `react` / `react-dom`** only so Vercel’s framework detection succeeds, and [`vercel.json`](./vercel.json) runs **`npm install`** (root) plus **`npm install --prefix web`** (app deps), then **`npm run build --prefix web`**.

Also:

- Leave **Output Directory** empty.
- Set **`DATABASE_URL`** (Neon) under Environment Variables.

See **`web/README.md`** for local development.
