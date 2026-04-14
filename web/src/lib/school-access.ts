import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { institutionStaff, institutions, sites } from "@/db/schema";
import { getAccessibleSiteIds } from "@/lib/permissions";

/** Institutions the user may see in reports: programme site access and/or explicit school assignment. */
export async function getViewableInstitutionIds(
  userId: string,
  isSuperAdmin: boolean,
): Promise<string[]> {
  const db = getDb();
  if (isSuperAdmin) {
    const rows = await db.select({ id: institutions.id }).from(institutions);
    return rows.map((r) => r.id);
  }

  const staff = await db
    .select({ institutionId: institutionStaff.institutionId })
    .from(institutionStaff)
    .where(eq(institutionStaff.userId, userId));
  const set = new Set(staff.map((s) => s.institutionId));

  const access = await getAccessibleSiteIds(userId, false);
  const siteIds =
    access === "all"
      ? (await db.select({ id: sites.id }).from(sites)).map((s) => s.id)
      : access;

  if (siteIds.length > 0) {
    const inst = await db
      .select({ id: institutions.id })
      .from(institutions)
      .where(inArray(institutions.siteId, siteIds));
    for (const r of inst) set.add(r.id);
  }

  return [...set];
}

/** Add/edit students, scores, enrollments — school staff or super admin only. */
export async function canManageInstitution(
  userId: string,
  isSuperAdmin: boolean,
  institutionId: string,
): Promise<boolean> {
  if (isSuperAdmin) return true;
  const db = getDb();
  const rows = await db
    .select({ id: institutionStaff.id })
    .from(institutionStaff)
    .where(
      and(
        eq(institutionStaff.userId, userId),
        eq(institutionStaff.institutionId, institutionId),
      ),
    )
    .limit(1);
  return rows.length > 0;
}

export async function userIsInstitutionStaff(
  userId: string,
  institutionId: string,
): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select({ id: institutionStaff.id })
    .from(institutionStaff)
    .where(
      and(
        eq(institutionStaff.userId, userId),
        eq(institutionStaff.institutionId, institutionId),
      ),
    )
    .limit(1);
  return rows.length > 0;
}

/** Schools where the user may record attendance (staff assignment or super admin). */
export async function getManageableInstitutionIds(
  userId: string,
  isSuperAdmin: boolean,
): Promise<string[]> {
  const db = getDb();
  if (isSuperAdmin) {
    const rows = await db.select({ id: institutions.id }).from(institutions);
    return rows.map((r) => r.id);
  }
  const rows = await db
    .select({ institutionId: institutionStaff.institutionId })
    .from(institutionStaff)
    .where(eq(institutionStaff.userId, userId));
  return rows.map((r) => r.institutionId);
}
