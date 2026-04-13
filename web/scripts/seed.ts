import { config } from "dotenv";
import path from "node:path";

config({ path: path.join(process.cwd(), ".env.local") });
config({ path: path.join(process.cwd(), ".env") });

import { getDb } from "../src/db";
import { sites } from "../src/db/schema";

const demoSites = [
  { name: "North Community Hub", code: "NCH" },
  { name: "Riverside Youth Centre", code: "RYC" },
  { name: "Eastside Sports Arena", code: "ESA" },
];

async function main() {
  const db = getDb();
  const existing = await db.select({ id: sites.id }).from(sites).limit(1);
  if (existing.length) {
    console.log("Database already has sites; skipping seed.");
    return;
  }
  const now = Date.now();
  for (const s of demoSites) {
    await db.insert(sites).values({
      id: crypto.randomUUID(),
      name: s.name,
      code: s.code,
      createdAt: new Date(now),
    });
  }
  console.log("Seed complete: demo sites created.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
