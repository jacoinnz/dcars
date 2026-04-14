import Link from "next/link";
import { format } from "date-fns";
import {
  adminCreateNoticeBoardItem,
  adminDeleteNoticeBoardItem,
} from "@/app/admin/notice-board-actions";
import { getAllNoticeBoardItems } from "@/lib/notice-board";

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

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">Notice board</h1>
      <p className="mt-2 max-w-2xl text-sm text-stone-600">
        Posts appear on the app home page and dashboard for all signed-in users. Expired notices stay
        listed here but are hidden from the public board.
      </p>

      {sp.ok === "1" ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Notice added.
        </p>
      ) : null}
      {sp.err === "required" ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          Title and body are required.
        </p>
      ) : null}

      <form action={adminCreateNoticeBoardItem} className="mt-8 max-w-xl rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-900">New notice</h2>
        <div className="mt-4 flex flex-col gap-3">
          <label className="text-xs font-medium text-stone-700">
            Title
            <input
              name="title"
              required
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-stone-700">
            Body
            <textarea
              name="body"
              required
              rows={4}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex items-center gap-2 text-xs font-medium text-stone-700">
            <input name="pinned" type="checkbox" className="rounded border-stone-400" />
            Pin to top
          </label>
          <label className="text-xs font-medium text-stone-700">
            Expires (optional, local time)
            <input name="expiresAt" type="datetime-local" className="mt-1 block rounded-lg border border-stone-300 px-3 py-2 text-sm" />
          </label>
        </div>
        <button
          type="submit"
          className="mt-4 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
        >
          Publish notice
        </button>
      </form>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-stone-900">All notices ({items.length})</h2>
        {items.length === 0 ? (
          <p className="mt-3 text-sm text-stone-600">No notices yet.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {items.map((n) => {
              const expired = n.expiresAt ? n.expiresAt.getTime() <= Date.now() : false;
              return (
                <li
                  key={n.id}
                  className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-stone-900">{n.title}</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-stone-700">{n.body}</p>
                    <p className="mt-2 text-xs text-stone-500">
                      {format(n.createdAt, "d MMM yyyy HH:mm")}
                      {n.pinned ? " · pinned" : ""}
                      {n.expiresAt ? ` · expires ${format(n.expiresAt, "d MMM yyyy HH:mm")}` : ""}
                      {expired ? " · expired (hidden from board)" : ""}
                    </p>
                  </div>
                  <form action={adminDeleteNoticeBoardItem}>
                    <input type="hidden" name="id" value={n.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-900 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="mt-10 text-sm text-stone-600">
        <Link href="/admin" className="font-semibold text-teal-800 underline">
          ← Control center
        </Link>
      </p>
    </div>
  );
}
