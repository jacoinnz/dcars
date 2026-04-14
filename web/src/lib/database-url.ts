/**
 * Postgres URL from environment. Neon + Vercel often expose one of these names.
 */
export function getDatabaseUrl(): string | undefined {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL_NON_POOLING,
  ];
  for (const u of candidates) {
    const t = u?.trim();
    if (t) return t;
  }
  return undefined;
}
