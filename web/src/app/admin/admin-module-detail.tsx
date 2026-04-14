"use client";

import Link from "next/link";
import {
  Alert,
  Anchor,
  Badge,
  Button,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import type { AdminModuleCard } from "@/lib/admin-control-center";

export function AdminModuleDetail(props: { mod: AdminModuleCard }) {
  const { mod } = props;
  const isLive = mod.status === "live" && mod.href;

  return (
    <Stack gap="md">
      <Anchor component={Link} href="/admin" size="sm" c="blue.7" fw={500} underline="hover">
        ← Admin control center
      </Anchor>

      <Group align="center" gap="md" wrap="wrap">
        <Title order={1} size="h2">
          {mod.title}
        </Title>
        <Badge size="lg" variant="light" color={mod.status === "live" ? "blue" : "yellow"} tt="uppercase">
          {mod.status === "live" ? "Available" : "Planned"}
        </Badge>
      </Group>

      <Text size="sm" c="dimmed" maw={672} lh={1.6}>
        {mod.description}
      </Text>

      {isLive ? (
        <div>
          <Button component={Link} href={mod.href!} color="blue" radius="md" size="md">
            Open in app
          </Button>
        </div>
      ) : (
        <Alert color="yellow" variant="light" title="Not built in this deployment yet" radius="md">
          <Text size="sm" lh={1.6}>
            This module is on the product roadmap. The control center groups it so you can align training
            and future procurement. Core data (sites, schools, users, students, attendance, exams, notices)
            is already modelled elsewhere in the app where marked &quot;Available&quot;.
          </Text>
        </Alert>
      )}

      <Text size="sm" c="dimmed" mt="md">
        <Anchor component={Link} href="/admin" fw={600} c="blue.7" underline="always">
          Back to control center
        </Anchor>
      </Text>
    </Stack>
  );
}
