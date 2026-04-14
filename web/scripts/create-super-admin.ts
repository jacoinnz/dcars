/**
 * One-off: create the first super-admin user (requires DATABASE_URL and bcrypt).
 *
 * Usage (from web/):
 *   npx tsx scripts/create-super-admin.ts you@org.example "Your Name" "your-secure-password"
 *
 * Or set ADMIN_BOOTSTRAP_EMAIL, ADMIN_BOOTSTRAP_NAME, ADMIN_BOOTSTRAP_PASSWORD in .env.local
 */
import { config } from "dotenv";
import path from "node:path";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

config({ path: path.join(process.cwd(), ".env.local") });
config({ path: path.join(process.cwd(), ".env") });

async function main() {
  const [, , a0, a1, a2] = process.argv;
  const email = (
    a0 ||
    process.env.ADMIN_BOOTSTRAP_EMAIL ||
    ""
  )
    .toLowerCase()
    .trim();
  const name = (a1 || process.env.ADMIN_BOOTSTRAP_NAME || "").trim();
  const password = a2 || process.env.ADMIN_BOOTSTRAP_PASSWORD || "";

  if (!email || !name || password.length < 8) {
    console.error(
      "Provide email, name, and password (min 8 chars) as CLI args or via ADMIN_BOOTSTRAP_* env vars.",
    );
    process.exit(1);
  }

  const { getDb } = await import("../src/db");
  const { appUsers } = await import("../src/db/schema");

  const db = getDb();
  const existing = await db.select({ id: appUsers.id }).from(appUsers).where(eq(appUsers.email, email)).limit(1);
  if (existing.length) {
    console.error("A user with this email already exists.");
    process.exit(1);
  }

  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(appUsers).values({
    id,
    email,
    name,
    passwordHash,
    isSuperAdmin: true,
    createdAt: new Date(),
  });

  console.log(`Super admin created: ${email} (${id})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
