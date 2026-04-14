import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { studentGuardians } from "@/db/schema";

/** Student IDs this signed-in user may view as a parent/guardian. */
export async function getGuardianStudentIds(guardianUserId: string): Promise<string[]> {
  const db = getDb();
  const rows = await db
    .select({ studentId: studentGuardians.studentId })
    .from(studentGuardians)
    .where(eq(studentGuardians.guardianUserId, guardianUserId));
  return rows.map((r) => r.studentId);
}

export async function guardianCanViewStudent(
  guardianUserId: string,
  studentId: string,
): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select({ id: studentGuardians.id })
    .from(studentGuardians)
    .where(
      and(
        eq(studentGuardians.guardianUserId, guardianUserId),
        eq(studentGuardians.studentId, studentId),
      ),
    )
    .limit(1);
  return rows.length > 0;
}
