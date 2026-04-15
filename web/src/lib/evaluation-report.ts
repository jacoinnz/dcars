import { and, eq, gte, inArray, lte } from "drizzle-orm";
import { getDb } from "@/db";
import { classes, performanceRecords, students } from "@/db/schema";
import { studentIsActive } from "@/lib/students-active";

export type PerformanceRow = {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  classId: string | null;
  className: string | null;
  category: string;
  score: number;
  maxScore: number;
  pct: number;
  recordedAt: Date;
};

export type StudentSummary = {
  studentId: string;
  firstName: string;
  lastName: string;
  avgPct: number;
  recordCount: number;
};

export type ClassSummary = {
  classId: string;
  className: string;
  avgPct: number;
  recordCount: number;
};

export async function fetchPerformanceForReport(params: {
  institutionId: string;
  classIds: string[];
  from: Date;
  to: Date;
}): Promise<{
  rows: PerformanceRow[];
  schoolAvgPct: number | null;
  byClass: ClassSummary[];
  byStudent: StudentSummary[];
}> {
  const db = getDb();
  const from = params.from;
  const to = params.to;

  const classFilter =
    params.classIds.length === 0
      ? undefined
      : inArray(performanceRecords.classId, params.classIds);

  const whereParts = [
    studentIsActive,
    eq(students.institutionId, params.institutionId),
    gte(performanceRecords.recordedAt, from),
    lte(performanceRecords.recordedAt, to),
  ];
  if (classFilter) whereParts.push(classFilter);

  const raw = await db
    .select({
      id: performanceRecords.id,
      studentId: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      classId: performanceRecords.classId,
      className: classes.name,
      category: performanceRecords.category,
      score: performanceRecords.score,
      maxScore: performanceRecords.maxScore,
      recordedAt: performanceRecords.recordedAt,
    })
    .from(performanceRecords)
    .innerJoin(students, eq(students.id, performanceRecords.studentId))
    .leftJoin(classes, eq(classes.id, performanceRecords.classId))
    .where(and(...whereParts));

  const rows: PerformanceRow[] = raw.map((r) => {
    const max = Math.max(1, r.maxScore);
    const pct = (r.score / max) * 100;
    return {
      id: r.id,
      studentId: r.studentId,
      firstName: r.firstName,
      lastName: r.lastName,
      classId: r.classId,
      className: r.className,
      category: r.category,
      score: r.score,
      maxScore: r.maxScore,
      pct,
      recordedAt: r.recordedAt,
    };
  });

  const schoolAvgPct =
    rows.length === 0
      ? null
      : rows.reduce((a, r) => a + r.pct, 0) / rows.length;

  const byClassMap = new Map<string, { name: string; sum: number; n: number }>();
  for (const r of rows) {
    const cid = r.classId ?? "_none";
    const name = r.className ?? "School-wide";
    const cur = byClassMap.get(cid) ?? { name, sum: 0, n: 0 };
    cur.sum += r.pct;
    cur.n += 1;
    byClassMap.set(cid, cur);
  }
  const byClass: ClassSummary[] = [...byClassMap.entries()].map(([classId, v]) => ({
    classId: classId === "_none" ? "" : classId,
    className: v.name,
    avgPct: v.n ? v.sum / v.n : 0,
    recordCount: v.n,
  }));

  const byStudentMap = new Map<string, { first: string; last: string; sum: number; n: number }>();
  for (const r of rows) {
    const cur =
      byStudentMap.get(r.studentId) ?? { first: r.firstName, last: r.lastName, sum: 0, n: 0 };
    cur.sum += r.pct;
    cur.n += 1;
    byStudentMap.set(r.studentId, cur);
  }
  const byStudent: StudentSummary[] = [...byStudentMap.entries()].map(([studentId, v]) => ({
    studentId,
    firstName: v.first,
    lastName: v.last,
    avgPct: v.n ? v.sum / v.n : 0,
    recordCount: v.n,
  }));
  byStudent.sort((a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName));

  return { rows, schoolAvgPct, byClass, byStudent };
}
