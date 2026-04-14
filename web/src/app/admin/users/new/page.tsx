import Link from "next/link";
import { adminCreateUser } from "@/app/admin/actions";

export const metadata = {
  title: "New user — Admin",
};

export default function AdminNewUserPage() {
  return (
    <div>
      <Link href="/admin/users" className="text-sm font-medium text-teal-800 underline">
        ← Users
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-stone-900">New user</h1>
      <p className="mt-2 text-sm text-stone-600">
        After creation you can assign per-site permissions (unless they are a super admin).
      </p>

      <form action={adminCreateUser} className="mt-8 max-w-md space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-stone-800">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-stone-800">
          Display name
          <input
            name="name"
            required
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-stone-800">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-stone-800">
          <input name="isSuperAdmin" type="checkbox" className="rounded border-stone-300" />
          Super admin (full access, no per-site matrix)
        </label>
        <button
          type="submit"
          className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800"
        >
          Create user
        </button>
      </form>
    </div>
  );
}
