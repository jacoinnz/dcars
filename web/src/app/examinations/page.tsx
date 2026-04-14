import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { asc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { institutions, sites } from "@/db/schema";
import { authOptions } from "@/lib/auth-options";
import { EXAMINATION_PANEL_GROUPS } from "@/lib/examination-panel";
import { getViewableInstitutionIds } from "@/lib/school-access";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Examinations — Youth programme",
};

export default async function ExaminationsHubPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const isSuperAdmin = Boolean(session.user.isSuperAdmin);
  const viewableIds = await getViewableInstitutionIds(userId, isSuperAdmin);
  const db = getDb();

  const schoolRows =
    viewableIds.length === 0
      ? []
      : await db
          .select({
            id: institutions.id,
            name: institutions.name,
            siteName: sites.name,
          })
          .from(institutions)
          .innerJoin(sites, eq(sites.id, institutions.siteId))
          .where(inArray(institutions.id, viewableIds))
          .orderBy(asc(institutions.name));

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold text-stone-900">Examinations</h1>
      <p className="mt-2 max-w-3xl text-sm text-stone-600">
        Formal exam periods per school: types, timetables, seating, routines, mark registers, and
        reports.
        <span className="font-medium text-stone-800"> Available</span> opens live tools (or a detail
        page explaining where they live); <span className="font-medium text-stone-800">Coming soon</span>{" "}
        marks roadmap items such as online papers and grading schemes.
      </p>

      <div className="mt-10 flex flex-col gap-10">
        {EXAMINATION_PANEL_GROUPS.map((group) => (
          <section key={group.id} aria-labelledby={`ex-${group.id}`}>
            <h2 id={`ex-${group.id}`} className="text-lg font-semibold text-stone-900">
              {group.title}
            </h2>
            {group.description ? (
              <p className="mt-1 max-w-3xl text-sm text-stone-600">{group.description}</p>
            ) : null}
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {group.items.map((item) => {
                const badge =
                  item.status === "live" ? (
                    <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold uppercase text-teal-900">
                      Available
                    </span>
                  ) : (
                    <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-bold uppercase text-stone-700">
                      Coming soon
                    </span>
                  );

                const inner = (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-stone-900">{item.title}</p>
                      {badge}
                    </div>
                    <p className="mt-2 text-sm text-stone-600">{item.description}</p>
                    <p className="mt-3 text-sm font-medium text-teal-800">
                      {item.status === "live" && item.href ? "Open →" : "Details →"}
                    </p>
                  </>
                );

                if (item.status === "live" && item.href) {
                  return (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        className="block h-full rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/40"
                      >
                        {inner}
                      </Link>
                    </li>
                  );
                }

                return (
                  <li key={item.key}>
                    <Link
                      href={`/examinations/feature/${item.key}`}
                      className="block h-full rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-stone-300 hover:bg-stone-50"
                    >
                      {inner}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <h2 className="mt-12 text-lg font-semibold text-stone-900">Open a school</h2>
      <p className="mt-1 max-w-2xl text-sm text-stone-600">
        Choose a school to create exam periods and edit schedules, seat plans, routines, and marks.
      </p>

      {schoolRows.length === 0 ? (
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          No schools are visible to your account yet. Super admins can add schools under{" "}
          <Link href="/admin/institutions" className="font-semibold underline">
            Admin → Schools
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {schoolRows.map((s) => (
            <li key={s.id}>
              <Link
                href={`/examinations/${s.id}`}
                className="block rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/40"
              >
                <p className="text-sm font-semibold text-stone-900">{s.name}</p>
                <p className="mt-1 text-sm text-stone-500">{s.siteName}</p>
                <p className="mt-3 text-sm font-medium text-teal-800 underline">Open examination centre →</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <section className="mt-12 rounded-2xl border border-stone-200 bg-stone-50/80 p-5">
        <h2 className="text-sm font-semibold text-stone-900">Programme reports</h2>
        <p className="mt-2 text-sm text-stone-600">
          Broader session and PDF exports (not exam-specific) live under Reports and Evaluations.
        </p>
        <ul className="mt-3 flex flex-wrap gap-4 text-sm">
          <li>
            <Link href="/reports" className="font-semibold text-teal-800 underline">
              PDF programme reports
            </Link>
          </li>
          <li>
            <Link href="/evaluations" className="font-semibold text-teal-800 underline">
              Evaluation scores
            </Link>
          </li>
          <li>
            <Link href="/attendance" className="font-semibold text-teal-800 underline">
              Student attendance (roll)
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
