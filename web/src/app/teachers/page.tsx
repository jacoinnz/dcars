import Link from "next/link";
import { asc, eq, inArray } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { institutions, sites } from "@/db/schema";
import { authOptions } from "@/lib/auth-options";
import { TEACHER_PANEL_GROUPS } from "@/lib/teacher-panel";
import { getViewableInstitutionIds } from "@/lib/school-access";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Teacher panel — Youth programme",
};

export default async function TeachersHubPage() {
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
      <h1 className="text-2xl font-semibold text-stone-900">Teacher panel</h1>
      <p className="mt-2 max-w-3xl text-sm text-stone-600">
        One place for homework (coming soon), materials, syllabuses, evaluation reports, class
        assignments, student administration, exam marks, and attendance. Items marked{" "}
        <span className="font-medium text-stone-800">Available</span> open tools that exist today;
        <span className="font-medium text-stone-800"> Coming soon</span> shows what is on the roadmap.
      </p>

      <div className="mt-10 flex flex-col gap-12">
        {TEACHER_PANEL_GROUPS.map((group) => (
          <section key={group.id} aria-labelledby={`tp-${group.id}`}>
            <h2 id={`tp-${group.id}`} className="text-lg font-semibold text-stone-900">
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
                      {item.status === "live" && item.href?.startsWith("/") ? "Open →" : "Details →"}
                    </p>
                  </>
                );

                if (item.status === "live" && item.href?.startsWith("/")) {
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
                      href={`/teachers/feature/${item.key}`}
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

      <section id="syllabus-by-school" className="mt-12 scroll-mt-24">
        <h2 className="text-lg font-semibold text-stone-900">Syllabus by school</h2>
        <p className="mt-1 max-w-2xl text-sm text-stone-600">
          Published syllabus content is read-only; super admins edit entries under{" "}
          <Link href="/admin/institutions" className="font-semibold text-teal-800 underline">
            Admin → Schools
          </Link>
          .
        </p>
        {schoolRows.length === 0 ? (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            No schools are visible yet. Ask for site access or school staff assignment.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {schoolRows.map((s) => (
              <li
                key={s.id}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm font-semibold text-stone-900">
                  {s.name}
                  <span className="font-normal text-stone-500"> — {s.siteName}</span>
                </p>
                <p className="mt-3">
                  <Link
                    href={`/evaluations/syllabuses/${s.id}`}
                    className="text-sm font-semibold text-teal-800 underline decoration-teal-300 underline-offset-2"
                  >
                    Open syllabus &amp; download
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-12 border-t border-stone-200 pt-8 text-sm text-stone-600">
        Also see:{" "}
        <Link href="/communications" className="font-semibold text-teal-800 underline">
          Communications
        </Link>{" "}
        (school notices and events),{" "}
        <Link href="/students" className="font-semibold text-teal-800 underline">
          Student information
        </Link>
        .
      </p>
    </div>
  );
}
