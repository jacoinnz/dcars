"use client";

import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Anchor, Box, ScrollArea, Stack, Text } from "@mantine/core";
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

function SidebarNavLink(props: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const hash = useHashFragment();
  const active = navLinkIsActive(pathname, props.href, hash);

  return (
    <Anchor
      component={Link}
      href={props.href}
      size="sm"
      fw={active ? 600 : 400}
      display="block"
      px="sm"
      py={8}
      style={{
        borderRadius: "var(--mantine-radius-md)",
        textDecoration: "none",
        color: active ? "#fafaf9" : "#d6d3d1",
        backgroundColor: active ? "rgba(13, 148, 136, 0.45)" : undefined,
      }}
      styles={{
        root: {
          "&:hover": {
            color: "var(--mantine-color-white)",
            backgroundColor: active ? "rgba(13, 148, 136, 0.45)" : "rgba(41, 37, 36, 0.8)",
          },
        },
      }}
    >
      {props.children}
    </Anchor>
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
    <Box
      component="aside"
      className="flex w-full shrink-0 flex-col border-b border-stone-800 bg-stone-950 md:h-screen md:w-60 md:border-b-0 md:border-r"
    >
      <Box
        p="md"
        style={{
          borderBottom: "1px solid var(--mantine-color-dark-7)",
        }}
      >
        <Text size="xs" fw={600} tt="uppercase" c="teal.4" lts={1}>
          Youth programme
        </Text>
        <Text fz={11} c="dimmed" mt={4}>
          Data entry &amp; reporting
        </Text>
      </Box>

      <ScrollArea flex={1} type="scroll" offsetScrollbars>
        <Stack gap="lg" px="sm" py="md">
          {config.sections.map((section) => (
            <Box key={section.id}>
              <Text fz={10} fw={600} tt="uppercase" c="dimmed" lts={1} px="xs" mb="xs">
                {section.title}
              </Text>
              <Stack gap={4}>
                {section.items.map((item) => (
                  <SidebarNavLink key={item.id} href={item.href}>
                    {item.label}
                  </SidebarNavLink>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      </ScrollArea>

      <Box
        p="sm"
        style={{
          borderTop: "1px solid var(--mantine-color-dark-7)",
        }}
      >
        <NavUserMenu
          email={props.email}
          isSuperAdmin={props.isSuperAdmin}
          variant="sidebar"
        />
      </Box>
    </Box>
  );
}
