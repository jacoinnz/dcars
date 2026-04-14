import Link from "next/link";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { Anchor, Box, Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { AppPage } from "@/components/app-page";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const now = new Date();
  const from = sp.from
    ? new Date(`${sp.from}T00:00:00.000Z`)
    : startOfMonth(now);
  const to = sp.to ? new Date(`${sp.to}T23:59:59.999Z`) : endOfMonth(now);

  const fromStr = format(from, "yyyy-MM-dd");
  const toStr = format(to, "yyyy-MM-dd");
  const pdfHref = `/api/report/pdf?from=${encodeURIComponent(fromStr)}&to=${encodeURIComponent(toStr)}`;

  return (
    <AppPage>
      <Stack gap="lg">
        <Title order={1}>Reports</Title>
        <Text c="dimmed" size="sm" maw={520}>
          Download a PDF summary for funders or internal reviews. The dashboard stays live; PDFs are
          point-in-time exports for the selected date range.
        </Text>

        <Paper component="form" method="get" withBorder shadow="sm" p="md" radius="lg">
          <Group align="flex-end" gap="md" wrap="wrap">
            <Box>
              <Text component="label" size="xs" fw={500} htmlFor="rep-from" display="block">
                From
              </Text>
              <input
                id="rep-from"
                name="from"
                type="date"
                defaultValue={fromStr}
                style={{
                  marginTop: 4,
                  borderRadius: "var(--mantine-radius-md)",
                  border: "1px solid var(--mantine-color-gray-4)",
                  padding: "6px 8px",
                  fontSize: "var(--mantine-font-size-sm)",
                }}
              />
            </Box>
            <Box>
              <Text component="label" size="xs" fw={500} htmlFor="rep-to" display="block">
                To
              </Text>
              <input
                id="rep-to"
                name="to"
                type="date"
                defaultValue={toStr}
                style={{
                  marginTop: 4,
                  borderRadius: "var(--mantine-radius-md)",
                  border: "1px solid var(--mantine-color-gray-4)",
                  padding: "6px 8px",
                  fontSize: "var(--mantine-font-size-sm)",
                }}
              />
            </Box>
            <Button type="submit" color="dark">
              Update range
            </Button>
          </Group>
        </Paper>

        <Paper withBorder shadow="sm" p="lg" radius="lg">
          <Text fw={600} size="sm">
            PDF export
          </Text>
          <Text size="sm" c="dimmed" mt="xs">
            Range:{" "}
            <Text span fw={600} c="dark.8">
              {fromStr}
            </Text>{" "}
            →{" "}
            <Text span fw={600} c="dark.8">
              {toStr}
            </Text>
          </Text>
          <Button component="a" href={pdfHref} color="teal" mt="md">
            Download PDF
          </Button>
          <Text size="xs" c="dimmed" mt="md">
            Tip: bookmark the dashboard for day-to-day monitoring; use PDFs for formal reporting cycles.
          </Text>
        </Paper>

        <Text size="sm" c="dimmed" mt="md">
          <Anchor component={Link} href="/dashboard" fw={600}>
            Back to dashboard
          </Anchor>
        </Text>
      </Stack>
    </AppPage>
  );
}
