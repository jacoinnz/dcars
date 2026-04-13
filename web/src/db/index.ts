import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url?.trim()) {
    throw new Error(
      "DATABASE_URL is not set. Add your Neon connection string to .env.local (see .env.example).",
    );
  }
  return url.trim();
}

/** Server-side Postgres via Neon HTTP driver (works on Vercel serverless). */
export function getDb() {
  if (_db) return _db;
  const sql = neon(requireDatabaseUrl());
  _db = drizzle(sql, { schema });
  return _db;
}

export type Db = ReturnType<typeof getDb>;
