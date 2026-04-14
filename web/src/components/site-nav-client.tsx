"use client";

import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getDefaultSidebarConfig,
  loadSidebarConfig,
  type SidebarNavConfig,
  SIDEBAR_CONFIG_EVENT,
} from "@/lib/sidebar-config";
import { NavUserMenu } from "@/components/nav-user-menu";

function useHashFragment() {
  const [hash, setHash] = useState("");
  useLayoutEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  return hash;
}

function navLinkIsActive(pathname: string, href: string, currentHash: string) {
  const i = href.indexOf("#");
  const pathPart = i >= 0 ? href.slice(0, i) : href;
  const frag = i >= 0 ? href.slice(i + 1) : null;

  const pathMatches =
    pathPart === "/"
      ? pathname === "/"
      : pathPart === "/admin"
        ? pathname === "/admin"
        : pathname === pathPart || pathname.startsWith(`${pathPart}/`);
  if (!pathMatches) return false;

  if (frag === null) {
    return currentHash === "" || currentHash === "#";
  }
  return currentHash === `#${frag}` || currentHash === frag;
}

function NavLink(props: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const hash = useHashFragment();
  const active = navLinkIsActive(pathname, props.href, hash);

  return (
    <Link
      href={props.href}
      className={`block rounded-lg px-3 py-2 text-sm transition ${
        active
          ? "bg-teal-900/60 font-medium text-white"
          : "text-stone-300 hover:bg-stone-800/80 hover:text-white"
      }`}
    >
      {props.children}
    </Link>
  );
}

export function SiteNavClient(props: {
  email: string | null;
  isSuperAdmin: boolean;
}) {
  const [config, setConfig] = useState<SidebarNavConfig>(() => getDefaultSidebarConfig());

  useEffect(() => {
    const apply = () => {
      setConfig(loadSidebarConfig() ?? getDefaultSidebarConfig());
    };
    apply();
    window.addEventListener("storage", apply);
    window.addEventListener(SIDEBAR_CONFIG_EVENT, apply);
    return () => {
      window.removeEventListener("storage", apply);
      window.removeEventListener(SIDEBAR_CONFIG_EVENT, apply);
    };
  }, []);

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-stone-800 bg-stone-950 md:h-screen md:w-60 md:border-b-0 md:border-r md:border-stone-800">
      <div className="border-b border-stone-800 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-400">Youth programme</p>
        <p className="mt-1 text-[11px] text-stone-500">Data entry &amp; reporting</p>
      </div>

      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
        {config.sections.map((section) => (
          <div key={section.id}>
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.id}>
                  <NavLink href={item.href}>{item.label}</NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {props.isSuperAdmin ? (
          <div>
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              Administration
            </p>
            <ul className="space-y-0.5">
              <li>
                <NavLink href="/admin">Admin</NavLink>
              </li>
              <li>
                <NavLink href="/admin/module/admission-query">Admission query</NavLink>
              </li>
              <li>
                <NavLink href="/admin/module/visitor-book">Visitors book</NavLink>
              </li>
              <li>
                <NavLink href="/admin/module/complaint-phone-call-log">Complaint phone call log</NavLink>
              </li>
              <li>
                <NavLink href="/admin/module/student-id-card">Student ID card</NavLink>
              </li>
              <li>
                <NavLink href="/admin/module/general-id-card">General ID card</NavLink>
              </li>
              <li>
                <NavLink href="/admin/module/staff-id-card">Staff ID card</NavLink>
              </li>
            </ul>
          </div>
        ) : null}
      </nav>

      <div className="border-t border-stone-800 p-3">
        <NavUserMenu
          email={props.email}
          isSuperAdmin={props.isSuperAdmin}
          variant="sidebar"
        />
      </div>
    </aside>
  );
}
