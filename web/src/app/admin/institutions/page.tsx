import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { institutions, sites } from "@/db/schema";
import {
  adminCreateInstitution,
  adminDeleteInstitution,
  adminUpdateInstitution,
} from "@/app/admin/school-actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Schools — Admin",
};

export default async function AdminInstitutionsPage() {
  const db = getDb();
  const rows = await db
    .select({
      id: institutions.id,
      name: institutions.name,
      code: institutions.code,
      siteName: sites.name,
      siteCode: sites.code,
      siteId: institutions.siteId,
    })
    .from(institutions)
    .innerJoin(sites, eq(sites.id, institutions.siteId))
    .orderBy(asc(institutions.name));

  const siteList = await db.select().from(sites).orderBy(asc(sites.name));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">Schools & classes</h1>
      <p className="mt-2 max-w-2xl text-sm text-stone-600">
        Create a school under a programme site, then add classes and assign staff on the school
        detail page. Staff can record evaluations and manage students from Evaluations in the main
        app.
      </p>

      <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-900">Add school</h2>
        {siteList.length === 0 ? (
          <p className="mt-3 text-sm text-amber-800">
            Create a programme site under <Link href="/admin/sites">Sites</Link> first.
          </p>
        ) : null}
        <form action={adminCreateInstitution} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-xs font-medium text-stone-700">
            Programme site
            <select
              name="siteId"
              required
              className="ml-1 mt-1 block rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
            >
              {siteList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-stone-700">
            School name
            <input
              name="name"
              required
              className="ml-1 mt-1 block rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-stone-700">
            Code <span className="font-normal text-stone-500">(optional)</span>
            <input name="code" className="ml-1 mt-1 block rounded-lg border border-stone-300 px-2 py-1.5 text-sm" />
          </label>
          <button
            type="submit"
            disabled={siteList.length === 0}
            className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-50"
          >
            Create
          </button>
        </form>
      </section>

      <section className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-stone-900">Schools</h2>
        </div>
        <ul className="divide-y divide-stone-100">
          {rows.map((r) => (
            <li key={r.id} className="px-4 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Link
                    href={`/admin/institutions/${r.id}`}
                    className="font-semibold text-teal-800 underline"
                  >
                    {r.name}
                  </Link>
                  {r.code ? (
                    <span className="ml-2 text-sm text-stone-500">({r.code})</span>
                  ) : null}
                  <p className="text-xs text-stone-600">
                    Site: {r.siteName} ({r.siteCode})
                  </p>
                </div>
                <form
                  action={adminUpdateInstitution.bind(null, r.id)}
                  className="flex flex-wrap items-end gap-2"
                >
                  <label className="text-xs text-stone-700">
                    Name
                    <input
                      name="name"
                      defaultValue={r.name}
                      required
                      className="ml-1 block rounded border border-stone-300 px-2 py-1 text-sm"
                    />
                  </label>
                  <label className="text-xs text-stone-700">
                    Code
                    <input
                      name="code"
                      defaultValue={r.code ?? ""}
                      className="ml-1 block rounded border border-stone-300 px-2 py-1 text-sm"
                    />
                  </label>
                  <button
                    type="submit"
                    className="rounded border border-stone-300 bg-stone-50 px-2 py-1 text-xs font-medium"
                  >
                    Save
                  </button>
                </form>
              </div>
              <form action={adminDeleteInstitution.bind(null, r.id)} className="mt-2">
                <button
                  type="submit"
                  className="text-xs font-medium text-red-700 underline hover:text-red-900"
                >
                  Delete school
                </button>
              </form>
            </li>
          ))}
        </ul>
        {rows.length === 0 ? (
          <p className="px-4 py-6 text-sm text-stone-600">No schools yet.</p>
        ) : null}
      </section>
    </div>
  );
}
