import { desc, gt, isNull, or } from "drizzle-orm";
import { getDb } from "@/db";
import { noticeBoardItems } from "@/db/schema";

export type NoticeBoardItemRow = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  expiresAt: Date | null;
  createdAt: Date;
};

/** Notices visible on home / dashboard: not past `expires_at`. */
export async function getActiveNoticeBoardItems(): Promise<NoticeBoardItemRow[]> {
  const db = getDb();
  const now = new Date();
  return db
    .select({
      id: noticeBoardItems.id,
      title: noticeBoardItems.title,
      body: noticeBoardItems.body,
      pinned: noticeBoardItems.pinned,
      expiresAt: noticeBoardItems.expiresAt,
      createdAt: noticeBoardItems.createdAt,
    })
    .from(noticeBoardItems)
    .where(or(isNull(noticeBoardItems.expiresAt), gt(noticeBoardItems.expiresAt, now)))
    .orderBy(desc(noticeBoardItems.pinned), desc(noticeBoardItems.createdAt));
}

/** Full list for super-admin management (includes expired). */
export async function getAllNoticeBoardItems(): Promise<NoticeBoardItemRow[]> {
  const db = getDb();
  return db
    .select({
      id: noticeBoardItems.id,
      title: noticeBoardItems.title,
      body: noticeBoardItems.body,
      pinned: noticeBoardItems.pinned,
      expiresAt: noticeBoardItems.expiresAt,
      createdAt: noticeBoardItems.createdAt,
    })
    .from(noticeBoardItems)
    .orderBy(desc(noticeBoardItems.pinned), desc(noticeBoardItems.createdAt));
}
