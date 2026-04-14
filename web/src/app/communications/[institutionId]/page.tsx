import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { institutionNotices, institutions, sites } from "@/db/schema";
import {
  createInstitutionNotice,
  deleteInstitutionNotice,
  updateInstitutionNotice,
} from "@/app/communications/actions";
import { NOTICE_TYPES, noticeTypeLabel } from "@/app/communications/constants";
import { PrintPageButton } from "@/components/print-page-button";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { canManageInstitution, getViewableInstitutionIds } from "@/lib/school-access";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ institutionId: string }>;
  searchParams: Promise<{ type?: string }>;
};

function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return "Dates not set";
  if (start && !end) return start;
  if (!start && end) return end;
  if (start && end && start === end) return start;
  return `${start} → ${end}`;
}

export default async function InstitutionNoticesPage({ params, searchParams }: Props) {
  const { institutionId } = await params;
  const sp = await searchParams;
  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const isSuperAdmin = Boolean(session.user.isSuperAdmin);
  const viewable = await getViewableInstitutionIds(userId, isSuperAdmin);
  if (!viewable.includes(institutionId)) redirect("/communications");

  const typeFilter =
    typeof sp.type === "string" && NOTICE_TYPES.some((t) => t.id === sp.type) ? sp.type : "";

  const canManage = await canManageInstitution(userId, isSuperAdmin, institutionId);
  const db = getDb();

  const [school] = await db
    .select({
      id: institutions.id,
      name: institutions.name,
      siteName: sites.name,
    })
    .from(institutions)
    .innerJoin(sites, eq(sites.id, institutions.siteId))
    .where(eq(institutions.id, institutionId))
    .limit(1);
  if (!school) notFound();

  const rows = await db
    .select()
    .from(institutionNotices)
    .where(eq(institutionNotices.institutionId, institutionId))
    .orderBy(desc(institutionNotices.updatedAt));

  const filtered = typeFilter ? rows.filter((r) => r.noticeType === typeFilter) : rows;

  return (
    <div className="pe-app-page">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/communications" className="text-sm font-medium text-teal-800 underline">
            ← Communications
          </Link>
          <h1 className="pe-app-h1 pe-app-h1-mt3">Notice manager</h1>
          <p className="text-sm text-stone-600">
            {school.name} · {school.siteName}
          </p>
        </div>
        <PrintPageButton />
      </div>

      {!canManage ? (
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          You can read notices for this school. Only assigned staff can add or edit — ask an
          administrator under Admin → Schools → Staff.
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href={`/communications/${institutionId}`}
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            !typeFilter ? "bg-teal-700 text-white" : "border border-stone-200 bg-stone-50 text-stone-800"
          }`}
        >
          All
        </Link>
        {NOTICE_TYPES.map((t) => (
          <Link
            key={t.id}
            href={`/communications/${institutionId}?type=${t.id}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              typeFilter === t.id ? "bg-teal-700 text-white" : "border border-stone-200 bg-stone-50 text-stone-800"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {canManage ? (
        <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-stone-900">Add notice</h2>
          <form action={createInstitutionNotice.bind(null, institutionId)} className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-medium text-stone-700">
                Type
                <select
                  name="noticeType"
                  required
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
                >
                  {NOTICE_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-medium text-stone-700">
                Title
                <input
                  name="title"
                  required
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
                />
              </label>
            </div>
            <label className="block text-xs font-medium text-stone-700">
              Details
              <textarea
                name="body"
                required
                rows={4}
                className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
                placeholder="What families and staff need to know…"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-medium text-stone-700">
                Start date <span className="font-normal text-stone-500">(optional)</span>
                <input name="startDate" type="date" className="mt-1 block w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm" />
              </label>
              <label className="text-xs font-medium text-stone-700">
                End date <span className="font-normal text-stone-500">(optional)</span>
                <input name="endDate" type="date" className="mt-1 block w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm" />
              </label>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800"
            >
              Publish notice
            </button>
          </form>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          {typeFilter ? noticeTypeLabel(typeFilter) : "All notices"}
        </h2>
        {filtered.length === 0 ? (
          <p className="mt-4 text-sm text-stone-600">No notices yet.</p>
        ) : (
          <ul className="mt-4 space-y-6">
            {filtered.map((n) => (
              <li key={n.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span className="inline-block rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold uppercase text-stone-700">
                      {noticeTypeLabel(n.noticeType)}
                    </span>
                    <h3 className="mt-2 text-lg font-semibold text-stone-900">{n.title}</h3>
                    <p className="mt-1 text-sm text-stone-500">{formatDateRange(n.startDate, n.endDate)}</p>
                  </div>
                  {canManage ? (
                    <form action={deleteInstitutionNotice.bind(null, institutionId, n.id)}>
                      <button type="submit" className="text-xs font-medium text-red-700 underline hover:text-red-900">
                        Delete
                      </button>
                    </form>
                  ) : null}
                </div>
                <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-stone-800">{n.body}</div>
                {canManage ? (
                  <details className="mt-4 border-t border-stone-100 pt-4">
                    <summary className="cursor-pointer text-sm font-medium text-teal-800">Edit</summary>
                    <form action={updateInstitutionNotice.bind(null, institutionId, n.id)} className="mt-4 space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block text-xs font-medium text-stone-700">
                          Type
                          <select
                            name="noticeType"
                            required
                            defaultValue={n.noticeType}
                            className="mt-1 block w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
                          >
                            {NOTICE_TYPES.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block text-xs font-medium text-stone-700">
                          Title
                          <input
                            name="title"
                            required
                            defaultValue={n.title}
                            className="mt-1 block w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
                          />
                        </label>
                      </div>
                      <label className="block text-xs font-medium text-stone-700">
                        Details
                        <textarea
                          name="body"
                          required
                          rows={4}
                          defaultValue={n.body}
                          className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
                        />
                      </label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="text-xs font-medium text-stone-700">
                          Start date
                          <input
                            name="startDate"
                            type="date"
                            defaultValue={n.startDate ?? ""}
                            className="mt-1 block w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
                          />
                        </label>
                        <label className="text-xs font-medium text-stone-700">
                          End date
                          <input
                            name="endDate"
                            type="date"
                            defaultValue={n.endDate ?? ""}
                            className="mt-1 block w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
                          />
                        </label>
                      </div>
                      <button type="submit" className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white">
                        Save changes
                      </button>
                    </form>
                  </details>
                ) : null}
                <p className="mt-3 text-xs text-stone-400">Updated {n.updatedAt.toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
