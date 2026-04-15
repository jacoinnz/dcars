"use server";

import { and, gte, inArray, isNotNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { students } from "@/db/schema";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { canManageInstitution } from "@/lib/school-access";
import { RECOVERY_MS } from "@/lib/students-roster";
import { studentIsActive } from "@/lib/students-active";

function revalidateStudentPaths() {
  revalidatePath("/students");
  revalidatePath("/evaluations");
  revalidatePath("/attendance");
  revalidatePath("/students/attendance");
  revalidatePath("/examinations");
  revalidatePath("/family");
  revalidatePath("/parents/marks");
  revalidatePath("/admin/institutions");
}

export async function softDeleteStudents(
  studentIds: string[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const unique = [...new Set(studentIds.map((id) => id.trim()).filter(Boolean))];
  if (unique.length === 0) return { ok: false, error: "No students selected." };

  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) return { ok: false, error: "You must be signed in." };
  const userId = session.user.id;
  const isSuperAdmin = Boolean(session.user.isSuperAdmin);

  const db = getDb();
  const rows = await db
    .select({ id: students.id, institutionId: students.institutionId, deletedAt: students.deletedAt })
    .from(students)
    .where(inArray(students.id, unique));

  if (rows.length !== unique.length) {
    return { ok: false, error: "One or more students were not found." };
  }

  for (const r of rows) {
    if (r.deletedAt) {
      return { ok: false, error: "One or more students are already removed." };
    }
    if (!(await canManageInstitution(userId, isSuperAdmin, r.institutionId))) {
      return { ok: false, error: "You are not allowed to remove a selected student." };
    }
  }

  const now = new Date();
  await db
    .update(students)
    .set({ deletedAt: now, deletedByUserId: userId })
    .where(and(inArray(students.id, unique), studentIsActive));

  revalidateStudentPaths();
  return { ok: true };
}

export async function restoreStudents(
  studentIds: string[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const unique = [...new Set(studentIds.map((id) => id.trim()).filter(Boolean))];
  if (unique.length === 0) return { ok: false, error: "No students selected." };

  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) return { ok: false, error: "You must be signed in." };
  const userId = session.user.id;
  const isSuperAdmin = Boolean(session.user.isSuperAdmin);

  const cutoff = new Date(Date.now() - RECOVERY_MS);
  const db = getDb();

  const rows = await db
    .select({
      id: students.id,
      institutionId: students.institutionId,
      deletedAt: students.deletedAt,
    })
    .from(students)
    .where(inArray(students.id, unique));

  if (rows.length !== unique.length) {
    return { ok: false, error: "One or more students were not found." };
  }

  for (const r of rows) {
    if (!r.deletedAt) {
      return { ok: false, error: "One or more students are not in the recovery list." };
    }
    if (r.deletedAt < cutoff) {
      return { ok: false, error: "The recovery period has ended for one or more students." };
    }
    if (!(await canManageInstitution(userId, isSuperAdmin, r.institutionId))) {
      return { ok: false, error: "You are not allowed to restore a selected student." };
    }
  }

  await db
    .update(students)
    .set({ deletedAt: null, deletedByUserId: null })
    .where(
      and(
        inArray(students.id, unique),
        isNotNull(students.deletedAt),
        gte(students.deletedAt, cutoff),
      ),
    );

  revalidateStudentPaths();
  return { ok: true };
}
