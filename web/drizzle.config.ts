import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import path from "node:path";

// drizzle-kit does not load Next.js env files automatically
config({ path: path.join(process.cwd(), ".env.local") });
config({ path: path.join(process.cwd(), ".env") });

function resolveDbUrl(): string {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
  ];
  for (const u of candidates) {
    const t = u?.trim();
    if (t) return t;
  }
  throw new Error(
    "DATABASE_URL (or POSTGRES_URL) is missing. Create web/.env.local with your Neon connection string (see .env.example).",
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: resolveDbUrl(),
  },
});
