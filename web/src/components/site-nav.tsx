import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/entry", label: "Register participant" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/reports", label: "Reports" },
] as const;

export function SiteNav() {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
            Youth programme
          </p>
          <p className="text-sm text-stone-600">Data entry and reporting</p>
        </div>
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
      </div>
    </header>
  );
}
