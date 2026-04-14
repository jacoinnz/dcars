import Link from "next/link";
import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { appUsers } from "@/db/schema";
import { adminDeleteUser } from "@/app/admin/actions";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Users — Admin",
};

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  const db = getDb();
  const rows = await db.select().from(appUsers).orderBy(asc(appUsers.email));

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Users</h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-600">
            Staff accounts for the same database. Super admins can manage sites and users; other
            accounts receive per-site permissions.
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="inline-flex rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
        >
          New user
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-600">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t border-stone-100">
                <td className="px-4 py-3 font-medium text-stone-900">{u.email}</td>
                <td className="px-4 py-3 text-stone-800">{u.name}</td>
                <td className="px-4 py-3 text-stone-800">
                  {u.isSuperAdmin ? (
                    <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-900">
                      Super admin
                    </span>
                  ) : (
                    <span className="text-stone-500">Standard</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="font-semibold text-teal-800 underline"
                  >
                    Edit
                  </Link>
                  {session?.user?.id !== u.id ? (
                    <form action={adminDeleteUser.bind(null, u.id)} className="mt-2 inline">
                      <button
                        type="submit"
                        className="text-xs font-medium text-red-700 underline hover:text-red-900"
                      >
                        Delete
                      </button>
                    </form>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="px-4 py-6 text-sm text-stone-600">No users yet.</p>
        ) : null}
      </div>
    </div>
  );
}
