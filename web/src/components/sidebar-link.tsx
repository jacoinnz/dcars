"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Anchor } from "@mantine/core";

export function SidebarLink(props: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const { href } = props;

  const active =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Anchor
      component={Link}
      href={href}
      size="sm"
      display="block"
      px="sm"
      py={8}
      style={{
        borderRadius: "var(--mantine-radius-md)",
        textDecoration: "none",
        transition: "background-color 120ms ease, color 120ms ease",
        color: active ? "#fafaf9" : "#d6d3d1",
        backgroundColor: active ? "rgba(34, 139, 230, 0.45)" : undefined,
        fontWeight: active ? 600 : 400,
      }}
      styles={{
        root: {
          "&:hover": {
            color: "var(--mantine-color-white)",
            backgroundColor: active ? "rgba(34, 139, 230, 0.45)" : "rgba(41, 37, 36, 0.8)",
          },
        },
      }}
    >
      {props.children}
    </Anchor>
  );
}
