import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { institutions, students } from "@/db/schema";

/** Student profile row linked to this login, if any. */
export async function getPortalStudentIdForUser(userId: string): Promise<string | null> {
  const db = getDb();
  const [r] = await db
    .select({ id: students.id })
    .from(students)
    .where(eq(students.portalUserId, userId))
    .limit(1);
  return r?.id ?? null;
}

export async function canStudentPortalAccessTeacherUpload(
  userId: string,
  upload: { siteId: string; institutionName: string },
): Promise<boolean> {
  const sid = await getPortalStudentIdForUser(userId);
  if (!sid) return false;
  const db = getDb();
  const [row] = await db
    .select({
      siteId: institutions.siteId,
      name: institutions.name,
    })
    .from(students)
    .innerJoin(institutions, eq(students.institutionId, institutions.id))
    .where(eq(students.id, sid))
    .limit(1);
  if (!row) return false;
  return row.siteId === upload.siteId && row.name === upload.institutionName;
}
