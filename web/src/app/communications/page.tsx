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
  title: "Communications — Youth programme",
};

export default async function CommunicationsHubPage() {
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
      <h1 className="text-2xl font-semibold text-stone-900">Communications</h1>
      <p className="mt-2 max-w-2xl text-sm text-stone-600">
        Notice manager for each school: holidays and closures, events, and out-of-class activities —
        with optional date ranges so families and staff see what is coming up.
      </p>

      {schoolRows.length === 0 ? (
        <p className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          No schools are visible to your account yet. Super admins can add schools under{" "}
          <Link href="/admin/institutions" className="font-semibold underline">
            Admin → Schools
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {schoolRows.map((s) => (
            <li key={s.id}>
              <Link
                href={`/communications/${s.id}`}
                className="block rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/40"
              >
                <p className="text-sm font-semibold text-stone-900">{s.name}</p>
                <p className="mt-1 text-sm text-stone-500">{s.siteName}</p>
                <p className="mt-3 text-sm font-medium text-teal-800 underline">Open notice manager →</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
