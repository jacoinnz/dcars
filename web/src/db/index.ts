import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { getDatabaseUrl } from "@/lib/database-url";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function requireDatabaseUrl(): string {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error(
      "Database URL is not set. Add DATABASE_URL (Neon connection string) in Vercel → Project → Settings → Environment Variables for Production, then redeploy. Locally, use web/.env.local (see .env.example).",
    );
  }
  return url;
}

/** Server-side Postgres via Neon HTTP driver (works on Vercel serverless). */
export function getDb() {
  if (_db) return _db;
  const sql = neon(requireDatabaseUrl());
  _db = drizzle(sql, { schema });
  return _db;
}

export type Db = ReturnType<typeof getDb>;
