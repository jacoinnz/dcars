import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { appUsers, siteUserPermissions, sites } from "@/db/schema";
import { adminSaveUserSitePermissions, adminUpdateUser } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params;
  const db = getDb();

  const [user] = await db.select().from(appUsers).where(eq(appUsers.id, id)).limit(1);
  if (!user) notFound();

  const siteRows = await db.select().from(sites).orderBy(asc(sites.name));
  const permRows = await db
    .select()
    .from(siteUserPermissions)
    .where(eq(siteUserPermissions.userId, id));

  const permBySite = new Map(permRows.map((p) => [p.siteId, p]));

  return (
    <div>
      <Link href="/admin/users" className="text-sm font-medium text-teal-800 underline">
        ← Users
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-stone-900">Edit user</h1>
      <p className="mt-2 text-sm text-stone-600">{user.email}</p>

      <form action={adminUpdateUser.bind(null, id)} className="mt-8 max-w-lg space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-900">Account</h2>
        <label className="block text-sm font-medium text-stone-800">
          Email
          <input
            name="email"
            type="email"
            defaultValue={user.email}
            required
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-stone-800">
          Display name
          <input
            name="name"
            defaultValue={user.name}
            required
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-stone-800">
          New password (leave blank to keep current)
          <input
            name="newPassword"
            type="password"
            autoComplete="new-password"
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-stone-800">
          <input
            name="isSuperAdmin"
            type="checkbox"
            defaultChecked={user.isSuperAdmin}
            className="rounded border-stone-300"
          />
          Super admin
        </label>
        <button
          type="submit"
          className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800"
        >
          Save account
        </button>
      </form>

      {user.isSuperAdmin ? (
        <p className="mt-8 max-w-2xl rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
          Super admins have full access to all sites. Per-site permissions are cleared while this
          role is enabled.
        </p>
      ) : (
        <form
          action={adminSaveUserSitePermissions.bind(null, id)}
          className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
        >
          <div className="border-b border-stone-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-stone-900">Site permissions</h2>
            <p className="mt-1 text-xs text-stone-600">
              View affects dashboards and reports; Create is required for participant registration.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-600">
                <tr>
                  <th className="px-4 py-3">Site</th>
                  <th className="px-4 py-3">View</th>
                  <th className="px-4 py-3">Create</th>
                  <th className="px-4 py-3">Edit</th>
                  <th className="px-4 py-3">Delete</th>
                </tr>
              </thead>
              <tbody>
                {siteRows.map((s) => {
                  const p = permBySite.get(s.id);
                  return (
                    <tr key={s.id} className="border-t border-stone-100">
                      <td className="px-4 py-3 font-medium text-stone-900">
                        {s.name}{" "}
                        <span className="text-stone-500">({s.code})</span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          name={`site_${s.id}_view`}
                          type="checkbox"
                          defaultChecked={p?.canView ?? false}
                          className="rounded border-stone-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          name={`site_${s.id}_create`}
                          type="checkbox"
                          defaultChecked={p?.canCreate ?? false}
                          className="rounded border-stone-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          name={`site_${s.id}_update`}
                          type="checkbox"
                          defaultChecked={p?.canUpdate ?? false}
                          className="rounded border-stone-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          name={`site_${s.id}_delete`}
                          type="checkbox"
                          defaultChecked={p?.canDelete ?? false}
                          className="rounded border-stone-300"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {siteRows.length === 0 ? (
            <p className="px-4 py-6 text-sm text-stone-600">
              No sites defined yet.{" "}
              <Link href="/admin/sites" className="font-semibold text-teal-800 underline">
                Add sites
              </Link>{" "}
              first.
            </p>
          ) : (
            <div className="border-t border-stone-200 px-4 py-4">
              <button
                type="submit"
                className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
              >
                Save permissions
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
