import Link from "next/link";
import { notFound } from "next/navigation";
import { Alert, Anchor, Badge, Button, Group, Stack, Text, Title } from "@mantine/core";
import { AppPage } from "@/components/app-page";
import { getStudentFeatureByKey, isStudentFeatureKey } from "@/lib/student-panel";

type Props = { params: Promise<{ key: string }> };

const EXTRA: Record<string, string> = {
  "class-routine":
    "Your timetable will appear here once the school defines periods and rooms in this system.",
  invoices: "Invoices and balances require a fees module and your school’s billing rules.",
  "pay-online": "Online payments need a card or bank provider integrated by your school.",
  messaging: "Messaging will let you reach staff who use this app, with appropriate safeguards.",
};

export default async function StudentFeaturePage({ params }: Props) {
  const { key } = await params;
  if (!isStudentFeatureKey(key)) notFound();

  const item = getStudentFeatureByKey(key);
  if (!item) notFound();

  const isLive = item.status === "live" && item.href;

  return (
    <AppPage maxWidth="narrow">
      <Stack gap="lg">
        <Anchor component={Link} href="/student" size="sm" fw={500}>
          ← Student panel
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
          <Alert color="yellow" title="Not available yet" mt="md">
            Your school may share timetables, bills, or contact details through other channels for now.
            Marks, attendance, and study files are available from the student panel when your login is
            linked.
          </Alert>
        )}

        <Anchor component={Link} href="/student" size="sm" fw={600} mt="md">
          Back to student panel
        </Anchor>
      </Stack>
    </AppPage>
  );
}
