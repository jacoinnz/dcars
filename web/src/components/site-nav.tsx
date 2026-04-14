import type { ReactNode } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { NavUserMenu } from "@/components/nav-user-menu";
import { SidebarLink } from "@/components/sidebar-link";

const overview = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/", label: "Home" },
] as const;

const programme = [
  { href: "/entry", label: "Register participant" },
  { href: "/reports", label: "Reports" },
] as const;

const studentsSchool = [
  { href: "/students", label: "Students" },
  { href: "/students/attendance", label: "Student attendance" },
  { href: "/evaluations", label: "Evaluations" },
  { href: "/examinations", label: "Examinations" },
  { href: "/communications", label: "Communications" },
] as const;

const people = [
  { href: "/hr", label: "HR" },
  { href: "/teachers", label: "Teachers" },
  { href: "/parents", label: "Parents" },
] as const;

const portals = [
  { href: "/student", label: "Student portal" },
  { href: "/family", label: "Family" },
] as const;

const teaching = [{ href: "/teacher-content", label: "Teacher content" }] as const;

function Section(props: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
        {props.title}
      </p>
      <ul className="space-y-0.5">{props.children}</ul>
    </div>
  );
}

export async function SiteNav() {
  const session = await getServerSession(authOptions);
  const isSuperAdmin = Boolean(session?.user?.isSuperAdmin);

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-stone-800 bg-stone-950 md:h-screen md:w-60 md:border-b-0 md:border-r md:border-stone-800">
      <div className="border-b border-stone-800 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-400">Youth programme</p>
        <p className="mt-1 text-[11px] text-stone-500">Data entry &amp; reporting</p>
      </div>

      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
        <Section title="Overview">
          {overview.map((l) => (
            <li key={l.href}>
              <SidebarLink href={l.href}>{l.label}</SidebarLink>
            </li>
          ))}
        </Section>

        <Section title="Programme">
          {programme.map((l) => (
            <li key={l.href}>
              <SidebarLink href={l.href}>{l.label}</SidebarLink>
            </li>
          ))}
        </Section>

        <Section title="Students &amp; school">
          {studentsSchool.map((l) => (
            <li key={l.href}>
              <SidebarLink href={l.href}>{l.label}</SidebarLink>
            </li>
          ))}
        </Section>

        <Section title="People">
          {people.map((l) => (
            <li key={l.href}>
              <SidebarLink href={l.href}>{l.label}</SidebarLink>
            </li>
          ))}
        </Section>

        <Section title="Portals">
          {portals.map((l) => (
            <li key={l.href}>
              <SidebarLink href={l.href}>{l.label}</SidebarLink>
            </li>
          ))}
        </Section>

        <Section title="Teaching">
          {teaching.map((l) => (
            <li key={l.href}>
              <SidebarLink href={l.href}>{l.label}</SidebarLink>
            </li>
          ))}
        </Section>

        {isSuperAdmin ? (
          <Section title="Administration">
            <li>
              <SidebarLink href="/admin">Admin</SidebarLink>
            </li>
          </Section>
        ) : null}
      </nav>

      <div className="border-t border-stone-800 p-3">
        <NavUserMenu
          email={session?.user?.email ?? null}
          isSuperAdmin={isSuperAdmin}
          variant="sidebar"
        />
      </div>
    </aside>
  );
}
