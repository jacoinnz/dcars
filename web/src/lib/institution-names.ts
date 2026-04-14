import { inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { participantEntries } from "@/db/schema";

/** Distinct school / institution names already used in registrations for each site (for pickers). */
export async function getInstitutionNamesBySiteIds(
  siteIds: string[],
): Promise<Record<string, string[]>> {
  if (siteIds.length === 0) return {};
  const db = getDb();
  const rows = await db
    .selectDistinct({
      siteId: participantEntries.siteId,
      institutionName: participantEntries.institutionName,
    })
    .from(participantEntries)
    .where(inArray(participantEntries.siteId, siteIds));

  const map: Record<string, Set<string>> = {};
  for (const id of siteIds) map[id] = new Set();
  for (const r of rows) {
    const n = r.institutionName.trim();
    if (n) map[r.siteId]?.add(n);
  }
  const out: Record<string, string[]> = {};
  for (const id of siteIds) {
    out[id] = [...(map[id] ?? [])].sort((a, b) => a.localeCompare(b));
  }
  return out;
}
