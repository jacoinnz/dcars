"use client";

import Link from "next/link";
import {
  Anchor,
  Box,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { CalendarTodoPanel } from "@/components/calendar-todo-panel";
import { DashboardScrollToHash } from "@/components/dashboard-scroll-to-hash";
import { NoticeBoard } from "@/components/notice-board";
import { WelcomeAudienceTabs } from "@/components/welcome-audience-tabs";
import type { SiteSummary } from "@/lib/aggregates";
import type { AudienceTabCounts } from "@/lib/audience-tab-counts";
import type { NoticeBoardItemRow } from "@/lib/notice-board";

type ProgramTotals = {
  sites: number;
  reports: number;
  youthPresent: number;
  youthRegistered: number;
  participantRegistrations: number;
};

const quickLinks = (isSuperAdmin: boolean) =>
  (
    [
      {
        href: "/students",
        title: "Student information",
        body: "Admission, student list, and classes by school.",
      },
      {
        href: "/students/attendance",
        title: "Student attendance",
        body: "Staff roll, learner and family attendance views.",
      },
      {
        href: "/examinations",
        title: "Examinations",
        body: "Exam periods, timetables, seat plans, and marks.",
      },
      {
        href: "/evaluations",
        title: "Evaluations",
        body: "Scores, classes, and performance records.",
      },
      {
        href: "/hr",
        title: "Human resources",
        body: "Staff directory and HR roadmap items.",
      },
      {
        href: "/communications",
        title: "Communications",
        body: "School and site messaging tools.",
      },
      {
        href: "/reports",
        title: "PDF reports",
        body: "Programme exports for funders and review.",
      },
      ...(isSuperAdmin
        ? [
            {
              href: "/admin",
              title: "Administration",
              body: "Sites, schools, users, and permissions.",
            },
          ]
        : []),
    ] as const
  );

export function DashboardPageContent(props: {
  welcomeName: string | null;
  isSuperAdmin: boolean;
  tabCounts: AudienceTabCounts;
  notices: NoticeBoardItemRow[];
  todoStorageKey: string;
  rows: SiteSummary[];
  totals: ProgramTotals;
  fromStr: string;
  toStr: string;
  fromDisplay: string;
  toDisplay: string;
}) {
  const {
    welcomeName,
    isSuperAdmin,
    tabCounts,
    notices,
    todoStorageKey,
    rows,
    totals,
    fromStr,
    toStr,
    fromDisplay,
    toDisplay,
  } = props;

  return (
    <Box px={{ base: "sm", sm: "md", lg: "lg" }} py="xl" className="w-full flex-1">
      <DashboardScrollToHash />
      <WelcomeAudienceTabs
        userName={welcomeName}
        isSuperAdmin={isSuperAdmin}
        tabCounts={tabCounts}
        sectionId="dashboard-audience-tabs"
      >
        <>
          <NoticeBoard
            items={notices}
            showManageLink={isSuperAdmin}
            embedded
            anchorId="notice-board"
          />
          <CalendarTodoPanel
            storageKey={todoStorageKey}
            calendarSectionId="dashboard-calendar"
            todoSectionId="dashboard-todo"
          />
        </>
      </WelcomeAudienceTabs>

      <Stack gap="md" mb="xl">
        <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
          <Box maw={640}>
            <Title order={2} size="h3">
              Dashboard
            </Title>
            <Text size="sm" c="dimmed" mt="xs">
              Programme overview: session metrics and participant registrations by site for{" "}
              <Text span fw={500} c="dark" style={{ whiteSpace: "nowrap" }}>
                {fromDisplay} to {toDisplay}
              </Text>
              . Use quick access below for school operations (similar layout to common MIS home screens).
            </Text>
          </Box>
          <Box component="form" method="get">
            <Group gap="sm" align="flex-end" wrap="wrap">
              <TextInput type="date" name="from" label="From" size="xs" defaultValue={fromStr} />
              <TextInput type="date" name="to" label="To" size="xs" defaultValue={toStr} />
              <Button type="submit" color="dark" size="sm">
                Apply
              </Button>
            </Group>
          </Box>
        </Group>
      </Stack>

      <Stack gap="xs" mb="xl">
        <Title order={3} size="h5">
          Quick access
        </Title>
        <Text size="xs" c="dimmed">
          Jump to the main modules without leaving your workflow.
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md" mt="md">
          {quickLinks(isSuperAdmin).map((item) => (
            <Paper
              key={item.href}
              component={Link}
              href={item.href}
              withBorder
              radius="lg"
              p="md"
              shadow="sm"
              style={{ textDecoration: "none", color: "inherit", height: "100%" }}
              className="transition hover:border-teal-300 hover:bg-teal-0"
            >
              <Text fw={600} size="sm">
                {item.title}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                {item.body}
              </Text>
              <Text size="xs" fw={600} c="teal.8" mt="sm">
                Open →
              </Text>
            </Paper>
          ))}
        </SimpleGrid>
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} spacing="md" mb="xl">
        {(
          [
            { label: "Registrations", value: totals.participantRegistrations },
            { label: "Reports", value: totals.reports },
            { label: "Youth present (sum)", value: totals.youthPresent },
            { label: "Youth registered (sum)", value: totals.youthRegistered },
            { label: "Sites", value: totals.sites },
          ] as const
        ).map((stat) => (
          <Paper key={stat.label} withBorder radius="lg" p="md" shadow="sm">
            <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts={0.5}>
              {stat.label}
            </Text>
            <Text size="xl" fw={600} mt={4}>
              {stat.value}
            </Text>
          </Paper>
        ))}
      </SimpleGrid>

      <Paper withBorder radius="lg" shadow="sm" mb="xl" style={{ overflow: "hidden" }}>
        <Box p="md" style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}>
          <Title order={3} size="h5">
            Programme metrics by site
          </Title>
          <Text size="xs" c="dimmed" mt={4}>
            Attendance rate is present ÷ registered for the selected window (session-level sums).
          </Text>
        </Box>
        <Table.ScrollContainer minWidth={640}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Site</Table.Th>
                <Table.Th>Participants</Table.Th>
                <Table.Th>Reports</Table.Th>
                <Table.Th>Present</Table.Th>
                <Table.Th>Registered</Table.Th>
                <Table.Th>Avg attendance</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((r) => (
                <Table.Tr key={r.siteId}>
                  <Table.Td>
                    <Text span fw={500}>
                      {r.siteName}
                    </Text>{" "}
                    <Text span c="dimmed" size="sm">
                      ({r.siteCode})
                    </Text>
                  </Table.Td>
                  <Table.Td>{r.participantRegistrations}</Table.Td>
                  <Table.Td>{r.reportCount}</Table.Td>
                  <Table.Td>{r.totalYouthPresent}</Table.Td>
                  <Table.Td>{r.totalYouthRegistered}</Table.Td>
                  <Table.Td>
                    {r.avgAttendanceRate === null
                      ? "—"
                      : `${Math.round(r.avgAttendanceRate * 1000) / 10}%`}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      <Text size="sm" c="dimmed">
        Need a printable file?{" "}
        <Anchor component={Link} href="/reports" fw={600} c="teal.8" underline="always">
          Open reports
        </Anchor>
        .
      </Text>
    </Box>
  );
}
