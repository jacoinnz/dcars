"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import {
  classes,
  institutionAttendanceSettings,
  institutionStaff,
  institutions,
  institutionSyllabuses,
  studentGuardians,
  students,
} from "@/db/schema";
import { getServerSessionWithBypass } from "@/lib/auth-options";

async function requireSuperAdmin() {
  const s = await getServerSessionWithBypass();
  if (!s?.user?.id || !s.user.isSuperAdmin) redirect("/");
  return s.user;
}

export async function adminCreateInstitution(formData: FormData): Promise<void> {
  await requireSuperAdmin();
  const siteId = String(formData.get("siteId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim() || null;
  if (!siteId || !name) throw new Error("Site and school name are required.");
  const db = getDb();
  await db.insert(institutions).values({
    id: crypto.randomUUID(),
    siteId,
    name,
    code,
    createdAt: new Date(),
  });
  revalidatePath("/admin/institutions");
  revalidatePath("/evaluations");
}

export async function adminUpdateInstitution(institutionId: string, formData: FormData): Promise<void> {
  await requireSuperAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim() || null;
  if (!name) throw new Error("Name is required.");
  const db = getDb();
  await db.update(institutions).set({ name, code }).where(eq(institutions.id, institutionId));
  revalidatePath("/admin/institutions");
  revalidatePath(`/admin/institutions/${institutionId}`);
  revalidatePath("/evaluations");
}

export async function adminDeleteInstitution(institutionId: string): Promise<void> {
  await requireSuperAdmin();
  const db = getDb();
  await db.delete(institutions).where(eq(institutions.id, institutionId));
  revalidatePath("/admin/institutions");
  revalidatePath("/evaluations");
}

export async function adminCreateClass(institutionId: string, formData: FormData): Promise<void> {
  await requireSuperAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim() || null;
  if (!name) throw new Error("Class name is required.");
  const db = getDb();
  await db.insert(classes).values({
    id: crypto.randomUUID(),
    institutionId,
    name,
    code,
    createdAt: new Date(),
  });
  revalidatePath(`/admin/institutions/${institutionId}`);
  revalidatePath("/evaluations");
}

export async function adminDeleteClass(classId: string, institutionId: string): Promise<void> {
  await requireSuperAdmin();
  const db = getDb();
  await db.delete(classes).where(eq(classes.id, classId));
  revalidatePath(`/admin/institutions/${institutionId}`);
  revalidatePath("/evaluations");
}

export async function adminAssignStaff(formData: FormData): Promise<void> {
  await requireSuperAdmin();
  const institutionId = String(formData.get("institutionId") ?? "").trim();
  const userId = String(formData.get("userId") ?? "").trim();
  const role = String(formData.get("role") ?? "teacher").trim();
  if (!institutionId || !userId) throw new Error("School and user are required.");
  if (role !== "teacher" && role !== "management") throw new Error("Invalid role.");
  const db = getDb();
  const existing = await db
    .select({ id: institutionStaff.id })
    .from(institutionStaff)
    .where(
      and(eq(institutionStaff.institutionId, institutionId), eq(institutionStaff.userId, userId)),
    )
    .limit(1);
  if (existing.length) throw new Error("That user is already assigned to this school.");
  await db.insert(institutionStaff).values({
    id: crypto.randomUUID(),
    institutionId,
    userId,
    role,
  });
  revalidatePath(`/admin/institutions/${institutionId}`);
  revalidatePath("/evaluations");
}

export async function adminRemoveStaff(staffRowId: string, institutionId: string): Promise<void> {
  await requireSuperAdmin();
  const db = getDb();
  await db.delete(institutionStaff).where(eq(institutionStaff.id, staffRowId));
  revalidatePath(`/admin/institutions/${institutionId}`);
  revalidatePath("/evaluations");
}

export async function adminCreateSyllabus(institutionId: string, formData: FormData): Promise<void> {
  await requireSuperAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim() || null;
  const body = String(formData.get("body") ?? "").trim();
  const sortOrder = Math.round(Number(String(formData.get("sortOrder") ?? "0").trim()) || 0);
  if (!title || !body) throw new Error("Title and syllabus content are required.");
  const db = getDb();
  const now = new Date();
  await db.insert(institutionSyllabuses).values({
    id: crypto.randomUUID(),
    institutionId,
    title,
    summary,
    body,
    sortOrder,
    createdAt: now,
    updatedAt: now,
  });
  revalidatePath(`/admin/institutions/${institutionId}`);
  revalidatePath(`/evaluations/syllabuses/${institutionId}`);
}

export async function adminUpdateSyllabus(
  syllabusId: string,
  institutionId: string,
  formData: FormData,
): Promise<void> {
  await requireSuperAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim() || null;
  const body = String(formData.get("body") ?? "").trim();
  const sortOrder = Math.round(Number(String(formData.get("sortOrder") ?? "0").trim()) || 0);
  if (!title || !body) throw new Error("Title and syllabus content are required.");
  const db = getDb();
  await db
    .update(institutionSyllabuses)
    .set({
      title,
      summary,
      body,
      sortOrder,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(institutionSyllabuses.id, syllabusId),
        eq(institutionSyllabuses.institutionId, institutionId),
      ),
    );
  revalidatePath(`/admin/institutions/${institutionId}`);
  revalidatePath(`/evaluations/syllabuses/${institutionId}`);
}

export async function adminDeleteSyllabus(syllabusId: string, institutionId: string): Promise<void> {
  await requireSuperAdmin();
  const db = getDb();
  await db
    .delete(institutionSyllabuses)
    .where(
      and(
        eq(institutionSyllabuses.id, syllabusId),
        eq(institutionSyllabuses.institutionId, institutionId),
      ),
    );
  revalidatePath(`/admin/institutions/${institutionId}`);
  revalidatePath(`/evaluations/syllabuses/${institutionId}`);
}

export async function adminSaveAttendanceFamilyMessage(
  institutionId: string,
  formData: FormData,
): Promise<void> {
  await requireSuperAdmin();
  const familyInstructions = String(formData.get("familyInstructions") ?? "").trim() || null;
  const db = getDb();
  const now = new Date();
  await db
    .insert(institutionAttendanceSettings)
    .values({
      institutionId,
      familyInstructions,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: institutionAttendanceSettings.institutionId,
      set: { familyInstructions, updatedAt: now },
    });
  revalidatePath(`/admin/institutions/${institutionId}`);
  revalidatePath("/family");
}

export async function adminLinkGuardianToStudent(formData: FormData): Promise<void> {
  await requireSuperAdmin();
  const institutionId = String(formData.get("institutionId") ?? "").trim();
  const studentId = String(formData.get("studentId") ?? "").trim();
  const guardianUserId = String(formData.get("guardianUserId") ?? "").trim();
  const relationshipLabel = String(formData.get("relationshipLabel") ?? "").trim() || null;
  if (!institutionId || !studentId || !guardianUserId) {
    throw new Error("School, student, and guardian account are required.");
  }
  const db = getDb();
  const [st] = await db
    .select({ institutionId: students.institutionId })
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);
  if (!st || st.institutionId !== institutionId) {
    throw new Error("Student does not belong to this school.");
  }
  const dup = await db
    .select({ id: studentGuardians.id })
    .from(studentGuardians)
    .where(
      and(
        eq(studentGuardians.studentId, studentId),
        eq(studentGuardians.guardianUserId, guardianUserId),
      ),
    )
    .limit(1);
  if (dup.length) throw new Error("This guardian is already linked to this student.");
  await db.insert(studentGuardians).values({
    id: crypto.randomUUID(),
    studentId,
    guardianUserId,
    relationshipLabel,
    createdAt: new Date(),
  });
  revalidatePath(`/admin/institutions/${institutionId}`);
  revalidatePath("/family");
}

export async function adminUnlinkGuardian(linkId: string, institutionId: string): Promise<void> {
  await requireSuperAdmin();
  const db = getDb();
  const [row] = await db
    .select({ studentId: studentGuardians.studentId })
    .from(studentGuardians)
    .where(eq(studentGuardians.id, linkId))
    .limit(1);
  if (!row) throw new Error("Link not found.");
  const [st] = await db
    .select({ institutionId: students.institutionId })
    .from(students)
    .where(eq(students.id, row.studentId))
    .limit(1);
  if (!st || st.institutionId !== institutionId) throw new Error("Invalid link.");
  await db.delete(studentGuardians).where(eq(studentGuardians.id, linkId));
  revalidatePath(`/admin/institutions/${institutionId}`);
  revalidatePath("/family");
}

export async function adminLinkStudentPortal(formData: FormData): Promise<void> {
  await requireSuperAdmin();
  const institutionId = String(formData.get("institutionId") ?? "").trim();
  const studentId = String(formData.get("studentId") ?? "").trim();
  const portalUserId = String(formData.get("portalUserId") ?? "").trim();
  if (!institutionId || !studentId || !portalUserId) {
    throw new Error("School, student, and login account are required.");
  }
  const db = getDb();
  const [st] = await db
    .select({ institutionId: students.institutionId })
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);
  if (!st || st.institutionId !== institutionId) {
    throw new Error("Student does not belong to this school.");
  }
  await db.update(students).set({ portalUserId: null }).where(eq(students.portalUserId, portalUserId));
  await db.update(students).set({ portalUserId }).where(eq(students.id, studentId));
  revalidatePath(`/admin/institutions/${institutionId}`);
  revalidatePath("/student");
}

export async function adminUnlinkStudentPortal(studentId: string, institutionId: string): Promise<void> {
  await requireSuperAdmin();
  const db = getDb();
  const [st] = await db
    .select({ institutionId: students.institutionId })
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);
  if (!st || st.institutionId !== institutionId) throw new Error("Student not found for this school.");
  await db.update(students).set({ portalUserId: null }).where(eq(students.id, studentId));
  revalidatePath(`/admin/institutions/${institutionId}`);
  revalidatePath("/student");
}
