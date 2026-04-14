import { and, asc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { siteUserPermissions, sites } from "@/db/schema";
import { getAccessibleSiteIds } from "@/lib/permissions";

export async function getSitesForSession(userId: string, isSuperAdmin: boolean) {
  const access = await getAccessibleSiteIds(userId, isSuperAdmin);
  const db = getDb();
  if (access === "all") {
    return db.select().from(sites).orderBy(asc(sites.name));
  }
  if (access.length === 0) {
    return [];
  }
  return db.select().from(sites).where(inArray(sites.id, access)).orderBy(asc(sites.name));
}

/** Sites where the user may create participant registrations. */
export async function getSitesForParticipantEntry(userId: string, isSuperAdmin: boolean) {
  const db = getDb();
  if (isSuperAdmin) {
    return db.select().from(sites).orderBy(asc(sites.name));
  }
  const rows = await db
    .select({ siteId: siteUserPermissions.siteId })
    .from(siteUserPermissions)
    .where(
      and(eq(siteUserPermissions.userId, userId), eq(siteUserPermissions.canCreate, true)),
    );
  const ids = rows.map((r) => r.siteId);
  if (ids.length === 0) return [];
  return db.select().from(sites).where(inArray(sites.id, ids)).orderBy(asc(sites.name));
}
