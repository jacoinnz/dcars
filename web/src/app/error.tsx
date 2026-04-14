"use client";

import { Button, Container, Stack, Text, Title } from "@mantine/core";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container size="sm" py="xl" ta="center">
      <Stack gap="md" align="center">
        <Title order={2} size="h3">
          This page couldn&apos;t load
        </Title>
        <Text size="sm" c="dimmed">
          {error.message}
        </Text>
        <Text size="xs" c="dimmed">
          On Vercel, open <strong>Project → Settings → Environment Variables</strong> and set{" "}
          <code
            style={{
              borderRadius: 4,
              background: "var(--mantine-color-gray-1)",
              padding: "2px 6px",
              fontSize: 12,
            }}
          >
            DATABASE_URL
          </code>{" "}
          to your Neon connection string (same as local{" "}
          <code
            style={{
              borderRadius: 4,
              background: "var(--mantine-color-gray-1)",
              padding: "2px 6px",
              fontSize: 12,
            }}
          >
            .env.local
          </code>
          ), for <strong>Production</strong>, then redeploy.
        </Text>
        <Button color="blue" onClick={() => reset()} radius="md">
          Try again
        </Button>
      </Stack>
    </Container>
  );
}
