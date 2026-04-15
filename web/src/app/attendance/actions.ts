"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { attendanceRecords, students } from "@/db/schema";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { canManageInstitution } from "@/lib/school-access";
import { studentIsActive } from "@/lib/students-active";
import { ATTENDANCE_STATUSES } from "@/app/attendance/constants";

function isValidStatus(s: string): s is (typeof ATTENDANCE_STATUSES)[number] {
  return (ATTENDANCE_STATUSES as readonly string[]).includes(s);
}

export async function saveAttendanceForDate(
  institutionId: string,
  sessionDate: string,
  formData: FormData,
): Promise<void> {
  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) throw new Error("You must be signed in.");
  const userId = session.user.id;
  const isSuperAdmin = Boolean(session.user.isSuperAdmin);
  if (!(await canManageInstitution(userId, isSuperAdmin, institutionId))) {
    throw new Error("You do not have permission to record attendance for this school.");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(sessionDate)) throw new Error("Invalid date.");

  const db = getDb();
  const studs = await db
    .select({ id: students.id })
    .from(students)
    .where(and(eq(students.institutionId, institutionId), studentIsActive));
  const now = new Date();

  for (const s of studs) {
    const raw = String(formData.get(`s_${s.id}`) ?? "").trim();
    if (raw === "") {
      await db
        .delete(attendanceRecords)
        .where(
          and(
            eq(attendanceRecords.studentId, s.id),
            eq(attendanceRecords.sessionDate, sessionDate),
          ),
        );
      continue;
    }
    if (!isValidStatus(raw)) continue;
    const notes = String(formData.get(`n_${s.id}`) ?? "").trim() || null;

    const existing = await db
      .select({ id: attendanceRecords.id })
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.studentId, s.id),
          eq(attendanceRecords.sessionDate, sessionDate),
        ),
      )
      .limit(1);

    if (existing[0]) {
      await db
        .update(attendanceRecords)
        .set({
          status: raw,
          notes,
          recordedByUserId: userId,
          updatedAt: now,
        })
        .where(eq(attendanceRecords.id, existing[0].id));
    } else {
      await db.insert(attendanceRecords).values({
        id: crypto.randomUUID(),
        studentId: s.id,
        sessionDate,
        status: raw,
        notes,
        recordedByUserId: userId,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  revalidatePath("/attendance");
  revalidatePath("/students/attendance");
  revalidatePath("/family");
}
