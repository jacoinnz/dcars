import { getAllNoticeBoardItems } from "@/lib/notice-board";
import { AdminNoticesClient } from "../admin-notices-client";

export const metadata = {
  title: "Admin — Notice board",
};

export default async function AdminNoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const sp = await searchParams;
  const items = await getAllNoticeBoardItems();
  // Request-time instant for comparing expiry (server component).
  // eslint-disable-next-line react-hooks/purity -- not deterministic render; intentional per-request clock
  const nowMs = Date.now();

  const rows = items.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    pinned: n.pinned,
    expiresAt: n.expiresAt?.toISOString() ?? null,
    createdAt: n.createdAt.toISOString(),
    isExpired: Boolean(n.expiresAt && n.expiresAt.getTime() <= nowMs),
  }));

  return (
    <AdminNoticesClient items={rows} ok={sp.ok === "1"} err={sp.err === "required"} />
  );
}
