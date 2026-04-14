# dcars

Youth programme reporting app: the Next.js app lives in **`web/`**.

## Vercel (required)

**Project → Settings → General → Root Directory** must be **`web`** (not the repository root).

- Do **not** add a second `web` in Install/Build commands — if Root Directory is already `web`, paths like `web/web/package.json` will fail.
- Leave **Output Directory** empty; use the default **Next.js** framework.
- Set **`DATABASE_URL`** (Neon) under Environment Variables.

There is **no** root [`vercel.json`](./vercel.json): install and build run inside **`web/`** automatically once Root Directory is set.

The root [`package.json`](./package.json) is only for convenience (`npm run dev` from the repo root via `--prefix web`).

See **`web/README.md`** for local development.
