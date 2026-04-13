import { defineConfig } from "drizzle-kit";
import path from "node:path";

const dbPath = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "youth.db");

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: `file:${dbPath}`,
  },
});
