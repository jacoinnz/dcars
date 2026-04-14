import { notFound } from "next/navigation";
import { Alert, Badge, Group, Stack, Text, Title } from "@mantine/core";
import { AppPage } from "@/components/app-page";
import { NextMantineAnchor, NextMantineButtonLink } from "@/components/next-mantine-links";
import {
  EXAMINATION_FEATURE_EMBEDDED_HELP,
  getExaminationFeatureByKey,
  isExaminationFeatureKey,
} from "@/lib/examination-panel";

type Props = { params: Promise<{ key: string }> };

export default async function ExaminationFeaturePage({ params }: Props) {
  const { key } = await params;
  if (!isExaminationFeatureKey(key)) notFound();

  const item = getExaminationFeatureByKey(key);
  if (!item) notFound();

  const isLiveWithHref = item.status === "live" && Boolean(item.href);
  const isLiveEmbedded = item.status === "live" && !item.href;
  const embeddedHelp = EXAMINATION_FEATURE_EMBEDDED_HELP[key];

  return (
    <AppPage maxWidth="narrow">
      <Stack gap="lg">
        <NextMantineAnchor href="/examinations" size="sm" fw={500}>
          ← Examinations
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
        {embeddedHelp && isLiveEmbedded ? (
          <Text size="sm" c="dimmed">
            {embeddedHelp}
          </Text>
        ) : null}

        {isLiveWithHref ? (
          <NextMantineButtonLink href={item.href!} color="teal" mt="md">
            Open examinations
          </NextMantineButtonLink>
        ) : null}

        {isLiveEmbedded ? (
          <NextMantineButtonLink href="/examinations" variant="default" mt="md">
            Go to examination centre
          </NextMantineButtonLink>
        ) : null}

        {item.status === "planned" ? (
          <Alert color="yellow" title="Not available in this deployment" mt="md">
            This examination capability is on the roadmap. The examination centre already supports
            periods, timetables, notices, seat plans, routines, and mark sheets per school.
          </Alert>
        ) : null}

        <NextMantineAnchor href="/examinations" size="sm" fw={600} mt="md">
          Back to examinations hub
        </NextMantineAnchor>
      </Stack>
    </AppPage>
  );
}
