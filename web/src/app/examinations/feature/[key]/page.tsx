import Link from "next/link";
import { notFound } from "next/navigation";
import { Alert, Anchor, Badge, Button, Group, Stack, Text, Title } from "@mantine/core";
import { AppPage } from "@/components/app-page";
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
        <Anchor component={Link} href="/examinations" size="sm" fw={500}>
          ← Examinations
        </Anchor>
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
          <Button component={Link} href={item.href!} color="teal" mt="md">
            Open examinations
          </Button>
        ) : null}

        {isLiveEmbedded ? (
          <Button component={Link} href="/examinations" variant="default" mt="md">
            Go to examination centre
          </Button>
        ) : null}

        {item.status === "planned" ? (
          <Alert color="yellow" title="Not available in this deployment" mt="md">
            This examination capability is on the roadmap. The examination centre already supports
            periods, timetables, notices, seat plans, routines, and mark sheets per school.
          </Alert>
        ) : null}

        <Anchor component={Link} href="/examinations" size="sm" fw={600} mt="md">
          Back to examinations hub
        </Anchor>
      </Stack>
    </AppPage>
  );
}
