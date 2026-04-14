import Link from "next/link";
import { notFound } from "next/navigation";
import { Alert, Anchor, Badge, Button, Group, Stack, Text, Title } from "@mantine/core";
import { AppPage } from "@/components/app-page";
import { getHrFeatureByKey, isHrFeatureKey } from "@/lib/hr-panel";

type Props = { params: Promise<{ key: string }> };

const EXTRA: Record<string, string> = {
  "staff-attendance":
    "This will track employee attendance (not the same as student roll under Attendance in the main menu).",
  "staff-attendance-report": "Exports will align with your HR rules and reporting calendar once attendance is live.",
  payroll: "Pay amounts, tax, and benefits depend on jurisdiction and your payroll provider.",
  "payroll-report": "Typical outputs: cost by department, GL mapping, and payment register.",
};

export default async function HrFeaturePage({ params }: Props) {
  const { key } = await params;
  if (!isHrFeatureKey(key)) notFound();

  const item = getHrFeatureByKey(key);
  if (!item) notFound();

  const isLive = item.status === "live" && item.href;

  return (
    <AppPage maxWidth="narrow">
      <Stack gap="lg">
        <Anchor component={Link} href="/hr" size="sm" fw={500}>
          ← Human resources
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
        {EXTRA[key] ? (
          <Text size="sm" c="dimmed">
            {EXTRA[key]}
          </Text>
        ) : null}

        {isLive ? (
          <Button component={Link} href={item.href!} color="teal" mt="md">
            Open
          </Button>
        ) : (
          <Alert color="yellow" title="Not available in this deployment" mt="md">
            Staff time tracking and payroll are on the roadmap. The staff directory and student
            attendance tools are available today; programme dashboards and PDF reports cover broader
            operational reporting.
          </Alert>
        )}

        <Anchor component={Link} href="/hr" size="sm" fw={600} mt="md">
          Back to HR hub
        </Anchor>
      </Stack>
    </AppPage>
  );
}
