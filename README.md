# dcars

Youth programme reporting app: Next.js app lives in **`web/`**.

## Vercel (required setup)

The Git repository root is **not** the Next.js app. **Do not** point Vercel at the repo root with custom build overrides — that breaks Next’s preset and can cause **`404`** or **“No Output Directory named public”**.

### 1. Root Directory

In [Vercel](https://vercel.com) → your project → **Settings** → **General**:

1. **Root Directory** → **`web`** → **Save**
2. **Output Directory** → leave **empty** / default (do **not** set `public` or `.next` manually)
3. Redeploy (Deployments → … → Redeploy)

Framework should show **Next.js** after this. `DATABASE_URL` (Neon) must be set under **Environment Variables** for Production (and Preview if you use it).

### 2. Root `package.json` (optional)

The root [`package.json`](./package.json) only helps run `npm run dev` / `npm run build` from the repo root locally (`--prefix web`). Vercel ignores it once **Root Directory** is **`web`**.

See **`web/README.md`** for local development.
