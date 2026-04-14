"use client";

import { Paper, Text } from "@mantine/core";

export function LoginFormFallback() {
  return (
    <Paper radius="lg" p="xl" withBorder shadow="sm" maw={448} mx="auto">
      <Text size="sm" c="dimmed">
        Loading…
      </Text>
    </Paper>
  );
}
