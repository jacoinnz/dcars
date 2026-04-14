import { notFound } from "next/navigation";
import { Alert, Badge, Group, Stack, Text, Title } from "@mantine/core";
import { AppPage } from "@/components/app-page";
import { NextMantineAnchor, NextMantineButtonLink } from "@/components/next-mantine-links";
import { getTeacherFeatureByKey, isTeacherFeatureKey } from "@/lib/teacher-panel";

type Props = { params: Promise<{ key: string }> };

export default async function TeacherFeaturePage({ params }: Props) {
  const { key } = await params;
  if (!isTeacherFeatureKey(key)) notFound();

  const item = getTeacherFeatureByKey(key);
  if (!item) notFound();

  const isLive = item.status === "live" && item.href;

  return (
    <AppPage maxWidth="narrow">
      <Stack gap="lg">
        <NextMantineAnchor href="/teachers" size="sm" fw={500}>
          ← Teacher panel
        </NextMantineAnchor>
        <Group gap="sm" align="center" wrap="wrap">
          <Title order={1}>{item.title}</Title>
          <Badge color={item.status === "live" ? "teal" : "yellow"} variant="light" tt="uppercase">
            {item.status === "live" ? "Available" : "Coming soon"}
          </Badge>
        </Group>
        <Text size="sm" c="dimmed">
          {item.description}
        </Text>

        {isLive ? (
          <NextMantineButtonLink href={item.href!} color="teal" mt="md">
            Open
          </NextMantineButtonLink>
        ) : (
          <Alert color="yellow" title="Not available in the app yet" mt="md">
            Homework authoring with due dates and student hand-in will be added in a future update. For
            now, use communications and evaluation scores to keep families and records up to date.
          </Alert>
        )}

        <NextMantineAnchor href="/teachers" size="sm" fw={600} mt="md">
          Back to teacher panel
        </NextMantineAnchor>
      </Stack>
    </AppPage>
  );
}
