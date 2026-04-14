import { config } from "dotenv";
import path from "node:path";

config({ path: path.join(process.cwd(), ".env.local") });
config({ path: path.join(process.cwd(), ".env") });

import { getDb } from "../src/db";
import { noticeBoardItems, sites } from "../src/db/schema";

const demoSites = [
  { name: "North Community Hub", code: "NCH" },
  { name: "Riverside Youth Centre", code: "RYC" },
  { name: "Eastside Sports Arena", code: "ESA" },
];

async function main() {
  const db = getDb();
  const existing = await db.select({ id: sites.id }).from(sites).limit(1);
  if (!existing.length) {
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
  } else {
    console.log("Database already has sites; skipping site seed.");
  }

  const existingNotices = await db.select({ id: noticeBoardItems.id }).from(noticeBoardItems).limit(1);
  if (!existingNotices.length) {
    const t = Date.now();
    await db.insert(noticeBoardItems).values([
      {
        id: crypto.randomUUID(),
        title: "Welcome to the programme portal",
        body:
          "Use the audience tabs above to jump to student, teacher, parent, or staff tools. Check this notice board for holidays, deadlines, and whole-programme updates.",
        pinned: true,
        expiresAt: null,
        createdAt: new Date(t),
        createdByUserId: null,
      },
      {
        id: crypto.randomUUID(),
        title: "Reporting reminder",
        body:
          "Session reports and participant registrations feed the dashboard metrics. Submit session data promptly so site leads see up-to-date numbers.",
        pinned: false,
        expiresAt: null,
        createdAt: new Date(t + 1000),
        createdByUserId: null,
      },
    ]);
    console.log("Seed complete: sample notice board items created.");
  } else {
    console.log("Notice board already has items; skipping notice seed.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
