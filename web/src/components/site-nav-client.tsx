"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Box, NavLink, ScrollArea, Stack, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  getDefaultSidebarConfig,
  loadSidebarConfig,
  normalizeSidebarConfigForUser,
  type SidebarNavConfig,
  type SidebarNavLink,
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

/** Split `href` into pathname (no query), `tab` query, and hash fragment (without `#`). */
function splitNavHref(href: string): { path: string; tab: string | null; hashFrag: string | null } {
  const hashIdx = href.indexOf("#");
  const beforeHash = hashIdx >= 0 ? href.slice(0, hashIdx) : href;
  const hashFrag = hashIdx >= 0 ? href.slice(hashIdx + 1) : null;
  const qIdx = beforeHash.indexOf("?");
  const path = (qIdx >= 0 ? beforeHash.slice(0, qIdx) : beforeHash) || "/";
  const query = qIdx >= 0 ? beforeHash.slice(qIdx + 1) : "";
  const tab = query ? new URLSearchParams(query).get("tab") : null;
  return { path, tab, hashFrag };
}

function navLinkIsActive(
  pathname: string,
  href: string,
  currentHash: string,
  searchParams: Pick<URLSearchParams, "get">,
) {
  const { path, tab, hashFrag } = splitNavHref(href);

  const pathMatches =
    path === "/"
      ? pathname === "/"
      : path === "/admin"
        ? pathname === "/admin"
        : pathname === path || pathname.startsWith(`${path}/`);
  if (!pathMatches) return false;

  if (tab !== null) {
    return searchParams.get("tab") === tab;
  }

  if (hashFrag !== null && hashFrag !== "") {
    return currentHash === `#${hashFrag}` || currentHash === hashFrag;
  }

  return true;
}

function subtreeHasActiveChild(
  pathname: string,
  hash: string,
  searchParams: Pick<URLSearchParams, "get">,
  children: SidebarNavLink[],
): boolean {
  return children.some(
    (c) => Boolean(c.href && navLinkIsActive(pathname, c.href, hash, searchParams)),
  );
}

const navShellStyles = {
  label: { fontWeight: 500, fontSize: "var(--mantine-font-size-sm)" },
  root: {
    borderRadius: "var(--mantine-radius-md)",
  },
} as const;

function SidebarLeafNavLink(props: { item: SidebarNavLink }) {
  const pathname = usePathname();
  const hash = useHashFragment();
  const searchParams = useSearchParams();
  const { item } = props;
  if (!item.href) return null;

  const active = navLinkIsActive(pathname, item.href, hash, searchParams);

  return (
    <NavLink
      component={Link}
      href={item.href}
      label={item.label}
      active={active}
      variant={active ? "filled" : "subtle"}
      color="blue"
      styles={{
        ...navShellStyles,
        root: {
          ...navShellStyles.root,
          color: active ? undefined : "var(--mantine-color-gray-7)",
          "&:hover": {
            backgroundColor: "var(--mantine-color-gray-1)",
            color: "var(--mantine-color-dark-9)",
          },
        },
      }}
    />
  );
}

function SidebarBranchNavLink(props: { item: SidebarNavLink }) {
  const pathname = usePathname();
  const hash = useHashFragment();
  const searchParams = useSearchParams();
  const { item } = props;
  const children = item.children!;
  const hasActiveChild = subtreeHasActiveChild(pathname, hash, searchParams, children);
  const selfActive = item.href ? navLinkIsActive(pathname, item.href, hash, searchParams) : false;
  const branchActive = selfActive || hasActiveChild;

  const [opened, setOpened] = useState(hasActiveChild);
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- expand branch when nested route becomes active */
    if (hasActiveChild) setOpened(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [hasActiveChild]);

  const nested = useMemo(
    () =>
      children.map((c) => (
        <SidebarLeafNavLink key={c.id} item={c} />
      )),
    [children],
  );

  const branchStyles = {
    ...navShellStyles,
    root: {
      ...navShellStyles.root,
      color: branchActive ? undefined : "var(--mantine-color-gray-7)",
      "&:hover": {
        backgroundColor: "var(--mantine-color-gray-1)",
        color: "var(--mantine-color-dark-9)",
      },
    },
  };

  const shared = {
    label: item.label,
    opened,
    onChange: setOpened,
    active: branchActive,
    variant: branchActive ? ("filled" as const) : ("subtle" as const),
    color: "blue" as const,
    childrenOffset: 28,
    styles: branchStyles,
  };

  if (item.href) {
    return (
      <NavLink component={Link} href={item.href} {...shared}>
        {nested}
      </NavLink>
    );
  }

  return <NavLink {...shared}>{nested}</NavLink>;
}

function SidebarNavEntry(props: { item: SidebarNavLink }) {
  if (props.item.children?.length) {
    return <SidebarBranchNavLink item={props.item} />;
  }
  return <SidebarLeafNavLink item={props.item} />;
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

  const isLg = useMediaQuery("(min-width: 62em)");

  return (
    <Box
      component="aside"
      bg="gray.0"
      style={{
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        width: isLg ? "15rem" : "100%",
        minHeight: isLg ? "100vh" : undefined,
        borderBottom: isLg ? undefined : "1px solid var(--mantine-color-gray-3)",
        borderRight: isLg ? "1px solid var(--mantine-color-gray-3)" : undefined,
      }}
    >
      <Box
        p="md"
        style={{
          borderBottom: "1px solid var(--mantine-color-gray-3)",
        }}
      >
        <Text size="xs" fw={600} tt="uppercase" c="blue.7" lts={1}>
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
                  <SidebarNavEntry key={item.id} item={item} />
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      </ScrollArea>

      <Box
        p="sm"
        style={{
          borderTop: "1px solid var(--mantine-color-gray-3)",
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
