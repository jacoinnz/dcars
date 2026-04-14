"use client";

import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getDefaultSidebarConfig,
  loadSidebarConfig,
  normalizeSidebarConfigForUser,
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
  const [config, setConfig] = useState<SidebarNavConfig>(() =>
    getDefaultSidebarConfig({ isSuperAdmin: props.isSuperAdmin }),
  );

  useEffect(() => {
    const apply = () => {
      const raw = loadSidebarConfig() ?? getDefaultSidebarConfig({ isSuperAdmin: props.isSuperAdmin });
      setConfig(normalizeSidebarConfigForUser(raw, { isSuperAdmin: props.isSuperAdmin }));
    };
    apply();
    window.addEventListener("storage", apply);
    window.addEventListener(SIDEBAR_CONFIG_EVENT, apply);
    return () => {
      window.removeEventListener("storage", apply);
      window.removeEventListener(SIDEBAR_CONFIG_EVENT, apply);
    };
  }, [props.isSuperAdmin]);

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
