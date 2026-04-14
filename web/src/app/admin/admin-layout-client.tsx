"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Anchor, Button, Container, Divider, Group } from "@mantine/core";

const NAV = [
  { href: "/admin", label: "Control center", active: (p: string) => p === "/admin" },
  { href: "/admin/users", label: "Users", active: (p: string) => p.startsWith("/admin/users") },
  { href: "/admin/sites", label: "Sites", active: (p: string) => p.startsWith("/admin/sites") },
  {
    href: "/admin/institutions",
    label: "Schools",
    active: (p: string) => p.startsWith("/admin/institutions"),
  },
  { href: "/admin/notices", label: "Notices", active: (p: string) => p.startsWith("/admin/notices") },
] as const;

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <Container size="lg" px={{ base: "xs", sm: "md" }} py="xl">
      <Group justify="space-between" align="center" mb="sm" wrap="wrap" gap="sm">
        <Group gap="xs">
          {NAV.map((item) => {
            const active = item.active(pathname);
            return (
              <Button
                key={item.href}
                component={Link}
                href={item.href}
                variant={active ? "light" : "subtle"}
                color="blue"
                size="compact-sm"
                radius="xl"
              >
                {item.label}
              </Button>
            );
          })}
        </Group>
        <Anchor component={Link} href="/" size="sm" c="dimmed" underline="hover">
          ← App home
        </Anchor>
      </Group>
      <Divider mb="xl" />
      {children}
    </Container>
  );
}
