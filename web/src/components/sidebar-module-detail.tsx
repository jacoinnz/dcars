"use client";

import Link from "next/link";
import {
  Alert,
  Anchor,
  Badge,
  Button,
  Container,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import type { AdminModuleCard } from "@/lib/admin-control-center";

type Props = {
  mod: AdminModuleCard;
  /** e.g. `/dashboard` */
  homeHref: string;
  /** e.g. `Dashboard` (shown after ←) */
  homeLabel: string;
  /** Extra copy inside the “planned” alert (e.g. links). */
  plannedExtra?: React.ReactNode;
};

/** Shared “planned / live module” page for sidebar hubs (academics, download center, etc.). */
export function SidebarModuleDetail(props: Props) {
  const { mod, homeHref, homeLabel, plannedExtra } = props;
  const isLive = mod.status === "live" && mod.href;

  return (
    <Container size="sm" px="md" py="xl" style={{ flex: 1, width: "100%" }}>
      <Anchor component={Link} href={homeHref} size="sm" c="blue.7" fw={500} underline="hover">
        ← {homeLabel}
      </Anchor>

      <Group align="center" gap="md" wrap="wrap" mt="md">
        <Title order={1} size="h2">
          {mod.title}
        </Title>
        <Badge size="lg" variant="light" color={mod.status === "live" ? "blue" : "yellow"} tt="uppercase">
          {mod.status === "live" ? "Available" : "Planned"}
        </Badge>
      </Group>

      <Text size="sm" c="dimmed" maw={672} mt="sm" lh={1.6}>
        {mod.description}
      </Text>

      {isLive ? (
        <div style={{ marginTop: "2rem" }}>
          <Button component={Link} href={mod.href!} color="blue" radius="md" size="md">
            Open in app
          </Button>
        </div>
      ) : (
        <Alert color="yellow" variant="light" title="Not built in this deployment yet" radius="md" mt="xl">
          {plannedExtra ? (
            <Text size="sm" component="div" lh={1.6}>
              {plannedExtra}
            </Text>
          ) : null}
        </Alert>
      )}

      <Text size="sm" c="dimmed" mt="xl">
        <Anchor component={Link} href={homeHref} fw={600} c="blue.7" underline="always">
          Back to {homeLabel.toLowerCase()}
        </Anchor>
      </Text>
    </Container>
  );
}
