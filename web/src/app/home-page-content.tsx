"use client";

import Link from "next/link";
import { Box, Button, Group, List, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { CalendarTodoPanel } from "@/components/calendar-todo-panel";
import { NoticeBoard } from "@/components/notice-board";
import { WelcomeAudienceTabs } from "@/components/welcome-audience-tabs";
import type { AudienceTabCounts } from "@/lib/audience-tab-counts";
import type { NoticeBoardItemRow } from "@/lib/notice-board";

type AlertRow = {
  siteId: string;
  siteName: string;
  siteCode: string;
  daysSinceLastReport: number | null;
};

type Totals = {
  sites: number;
  reports: number;
  youthPresent: number;
  youthRegistered: number;
  participantRegistrations: number;
};

export function HomePageContent(props: {
  welcomeName: string | null;
  isSuperAdmin: boolean;
  tabCounts: AudienceTabCounts;
  notices: NoticeBoardItemRow[];
  todoStorageKey: string;
  totals: Totals;
  alerts: AlertRow[];
}) {
  const { welcomeName, isSuperAdmin, tabCounts, notices, todoStorageKey, totals, alerts } = props;

  return (
    <Box mx="auto" maw={1280} px="md" py="xl" w="100%" style={{ flex: 1 }}>
      <WelcomeAudienceTabs userName={welcomeName} isSuperAdmin={isSuperAdmin} tabCounts={tabCounts}>
        <>
          <NoticeBoard items={notices} showManageLink={isSuperAdmin} embedded />
          <CalendarTodoPanel storageKey={todoStorageKey} />
        </>
      </WelcomeAudienceTabs>

      <Stack gap="md" mt="xl" maw={672}>
        <Text size="xs" fw={600} tt="uppercase" c="blue.8" lts={0.5}>
          Youth development programme
        </Text>
        <Title order={1} size="h2">
          Less spreadsheet work, clearer visibility across sites
        </Title>
        <Text size="md" c="dimmed" lh={1.6}>
          Register each young person with a unique ID; session metrics and PDF exports support programme
          reporting.
        </Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mt="xl">
        <Paper withBorder radius="lg" p="lg" shadow="sm">
          <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts={0.5}>
            This month — participant registrations
          </Text>
          <Text size="2rem" fw={600} mt="sm">
            {totals.participantRegistrations}
          </Text>
        </Paper>
        <Paper withBorder radius="lg" p="lg" shadow="sm">
          <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts={0.5}>
            Session reports
          </Text>
          <Text size="2rem" fw={600} mt="sm">
            {totals.reports}
          </Text>
        </Paper>
        <Paper withBorder radius="lg" p="lg" shadow="sm">
          <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts={0.5}>
            Youth present (sum)
          </Text>
          <Text size="2rem" fw={600} mt="sm">
            {totals.youthPresent}
          </Text>
        </Paper>
        <Paper withBorder radius="lg" p="lg" shadow="sm">
          <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts={0.5}>
            Sites
          </Text>
          <Text size="2rem" fw={600} mt="sm">
            {totals.sites}
          </Text>
        </Paper>
      </SimpleGrid>

      <Paper withBorder radius="lg" p="lg" mt="xl" bg="yellow.0" style={{ borderColor: "rgba(251, 191, 36, 0.45)" }}>
        <Title order={2} size="h5" c="yellow.9">
          Missing data (last 7 days)
        </Title>
        <Text size="sm" mt={4} c="yellow.9" style={{ opacity: 0.9 }}>
          Sites with no session report dated within the last week (rolling from today).
        </Text>
        {alerts.length === 0 ? (
          <Text size="sm" fw={600} c="green.9" mt="md">
            All sites have at least one recent report. Nice work.
          </Text>
        ) : (
          <List size="sm" mt="md" c="yellow.9" spacing="xs" withPadding listStyleType="disc">
            {alerts.map((a) => (
              <List.Item key={a.siteId}>
                <Text span fw={600}>
                  {a.siteName}
                </Text>{" "}
                ({a.siteCode})
                {a.daysSinceLastReport === null
                  ? " — no submissions yet"
                  : ` — last report ${a.daysSinceLastReport} day(s) ago`}
              </List.Item>
            ))}
          </List>
        )}
      </Paper>

      <Group mt="xl" gap="md" wrap="wrap">
        <Button component={Link} href="/entry" color="blue" size="md" radius="md">
          Register participant
        </Button>
        <Button component={Link} href="/dashboard" variant="default" size="md" radius="md">
          Open dashboard
        </Button>
        <Button component={Link} href="/reports" variant="default" size="md" radius="md">
          Export PDF
        </Button>
      </Group>
    </Box>
  );
}
