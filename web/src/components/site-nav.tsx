import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { NavUserMenu } from "@/components/nav-user-menu";

const links = [
  { href: "/", label: "Home" },
  { href: "/entry", label: "Register participant" },
  { href: "/students", label: "Students" },
  { href: "/hr", label: "HR" },
  { href: "/teachers", label: "Teachers" },
  { href: "/examinations", label: "Exams" },
  { href: "/communications", label: "Comms" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/reports", label: "Reports" },
  { href: "/parents", label: "Parents" },
  { href: "/student", label: "Student" },
  { href: "/family", label: "Family" },
] as const;

export async function SiteNav() {
  const session = await getServerSession(authOptions);

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
            Youth programme
          </p>
          <p className="text-sm text-stone-600">Data entry and reporting</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <nav className="flex flex-wrap gap-2 text-sm">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-stone-800 transition hover:border-teal-300 hover:bg-teal-50"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <NavUserMenu
            email={session?.user?.email ?? null}
            isSuperAdmin={Boolean(session?.user?.isSuperAdmin)}
          />
        </div>
      </div>
    </header>
  );
}
