"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SidebarLink(props: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const { href } = props;

  const active =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
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
