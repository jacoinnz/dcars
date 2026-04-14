import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { getDb } from "@/db";
import { institutionSyllabuses, institutions, sites } from "@/db/schema";
import { PrintPageButton } from "@/components/print-page-button";
import { authOptions } from "@/lib/auth-options";
import { getViewableInstitutionIds } from "@/lib/school-access";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ institutionId: string }> };

export default async function InstitutionSyllabusesPage({ params }: Props) {
  const { institutionId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const viewable = await getViewableInstitutionIds(session.user.id, Boolean(session.user.isSuperAdmin));
  if (!viewable.includes(institutionId)) {
    redirect("/students");
  }

  const db = getDb();
  const [row] = await db
    .select({
      name: institutions.name,
      siteName: sites.name,
    })
    .from(institutions)
    .innerJoin(sites, eq(sites.id, institutions.siteId))
    .where(eq(institutions.id, institutionId))
    .limit(1);
  if (!row) notFound();

  const isSuperAdmin = Boolean(session.user.isSuperAdmin);

  const syllabuses = await db
    .select()
    .from(institutionSyllabuses)
    .where(eq(institutionSyllabuses.institutionId, institutionId))
    .orderBy(asc(institutionSyllabuses.sortOrder), asc(institutionSyllabuses.title));

  return (
    <div className="pe-app-page pe-app-page--3xl">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <Link href="/teachers" className="font-medium text-teal-800 underline">
          ← Teachers
        </Link>
        <Link href="/students" className="text-teal-700/90 underline decoration-teal-200/80">
          Student information
        </Link>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="pe-app-h1">Syllabuses</h1>
          <p className="mt-1 text-sm text-stone-600">
            <span className="font-medium text-stone-800">{row.name}</span>
            <span className="text-stone-500"> · {row.siteName}</span>
          </p>
        </div>
        <PrintPageButton />
      </div>
      {isSuperAdmin ? (
        <p className="mt-2 text-sm text-stone-600">
          Edit syllabuses in{" "}
          <Link
            href={`/admin/institutions/${institutionId}`}
            className="font-semibold text-teal-800 underline"
          >
            Admin → this school
          </Link>
          .
        </p>
      ) : (
        <p className="mt-2 text-sm text-stone-600">
          Syllabuses are maintained per school by administrators.
        </p>
      )}

      {syllabuses.length === 0 ? (
        <p className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          No syllabuses published for this school yet.
        </p>
      ) : (
        <ul className="mt-8 space-y-8">
          {syllabuses.map((s) => (
            <li key={s.id} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-stone-900">{s.title}</h2>
              {s.summary ? (
                <p className="mt-2 text-sm font-medium text-stone-700">{s.summary}</p>
              ) : null}
              <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-stone-800">
                {s.body}
              </div>
              <p className="mt-4 text-xs text-stone-500">
                Updated {s.updatedAt.toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
