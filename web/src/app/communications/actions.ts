"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { institutionNotices } from "@/db/schema";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { canManageInstitution } from "@/lib/school-access";
import { isNoticeType } from "@/app/communications/constants";

async function sessionUser() {
  const s = await getServerSessionWithBypass();
  if (!s?.user?.id) throw new Error("You must be signed in.");
  return { userId: s.user.id, isSuperAdmin: Boolean(s.user.isSuperAdmin) };
}

function revalidateComm(institutionId: string) {
  revalidatePath("/communications");
  revalidatePath(`/communications/${institutionId}`);
}

function parseOptionalDate(raw: string): string | null {
  const t = raw.trim();
  if (!t || !/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  return t;
}

export async function createInstitutionNotice(institutionId: string, formData: FormData): Promise<void> {
  const { userId, isSuperAdmin } = await sessionUser();
  if (!(await canManageInstitution(userId, isSuperAdmin, institutionId))) {
    throw new Error("You cannot add notices for this school.");
  }
  const noticeType = String(formData.get("noticeType") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!isNoticeType(noticeType)) throw new Error("Invalid notice type.");
  if (!title || !body) throw new Error("Title and details are required.");
  const startDate = parseOptionalDate(String(formData.get("startDate") ?? ""));
  const endDate = parseOptionalDate(String(formData.get("endDate") ?? ""));
  const now = new Date();
  const db = getDb();
  await db.insert(institutionNotices).values({
    id: crypto.randomUUID(),
    institutionId,
    noticeType,
    title,
    body,
    startDate,
    endDate,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  });
  revalidateComm(institutionId);
}

export async function updateInstitutionNotice(
  institutionId: string,
  noticeId: string,
  formData: FormData,
): Promise<void> {
  const { userId, isSuperAdmin } = await sessionUser();
  if (!(await canManageInstitution(userId, isSuperAdmin, institutionId))) {
    throw new Error("Not allowed.");
  }
  const db = getDb();
  const [row] = await db.select().from(institutionNotices).where(eq(institutionNotices.id, noticeId)).limit(1);
  if (!row || row.institutionId !== institutionId) throw new Error("Notice not found.");

  const noticeType = String(formData.get("noticeType") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!isNoticeType(noticeType)) throw new Error("Invalid notice type.");
  if (!title || !body) throw new Error("Title and details are required.");
  const startDate = parseOptionalDate(String(formData.get("startDate") ?? ""));
  const endDate = parseOptionalDate(String(formData.get("endDate") ?? ""));

  await db
    .update(institutionNotices)
    .set({
      noticeType,
      title,
      body,
      startDate,
      endDate,
      updatedAt: new Date(),
    })
    .where(and(eq(institutionNotices.id, noticeId), eq(institutionNotices.institutionId, institutionId)));
  revalidateComm(institutionId);
}

export async function deleteInstitutionNotice(institutionId: string, noticeId: string): Promise<void> {
  const { userId, isSuperAdmin } = await sessionUser();
  if (!(await canManageInstitution(userId, isSuperAdmin, institutionId))) {
    throw new Error("Not allowed.");
  }
  const db = getDb();
  await db
    .delete(institutionNotices)
    .where(and(eq(institutionNotices.id, noticeId), eq(institutionNotices.institutionId, institutionId)));
  revalidateComm(institutionId);
}
