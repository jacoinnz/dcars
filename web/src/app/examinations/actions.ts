"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { examMarks, examScheduleSlots, institutionExamSeries, students } from "@/db/schema";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { canManageInstitution } from "@/lib/school-access";

async function sessionUser() {
  const s = await getServerSessionWithBypass();
  if (!s?.user?.id) throw new Error("You must be signed in.");
  return { userId: s.user.id, isSuperAdmin: Boolean(s.user.isSuperAdmin) };
}

async function loadSeries(seriesId: string) {
  const db = getDb();
  const [row] = await db.select().from(institutionExamSeries).where(eq(institutionExamSeries.id, seriesId)).limit(1);
  return row ?? null;
}

function revalidateExam(institutionId: string, seriesId?: string) {
  revalidatePath("/examinations");
  revalidatePath(`/examinations/${institutionId}`);
  if (seriesId) revalidatePath(`/examinations/${institutionId}/${seriesId}`);
}

export async function createExamSeries(institutionId: string, formData: FormData): Promise<void> {
  const { userId, isSuperAdmin } = await sessionUser();
  if (!(await canManageInstitution(userId, isSuperAdmin, institutionId))) {
    throw new Error("You cannot create exams for this school.");
  }
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required.");
  const now = new Date();
  const db = getDb();
  const id = crypto.randomUUID();
  await db.insert(institutionExamSeries).values({
    id,
    institutionId,
    title,
    routineBody: null,
    scheduleNoticeBody: null,
    seatPlanBody: null,
    markSheetColumns: null,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  });
  revalidateExam(institutionId);
}

async function patchSeriesField(
  institutionId: string,
  seriesId: string,
  patch: Partial<{
    routineBody: string | null;
    scheduleNoticeBody: string | null;
    seatPlanBody: string | null;
    markSheetColumns: string | null;
  }>,
) {
  const { userId, isSuperAdmin } = await sessionUser();
  if (!(await canManageInstitution(userId, isSuperAdmin, institutionId))) {
    throw new Error("Not allowed.");
  }
  const s = await loadSeries(seriesId);
  if (!s || s.institutionId !== institutionId) throw new Error("Exam not found.");
  const db = getDb();
  await db
    .update(institutionExamSeries)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(institutionExamSeries.id, seriesId));
  revalidateExam(institutionId, seriesId);
}

export async function updateExamRoutineBody(institutionId: string, seriesId: string, formData: FormData): Promise<void> {
  const routineBody = String(formData.get("routineBody") ?? "") || null;
  await patchSeriesField(institutionId, seriesId, { routineBody });
}

export async function updateExamScheduleNotice(institutionId: string, seriesId: string, formData: FormData): Promise<void> {
  const scheduleNoticeBody = String(formData.get("scheduleNoticeBody") ?? "") || null;
  await patchSeriesField(institutionId, seriesId, { scheduleNoticeBody });
}

export async function updateExamSeatPlanBody(institutionId: string, seriesId: string, formData: FormData): Promise<void> {
  const seatPlanBody = String(formData.get("seatPlanBody") ?? "") || null;
  await patchSeriesField(institutionId, seriesId, { seatPlanBody });
}

export async function updateExamMarkSheetColumns(institutionId: string, seriesId: string, formData: FormData): Promise<void> {
  const markSheetColumns = String(formData.get("markSheetColumns") ?? "").trim() || null;
  await patchSeriesField(institutionId, seriesId, { markSheetColumns });
}

export async function addExamScheduleSlot(institutionId: string, seriesId: string, formData: FormData): Promise<void> {
  const { userId, isSuperAdmin } = await sessionUser();
  if (!(await canManageInstitution(userId, isSuperAdmin, institutionId))) {
    throw new Error("Not allowed.");
  }
  const s = await loadSeries(seriesId);
  if (!s || s.institutionId !== institutionId) throw new Error("Exam not found.");
  const paperName = String(formData.get("paperName") ?? "").trim();
  const examDate = String(formData.get("examDate") ?? "").trim();
  const startTime = String(formData.get("startTime") ?? "").trim();
  const endTime = String(formData.get("endTime") ?? "").trim();
  const venue = String(formData.get("venue") ?? "").trim() || null;
  if (!paperName || !examDate || !startTime || !endTime) throw new Error("Paper, date, and times are required.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(examDate)) throw new Error("Invalid date.");
  const db = getDb();
  await db.insert(examScheduleSlots).values({
    id: crypto.randomUUID(),
    examSeriesId: seriesId,
    paperName,
    examDate,
    startTime,
    endTime,
    venue,
    sortOrder: Date.now() % 1_000_000,
  });
  await db
    .update(institutionExamSeries)
    .set({ updatedAt: new Date() })
    .where(eq(institutionExamSeries.id, seriesId));
  revalidateExam(institutionId, seriesId);
}

export async function deleteExamScheduleSlot(
  institutionId: string,
  seriesId: string,
  slotId: string,
): Promise<void> {
  const { userId, isSuperAdmin } = await sessionUser();
  if (!(await canManageInstitution(userId, isSuperAdmin, institutionId))) {
    throw new Error("Not allowed.");
  }
  const s = await loadSeries(seriesId);
  if (!s || s.institutionId !== institutionId) throw new Error("Exam not found.");
  const db = getDb();
  await db.delete(examScheduleSlots).where(and(eq(examScheduleSlots.id, slotId), eq(examScheduleSlots.examSeriesId, seriesId)));
  revalidateExam(institutionId, seriesId);
}

export async function deleteExamSeries(institutionId: string, seriesId: string): Promise<void> {
  const { userId, isSuperAdmin } = await sessionUser();
  if (!(await canManageInstitution(userId, isSuperAdmin, institutionId))) {
    throw new Error("Not allowed.");
  }
  const s = await loadSeries(seriesId);
  if (!s || s.institutionId !== institutionId) throw new Error("Exam not found.");
  const db = getDb();
  await db.delete(institutionExamSeries).where(eq(institutionExamSeries.id, seriesId));
  revalidateExam(institutionId);
}

/** papers: comma-separated list aligned with score field indices */
export async function saveExamMarksGrid(institutionId: string, seriesId: string, formData: FormData): Promise<void> {
  const { userId, isSuperAdmin } = await sessionUser();
  if (!(await canManageInstitution(userId, isSuperAdmin, institutionId))) {
    throw new Error("Not allowed.");
  }
  const s = await loadSeries(seriesId);
  if (!s || s.institutionId !== institutionId) throw new Error("Exam not found.");

  const papersRaw = String(formData.get("papers") ?? "").trim();
  const papers = papersRaw
    ? papersRaw
        .split("\t")
        .map((p) => p.trim())
        .filter(Boolean)
    : [];
  if (papers.length === 0) throw new Error("Define at least one paper (from schedule or add columns).");

  const db = getDb();
  const studRows = await db.select({ id: students.id }).from(students).where(eq(students.institutionId, institutionId));
  const now = new Date();

  for (const st of studRows) {
    for (let i = 0; i < papers.length; i++) {
      const paperName = papers[i];
      const key = `sc_${st.id}_${i}`;
      const raw = String(formData.get(key) ?? "").trim();
      if (raw === "") {
        await db
          .delete(examMarks)
          .where(
            and(
              eq(examMarks.examSeriesId, seriesId),
              eq(examMarks.studentId, st.id),
              eq(examMarks.paperName, paperName),
            ),
          );
        continue;
      }
      const score = Number.parseInt(raw, 10);
      if (Number.isNaN(score)) continue;
      const maxRaw = String(formData.get(`max_${st.id}_${i}`) ?? "100").trim();
      const maxScore = Number.parseInt(maxRaw, 10);
      const m = Number.isNaN(maxScore) ? 100 : maxScore;

      const existing = await db
        .select({ id: examMarks.id })
        .from(examMarks)
        .where(
          and(
            eq(examMarks.examSeriesId, seriesId),
            eq(examMarks.studentId, st.id),
            eq(examMarks.paperName, paperName),
          ),
        )
        .limit(1);

      if (existing[0]) {
        await db
          .update(examMarks)
          .set({
            score,
            maxScore: m,
            recordedByUserId: userId,
            updatedAt: now,
          })
          .where(eq(examMarks.id, existing[0].id));
      } else {
        await db.insert(examMarks).values({
          id: crypto.randomUUID(),
          examSeriesId: seriesId,
          studentId: st.id,
          paperName,
          score,
          maxScore: m,
          notes: null,
          recordedByUserId: userId,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  }

  await db.update(institutionExamSeries).set({ updatedAt: now }).where(eq(institutionExamSeries.id, seriesId));
  revalidateExam(institutionId, seriesId);
}
