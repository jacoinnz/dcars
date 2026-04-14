"use server";

import { revalidatePath } from "next/cache";
import { desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { appUsers, sites, teacherContentUploads } from "@/db/schema";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { canOnSite, getAccessibleSiteIds } from "@/lib/permissions";
import {
  deleteStoredTeacherFile,
  storeTeacherUploadFile,
  teacherRowToStored,
  type StoredTeacherFile,
} from "@/lib/teacher-upload-storage";
import { z } from "zod";

const uploadSchema = z.object({
  siteId: z.string().min(1),
  institutionName: z.string().min(1, "School or institution is required").max(200),
  title: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
});

export type TeacherUploadActionState =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function uploadTeacherContent(
  _prev: TeacherUploadActionState | undefined,
  formData: FormData,
): Promise<TeacherUploadActionState> {
  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) {
    return { ok: false, message: "You must be signed in." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose a file to upload." };
  }

  const titleRaw = String(formData.get("title") ?? "").trim();
  const descRaw = String(formData.get("description") ?? "").trim();
  const parsed = uploadSchema.safeParse({
    siteId: formData.get("siteId"),
    institutionName: formData.get("institutionName"),
    title: titleRaw === "" ? undefined : titleRaw,
    description: descRaw === "" ? undefined : descRaw,
  });
  if (!parsed.success) {
    const msg = Object.values(parsed.error.flatten().fieldErrors).flat().filter(Boolean)[0];
    return { ok: false, message: String(msg ?? "Invalid form.") };
  }

  const { siteId, institutionName, title, description } = parsed.data;
  const userId = session.user.id;
  const isSuperAdmin = Boolean(session.user.isSuperAdmin);

  const allowed = await canOnSite(userId, isSuperAdmin, siteId, "create");
  if (!allowed) {
    return { ok: false, message: "You do not have permission to upload for this programme site." };
  }

  const id = crypto.randomUUID();
  let stored: StoredTeacherFile;
  let fileSize: number;
  let fileMime: string;
  let fileName: string;

  try {
    const result = await storeTeacherUploadFile(file, id);
    stored = result.stored;
    fileSize = result.size;
    fileMime = result.mime;
    fileName = file.name.slice(0, 255);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not store file.";
    return { ok: false, message: msg };
  }

  const db = getDb();
  try {
    await db.insert(teacherContentUploads).values({
      id,
      siteId,
      institutionName,
      title: title ?? null,
      description: description ?? null,
      fileName,
      fileMime,
      fileSize,
      uploadedByUserId: userId,
      storageKind: stored.storageKind,
      blobUrl: stored.storageKind === "blob" ? stored.blobUrl : null,
      inlineBase64: stored.storageKind === "inline" ? stored.inlineBase64 : null,
      createdAt: new Date(),
    });
  } catch (e) {
    console.error(e);
    await deleteStoredTeacherFile(stored);
    return { ok: false, message: "Could not save upload metadata." };
  }

  revalidatePath("/teacher-content");
  return { ok: true, message: "File uploaded." };
}

export async function deleteTeacherContent(uploadId: string): Promise<void> {
  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) {
    throw new Error("You must be signed in.");
  }

  const db = getDb();
  const [row] = await db.select().from(teacherContentUploads).where(eq(teacherContentUploads.id, uploadId)).limit(1);
  if (!row) {
    throw new Error("Upload not found.");
  }

  const userId = session.user.id;
  const isSuperAdmin = Boolean(session.user.isSuperAdmin);
  const isUploader = row.uploadedByUserId === userId;

  const canDeletePerm = await canOnSite(userId, isSuperAdmin, row.siteId, "delete");
  const canCreate = await canOnSite(userId, isSuperAdmin, row.siteId, "create");

  if (!isSuperAdmin && !canDeletePerm && !(isUploader && canCreate)) {
    throw new Error("You do not have permission to remove this file.");
  }

  const stored = teacherRowToStored(row);
  await db.delete(teacherContentUploads).where(eq(teacherContentUploads.id, uploadId));
  await deleteStoredTeacherFile(stored);

  revalidatePath("/teacher-content");
}

export type TeacherUploadListRow = {
  id: string;
  siteId: string;
  siteName: string;
  siteCode: string;
  institutionName: string;
  title: string | null;
  description: string | null;
  fileName: string;
  fileMime: string;
  fileSize: number;
  uploadedAt: Date;
  uploadedByEmail: string;
  uploadedByUserId: string;
};

export async function getTeacherUploadsForSession(): Promise<TeacherUploadListRow[]> {
  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) return [];

  const userId = session.user.id;
  const isSuperAdmin = Boolean(session.user.isSuperAdmin);
  const db = getDb();

  const baseSelect = {
    id: teacherContentUploads.id,
    siteId: teacherContentUploads.siteId,
    siteName: sites.name,
    siteCode: sites.code,
    institutionName: teacherContentUploads.institutionName,
    title: teacherContentUploads.title,
    description: teacherContentUploads.description,
    fileName: teacherContentUploads.fileName,
    fileMime: teacherContentUploads.fileMime,
    fileSize: teacherContentUploads.fileSize,
    uploadedAt: teacherContentUploads.createdAt,
    uploadedByEmail: appUsers.email,
    uploadedByUserId: teacherContentUploads.uploadedByUserId,
  };

  const q = db
    .select(baseSelect)
    .from(teacherContentUploads)
    .innerJoin(sites, eq(sites.id, teacherContentUploads.siteId))
    .innerJoin(appUsers, eq(appUsers.id, teacherContentUploads.uploadedByUserId));

  if (isSuperAdmin) {
    return q.orderBy(desc(teacherContentUploads.createdAt));
  }

  const access = await getAccessibleSiteIds(userId, false);
  const siteIds = access === "all" ? [] : access;
  if (siteIds.length === 0) return [];

  return q
    .where(inArray(teacherContentUploads.siteId, siteIds))
    .orderBy(desc(teacherContentUploads.createdAt));
}
