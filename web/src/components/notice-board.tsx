import Link from "next/link";
import { format } from "date-fns";
import type { NoticeBoardItemRow } from "@/lib/notice-board";

export function NoticeBoard(props: {
  items: NoticeBoardItemRow[];
  showManageLink?: boolean;
  /** Inside welcome card, directly under the audience tabs */
  embedded?: boolean;
}) {
  const { items, showManageLink, embedded } = props;

  return (
    <section
      className={`rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/90 to-white p-6 shadow-sm ${
        embedded ? "mt-6 mb-0 rounded-xl" : "mb-10"
      }`}
      aria-labelledby="notice-board-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="notice-board-heading" className="text-lg font-semibold text-amber-950">
            Notice board
          </h2>
          <p className="mt-1 text-sm text-amber-950/80">
            Programme announcements for students, staff, and families.
          </p>
        </div>
        {showManageLink ? (
          <Link
            href="/admin/notices"
            className="shrink-0 rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-950 shadow-sm transition hover:border-amber-400 hover:bg-amber-50"
          >
            Manage notices
          </Link>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="mt-5 text-sm text-stone-600">No notices at the moment.</p>
      ) : (
        <ul className="mt-5 flex flex-col gap-4">
          {items.map((n) => (
            <li
              key={n.id}
              className="rounded-xl border border-stone-200/80 bg-white/90 p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 gap-y-1">
                <p className="font-semibold text-stone-900">{n.title}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                  {n.pinned ? (
                    <span className="rounded-full bg-teal-100 px-2 py-0.5 font-semibold text-teal-900">
                      Pinned
                    </span>
                  ) : null}
                  <time dateTime={n.createdAt.toISOString()}>
                    {format(n.createdAt, "d MMM yyyy")}
                  </time>
                  {n.expiresAt ? (
                    <span className="text-stone-400">
                      · expires {format(n.expiresAt, "d MMM yyyy")}
                    </span>
                  ) : null}
                </div>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">
                {n.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
