# dcars

Youth programme reporting app: the Next.js app lives entirely in **`web/`** (its own `package.json` and `node_modules`).

## Vercel (required)

**Project → Settings → General → Root Directory** must be **`web`** (not the repository root).

If Root Directory is the repo root, Vercel reads the root `package.json`, which does **not** list `next`, and the build fails with **“No Next.js version detected”**.

Also:

- Leave **Output Directory** empty.
- Set **`DATABASE_URL`** under Environment Variables (Neon).

See **`web/README.md`** for local development.
