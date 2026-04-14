import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isSuperAdmin) {
    redirect("/");
  }

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <nav className="mb-8 flex flex-wrap gap-2 border-b border-stone-200 pb-4 text-sm">
        <Link
          href="/admin"
          className="rounded-full px-3 py-1.5 font-medium text-stone-700 hover:bg-stone-100"
        >
          Control center
        </Link>
        <Link
          href="/admin/users"
          className="rounded-full px-3 py-1.5 font-medium text-stone-700 hover:bg-stone-100"
        >
          Users
        </Link>
        <Link
          href="/admin/sites"
          className="rounded-full px-3 py-1.5 font-medium text-stone-700 hover:bg-stone-100"
        >
          Sites
        </Link>
        <Link
          href="/admin/institutions"
          className="rounded-full px-3 py-1.5 font-medium text-stone-700 hover:bg-stone-100"
        >
          Schools
        </Link>
        <Link
          href="/admin/notices"
          className="rounded-full px-3 py-1.5 font-medium text-stone-700 hover:bg-stone-100"
        >
          Notices
        </Link>
        <Link
          href="/"
          className="ml-auto rounded-full px-3 py-1.5 text-stone-600 hover:bg-stone-100"
        >
          ← App home
        </Link>
      </nav>
      {children}
    </div>
  );
}
