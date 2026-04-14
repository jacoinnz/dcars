"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { noticeBoardItems } from "@/db/schema";
import { getServerSessionWithBypass } from "@/lib/auth-options";

async function requireSuperAdmin() {
  const s = await getServerSessionWithBypass();
  if (!s?.user?.id || !s.user.isSuperAdmin) redirect("/");
  return s.user;
}

function parseOptionalExpires(value: string): Date | null {
  const t = value.trim();
  if (!t) return null;
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export async function adminCreateNoticeBoardItem(formData: FormData) {
  const user = await requireSuperAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const pinned = formData.get("pinned") === "on";
  const expiresAt = parseOptionalExpires(String(formData.get("expiresAt") ?? ""));
  if (!title || !body) {
    redirect("/admin/notices?err=required");
  }

  const db = getDb();
  await db.insert(noticeBoardItems).values({
    id: crypto.randomUUID(),
    title,
    body,
    pinned,
    expiresAt,
    createdAt: new Date(),
    createdByUserId: user.id,
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/admin/notices");
  redirect("/admin/notices?ok=1");
}

export async function adminDeleteNoticeBoardItem(formData: FormData) {
  await requireSuperAdmin();
  const noticeId = String(formData.get("id") ?? "").trim();
  if (!noticeId) return;
  const db = getDb();
  await db.delete(noticeBoardItems).where(eq(noticeBoardItems.id, noticeId));
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/admin/notices");
}
