import { and, asc, eq, gte, inArray, isNotNull } from "drizzle-orm";
import { getDb } from "@/db";
import { classes, institutions, studentClasses, students } from "@/db/schema";
import type { StudentListRow } from "@/components/student-list-table";
import { studentIsActive } from "@/lib/students-active";

export type RosterStudentRow = StudentListRow & { schoolName: string };

/** All students in the given schools, with class names for the list table. */
export async function getStudentRosterForInstitutions(institutionIds: string[]): Promise<{
  students: RosterStudentRow[];
  classNamesByStudentId: Record<string, string[]>;
}> {
  if (institutionIds.length === 0) {
    return { students: [], classNamesByStudentId: {} };
  }

  const db = getDb();

  const studRows = await db
    .select({
      id: students.id,
      firstName: students.firstName,
      middleName: students.middleName,
      lastName: students.lastName,
      admissionNumber: students.admissionNumber,
      gender: students.gender,
      phone: students.phone,
      email: students.email,
      admissionDate: students.admissionDate,
      schoolName: institutions.name,
    })
    .from(students)
    .innerJoin(institutions, eq(students.institutionId, institutions.id))
    .where(and(inArray(students.institutionId, institutionIds), studentIsActive))
    .orderBy(asc(institutions.name), asc(students.lastName), asc(students.firstName));

  const sidList = studRows.map((s) => s.id);
  if (sidList.length === 0) {
    return { students: [], classNamesByStudentId: {} };
  }

  const classRows = await db
    .select({ id: classes.id, name: classes.name })
    .from(classes)
    .where(inArray(classes.institutionId, institutionIds));

  const enrolled = await db
    .select({
      studentId: studentClasses.studentId,
      classId: studentClasses.classId,
    })
    .from(studentClasses)
    .where(inArray(studentClasses.studentId, sidList));

  const classNameById = new Map(classRows.map((c) => [c.id, c.name]));
  const classNamesByStudentId: Record<string, string[]> = {};
  for (const s of studRows) {
    classNamesByStudentId[s.id] = [];
  }
  for (const e of enrolled) {
    const nm = classNameById.get(e.classId);
    if (!nm) continue;
    const arr = classNamesByStudentId[e.studentId] ?? [];
    arr.push(nm);
    classNamesByStudentId[e.studentId] = arr;
  }

  return {
    students: studRows.map((s) => ({
      id: s.id,
      firstName: s.firstName,
      middleName: s.middleName,
      lastName: s.lastName,
      admissionNumber: s.admissionNumber,
      gender: s.gender,
      phone: s.phone,
      email: s.email,
      admissionDate: s.admissionDate,
      schoolName: s.schoolName,
    })),
    classNamesByStudentId,
  };
}

const RECOVERY_MS = 7 * 24 * 60 * 60 * 1000;

export type RecoverableStudentRow = RosterStudentRow & {
  deletedAt: Date;
};

/** Soft-deleted students who can still be restored (deleted within the last 7 days). */
export async function getRecoverableDeletedStudents(institutionIds: string[]): Promise<{
  students: RecoverableStudentRow[];
  classNamesByStudentId: Record<string, string[]>;
}> {
  if (institutionIds.length === 0) {
    return { students: [], classNamesByStudentId: {} };
  }

  const cutoff = new Date(Date.now() - RECOVERY_MS);
  const db = getDb();

  const studRows = await db
    .select({
      id: students.id,
      firstName: students.firstName,
      middleName: students.middleName,
      lastName: students.lastName,
      admissionNumber: students.admissionNumber,
      gender: students.gender,
      phone: students.phone,
      email: students.email,
      admissionDate: students.admissionDate,
      schoolName: institutions.name,
      deletedAt: students.deletedAt,
    })
    .from(students)
    .innerJoin(institutions, eq(students.institutionId, institutions.id))
    .where(
      and(
        inArray(students.institutionId, institutionIds),
        isNotNull(students.deletedAt),
        gte(students.deletedAt, cutoff),
      ),
    )
    .orderBy(asc(students.deletedAt), asc(students.lastName), asc(students.firstName));

  const sidList = studRows.map((s) => s.id);
  if (sidList.length === 0) {
    return { students: [], classNamesByStudentId: {} };
  }

  const classRows = await db
    .select({ id: classes.id, name: classes.name })
    .from(classes)
    .where(inArray(classes.institutionId, institutionIds));

  const enrolled = await db
    .select({
      studentId: studentClasses.studentId,
      classId: studentClasses.classId,
    })
    .from(studentClasses)
    .where(inArray(studentClasses.studentId, sidList));

  const classNameById = new Map(classRows.map((c) => [c.id, c.name]));
  const classNamesByStudentId: Record<string, string[]> = {};
  for (const s of studRows) {
    classNamesByStudentId[s.id] = [];
  }
  for (const e of enrolled) {
    const nm = classNameById.get(e.classId);
    if (!nm) continue;
    const arr = classNamesByStudentId[e.studentId] ?? [];
    arr.push(nm);
    classNamesByStudentId[e.studentId] = arr;
  }

  return {
    students: studRows.map((s) => ({
      id: s.id,
      firstName: s.firstName,
      middleName: s.middleName,
      lastName: s.lastName,
      admissionNumber: s.admissionNumber,
      gender: s.gender,
      phone: s.phone,
      email: s.email,
      admissionDate: s.admissionDate,
      schoolName: s.schoolName,
      deletedAt: s.deletedAt!,
    })),
    classNamesByStudentId,
  };
}

export { RECOVERY_MS };
