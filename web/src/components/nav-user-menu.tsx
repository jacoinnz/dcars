"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Badge, Button, Group, Stack, Text } from "@mantine/core";

export function NavUserMenu(props: {
  email: string | null;
  isSuperAdmin: boolean;
  /** Dark strip at bottom of left sidebar */
  variant?: "header" | "sidebar";
}) {
  const v = props.variant ?? "header";

  if (!props.email) {
    return (
      <Button
        component={Link}
        href="/login"
        variant={v === "sidebar" ? "outline" : "default"}
        color={v === "sidebar" ? "gray" : undefined}
        fullWidth={v === "sidebar"}
        radius="md"
        size="sm"
        styles={
          v === "sidebar"
            ? {
                root: {
                  borderColor: "#57534e",
                  backgroundColor: "#292524",
                  color: "#f5f5f4",
                },
              }
            : undefined
        }
      >
        Sign in
      </Button>
    );
  }

  if (v === "sidebar") {
    return (
      <Stack gap="sm">
        <Text size="xs" c="dimmed" truncate title={props.email}>
          {props.email}
          {props.isSuperAdmin ? (
            <Badge ml={6} size="xs" variant="light" color="blue" tt="uppercase">
              Admin
            </Badge>
          ) : null}
        </Text>
        <Button
          component={Link}
          href="/settings/sidebar"
          variant="outline"
          color="blue"
          fullWidth
          radius="md"
          size="sm"
          styles={{
            root: {
              borderColor: "#57534e",
              backgroundColor: "#1c1917",
              color: "#ccfbf1",
            },
          }}
        >
          Sidebar manager
        </Button>
        <Button
          type="button"
          variant="outline"
          color="gray"
          fullWidth
          radius="md"
          size="sm"
          styles={{
            root: {
              borderColor: "#57534e",
              backgroundColor: "#292524",
              color: "#e7e5e4",
            },
          }}
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sign out
        </Button>
      </Stack>
    );
  }

  return (
    <Group gap="xs" wrap="wrap" align="center">
      <Text size="xs" c="dimmed" maw={224} truncate title={props.email}>
        {props.email}
        {props.isSuperAdmin ? (
          <Badge ml={6} size="xs" variant="light" color="blue" tt="uppercase">
            Admin
          </Badge>
        ) : null}
      </Text>
      {props.isSuperAdmin ? (
        <Button component={Link} href="/admin" variant="light" color="blue" size="compact-sm" radius="xl">
          Admin
        </Button>
      ) : null}
      <Button
        type="button"
        variant="default"
        size="compact-sm"
        radius="xl"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        Sign out
      </Button>
    </Group>
  );
}
