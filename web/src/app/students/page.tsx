import Link from "next/link";
import { asc, eq, inArray } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { institutions, sites } from "@/db/schema";
import { authOptions } from "@/lib/auth-options";
import { getViewableInstitutionIds } from "@/lib/school-access";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Student information — Youth programme",
};

export default async function StudentsHubPage() {
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
      <h1 className="text-2xl font-semibold text-stone-900">Student information</h1>
      <p className="mt-2 max-w-2xl text-sm text-stone-600">
        Registration, rosters, attendance, and academic reporting — start here for anything tied to
        young people in schools on the programme.
      </p>

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          Data entry &amp; daily records
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          <li>
            <Link
              href="/entry"
              className="block rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/40"
            >
              <p className="text-sm font-semibold text-stone-900">Participant registration</p>
              <p className="mt-2 text-sm text-stone-600">
                Submit a new youth registration; records can later be linked to a school student
                profile.
              </p>
            </Link>
          </li>
          <li>
            <Link
              href="/students/attendance"
              className="block rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/40"
            >
              <p className="text-sm font-semibold text-stone-900">Student attendance</p>
              <p className="mt-2 text-sm text-stone-600">
                Staff daily roll, student portal, and family views — open the hub to choose where to
                go.
              </p>
            </Link>
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          Student admission, rosters &amp; classes
        </h2>
        {schoolRows.length === 0 ? (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            No schools are visible to your account yet. Super admins can add schools under{" "}
            <Link href="/admin/institutions" className="font-semibold underline">
              Admin → Schools
            </Link>
            .
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
                <ul className="mt-3 flex flex-col gap-2 text-sm">
                  <li>
                    <Link
                      href={`/evaluations/students/${s.id}`}
                      className="font-medium text-teal-800 underline decoration-teal-300 underline-offset-2 hover:text-teal-950"
                    >
                      Manage students — list, admission &amp; classes
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/evaluations/syllabuses/${s.id}`}
                      className="font-medium text-teal-800 underline decoration-teal-300 underline-offset-2 hover:text-teal-950"
                    >
                      Syllabuses
                    </Link>
                  </li>
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          Reports &amp; families
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          <li>
            <Link
              href="/evaluations"
              className="block rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/40"
            >
              <p className="text-sm font-semibold text-stone-900">Evaluation reports</p>
              <p className="mt-2 text-sm text-stone-600">
                Filter scores by school, class, and date range; enter performance where you have
                staff access.
              </p>
            </Link>
          </li>
          <li>
            <Link
              href="/reports"
              className="block rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/40"
            >
              <p className="text-sm font-semibold text-stone-900">Programme reports (PDF)</p>
              <p className="mt-2 text-sm text-stone-600">
                Export a dated PDF summary for funders or internal review.
              </p>
            </Link>
          </li>
          <li>
            <Link
              href="/family"
              className="block rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/40"
            >
              <p className="text-sm font-semibold text-stone-900">Family attendance</p>
              <p className="mt-2 text-sm text-stone-600">
                Guardian view: see linked children&apos;s attendance when your school has connected
                your account.
              </p>
            </Link>
          </li>
        </ul>
      </section>

      <p className="mt-12 text-sm text-stone-600">
        <Link href="/admin/institutions" className="font-semibold text-teal-800 underline">
          Admin → Schools
        </Link>{" "}
        for staff assignment, guardian links, and attendance messages to families.
      </p>
    </div>
  );
}
