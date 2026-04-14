import { notFound } from "next/navigation";
import { Alert, Badge, Group, Stack, Text, Title } from "@mantine/core";
import { AppPage } from "@/components/app-page";
import { NextMantineAnchor, NextMantineButtonLink } from "@/components/next-mantine-links";
import { getParentFeatureByKey, isParentFeatureKey } from "@/lib/parent-panel";

type Props = { params: Promise<{ key: string }> };

export default async function ParentFeaturePage({ params }: Props) {
  const { key } = await params;
  if (!isParentFeatureKey(key)) notFound();

  const item = getParentFeatureByKey(key);
  if (!item) notFound();

  const isLive = item.status === "live" && item.href;

  const extraCopy: Record<string, string> = {
    invoices:
      "Fee invoices and online payments will connect to your school’s finance rules and payment provider.",
    "class-routine":
      "When class periods and rooms are stored per school, your child’s timetable will appear here.",
    messaging:
      "In-app messaging will require staff to use the same system and appropriate safeguarding settings.",
  };

  return (
    <AppPage maxWidth="narrow">
      <Stack gap="lg">
        <NextMantineAnchor href="/parents" size="sm" fw={500}>
          ← Parents panel
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
        {extraCopy[key] ? (
          <Text size="sm" c="dimmed">
            {extraCopy[key]}
          </Text>
        ) : null}

        {isLive ? (
          <NextMantineButtonLink href={item.href!} color="teal" mt="md">
            Open
          </NextMantineButtonLink>
        ) : (
          <Alert color="yellow" title="This feature is not available in the app yet" mt="md">
            Your school may share invoices, timetables, or contact channels outside this system for now.
            Marks and attendance are available from the parents panel where your account is linked to a
            student.
          </Alert>
        )}

        <NextMantineAnchor href="/parents" size="sm" fw={600} mt="md">
          Back to parents panel
        </NextMantineAnchor>
      </Stack>
    </AppPage>
  );
}
