# Youth programme — data entry and reporting

Web app for multi-site session reporting: form entry, SQLite storage, aggregation dashboard, PDF export, and missing-data alerts.

## Setup

From this `web/` directory:

```bash
mkdir -p data
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- Database file: `data/youth.db` (override with `DATABASE_PATH`).
- Demo sites are created by `db:seed` only when the `sites` table is empty.

## Scripts

| Script      | Purpose                          |
| ----------- | -------------------------------- |
| `npm run dev` | Local development server       |
| `npm run build` / `npm start` | Production build & run   |
| `npm run db:push` | Apply schema (Drizzle → SQLite) |
| `npm run db:seed` | Insert demo sites (once)       |

## Scope implemented

- Form-based session submission with server-side validation (Zod).
- Aggregated totals by site and programme (date range on dashboard).
- PDF summary download (`/api/report/pdf`).
- Alerts for sites with no report in the last 7 days (home page).

## Production notes

- Replace SQLite with a managed database (for example PostgreSQL) for concurrent multi-user hosting.
- Add authentication, roles (facilitator vs programme admin), and audit logging before handling sensitive youth data.
