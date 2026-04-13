import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import path from "node:path";

// drizzle-kit does not load Next.js env files automatically
config({ path: path.join(process.cwd(), ".env.local") });
config({ path: path.join(process.cwd(), ".env") });

if (!process.env.DATABASE_URL?.trim()) {
  throw new Error(
    "DATABASE_URL is missing. Create web/.env.local with your Neon connection string (see .env.example).",
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL.trim(),
  },
});
