import { Stack, Text, Title } from "@mantine/core";
import { asc } from "drizzle-orm";
import { AppPage } from "@/components/app-page";
import { getDb } from "@/db";
import { sites } from "@/db/schema";
import { adminCreateSite, adminDeleteSite, adminUpdateSite } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sites — Admin",
};

export default async function AdminSitesPage() {
  const db = getDb();
  const rows = await db.select().from(sites).orderBy(asc(sites.name));

  return (
    <AppPage>
      <Stack gap="lg">
      <Title order={1}>Sites</Title>
      <Text c="dimmed" size="sm" maw={520}>
        Each site appears in dashboards and registration. Codes must be unique (e.g. short
        abbreviations).
      </Text>

      <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-900">Add site</h2>
        <form action={adminCreateSite} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-xs font-medium text-stone-700">
            Name
            <input
              name="name"
              required
              className="ml-1 mt-1 block rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-stone-700">
            Code
            <input
              name="code"
              required
              className="ml-1 mt-1 block rounded-lg border border-stone-300 px-2 py-1.5 text-sm uppercase"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-semibold text-white hover:bg-stone-800"
          >
            Create
          </button>
        </form>
      </section>

      <section className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-stone-900">Existing sites</h2>
        </div>
        <ul className="divide-y divide-stone-100">
          {rows.map((s) => (
            <li key={s.id} className="px-4 py-4">
              <form
                action={adminUpdateSite.bind(null, s.id)}
                className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
              >
                <label className="text-xs font-medium text-stone-700">
                  Name
                  <input
                    name="name"
                    defaultValue={s.name}
                    required
                    className="ml-1 mt-1 block rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="text-xs font-medium text-stone-700">
                  Code
                  <input
                    name="code"
                    defaultValue={s.code}
                    required
                    className="ml-1 mt-1 block rounded-lg border border-stone-300 px-2 py-1.5 text-sm uppercase"
                  />
                </label>
                <button
                  type="submit"
                  className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm font-medium text-stone-900 hover:bg-stone-100"
                >
                  Save
                </button>
              </form>
              <form action={adminDeleteSite.bind(null, s.id)} className="mt-3">
                <button
                  type="submit"
                  className="text-xs font-medium text-red-700 underline hover:text-red-900"
                >
                  Delete site
                </button>
              </form>
            </li>
          ))}
        </ul>
        {rows.length === 0 ? (
          <p className="px-4 py-6 text-sm text-stone-600">No sites yet — add one above.</p>
        ) : null}
      </section>
      </Stack>
    </AppPage>
  );
}
