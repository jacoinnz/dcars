import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { getDb } from "@/db";
import { institutionExamSeries, institutions, sites } from "@/db/schema";
import { createExamSeries, deleteExamSeries } from "@/app/examinations/actions";
import { authOptions } from "@/lib/auth-options";
import { canManageInstitution, getViewableInstitutionIds } from "@/lib/school-access";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ institutionId: string }> };

export default async function ExaminationsInstitutionPage({ params }: Props) {
  const { institutionId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const isSuperAdmin = Boolean(session.user.isSuperAdmin);
  const viewable = await getViewableInstitutionIds(userId, isSuperAdmin);
  if (!viewable.includes(institutionId)) redirect("/examinations");

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

  const seriesRows = await db
    .select()
    .from(institutionExamSeries)
    .where(eq(institutionExamSeries.institutionId, institutionId))
    .orderBy(desc(institutionExamSeries.updatedAt), asc(institutionExamSeries.title));

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <Link href="/examinations" className="text-sm font-medium text-teal-800 underline">
        ← Examinations
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-stone-900">{school.name}</h1>
      <p className="text-sm text-stone-600">{school.siteName}</p>

      {!canManage ? (
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          You can view published exam information, but only assigned school staff can create or edit
          series. Ask an administrator to add you under Admin → Schools → this school.
        </p>
      ) : (
        <form action={createExamSeries.bind(null, institutionId)} className="mt-8 flex flex-wrap items-end gap-2">
          <label className="text-xs font-medium text-stone-700">
            New exam period
            <input
              name="title"
              required
              placeholder="e.g. Mid-year 2026"
              className="ml-1 mt-1 block min-w-[16rem] rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-semibold text-white hover:bg-stone-800"
          >
            Create
          </button>
        </form>
      )}

      <h2 className="mt-10 text-xs font-semibold uppercase tracking-wide text-stone-500">
        Exam periods
      </h2>
      {seriesRows.length === 0 ? (
        <p className="mt-4 text-sm text-stone-600">No exam periods yet.{canManage ? " Create one above." : ""}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {seriesRows.map((row) => (
            <li
              key={row.id}
              className="flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <Link
                  href={`/examinations/${institutionId}/${row.id}`}
                  className="font-semibold text-teal-800 underline decoration-teal-200"
                >
                  {row.title}
                </Link>
                <p className="text-xs text-stone-500">
                  Updated {row.updatedAt.toLocaleString()}
                </p>
              </div>
              {canManage ? (
                <form action={deleteExamSeries.bind(null, institutionId, row.id)}>
                  <button type="submit" className="text-xs font-medium text-red-700 underline hover:text-red-900">
                    Delete period
                  </button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
