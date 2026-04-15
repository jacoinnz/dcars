"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Divider, Paper, ScrollArea, SimpleGrid, Stack, Tabs, Text } from "@mantine/core";
import { AddStudentHubTabs } from "@/components/add-student-hub-tabs";
import { AddStudentInlineAdmission } from "@/components/add-student-inline-admission";
import { HubLinkCard } from "@/components/hub-link-card";
import { NextMantineAnchor } from "@/components/next-mantine-links";

export type StudentsInfoSchoolRow = { id: string; name: string; siteName: string };

const TAB_VALUES = [
  "add-student",
  "student-list",
  "multi-class",
  "delete-record",
  "unassigned",
  "student-attendance",
  "student-group",
  "student-promote",
  "disabled-students",
  "subject-attendance",
  "student-export",
] as const;

type TabValue = (typeof TAB_VALUES)[number];

const DEFAULT_TAB: TabValue = "add-student";

function isTabValue(s: string | null): s is TabValue {
  return s !== null && (TAB_VALUES as readonly string[]).includes(s);
}

function PlaceholderPanel(props: { title: string; body: string }) {
  return (
    <Paper withBorder p="lg" radius="md" bg="gray.0">
      <Text fw={600} size="sm" mb="xs">
        {props.title}
      </Text>
      <Text size="sm" c="dimmed">
        {props.body}
      </Text>
    </Paper>
  );
}

export function StudentsInfoTabs(props: { schoolRows: StudentsInfoSchoolRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const active: TabValue = isTabValue(tabParam) ? tabParam : DEFAULT_TAB;

  const onTabChange = useCallback(
    (value: string | null) => {
      if (!value || !isTabValue(value)) return;
      router.replace(`/students?tab=${encodeURIComponent(value)}`, { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    const t = searchParams.get("tab");
    if (!t || !isTabValue(t)) {
      router.replace(`/students?tab=${DEFAULT_TAB}`, { scroll: false });
    }
  }, [router, searchParams]);

  const schoolCards = useMemo(
    () =>
      props.schoolRows.map((s) => (
        <Paper key={s.id} withBorder shadow="sm" p="lg" radius="lg">
          <Text fw={600} size="sm">
            {s.name}{" "}
            <Text component="span" fw={400} c="dimmed">
              — {s.siteName}
            </Text>
          </Text>
          <Stack gap={6} mt="sm">
            <NextMantineAnchor href={`/evaluations/students/${s.id}`} size="sm" fw={500}>
              Open school workspace
            </NextMantineAnchor>
          </Stack>
        </Paper>
      )),
    [props.schoolRows],
  );

  return (
    <Stack gap="xl">
      <Stack gap="sm" style={{ width: "100%" }}>
        <Text size="sm" fw={600}>
          New student admission
        </Text>
        <Text size="xs" c="dimmed" lh={1.55} maw={900}>
          Full-width form below. Scroll down for the student hub (rosters, attendance, exports, field guide). The same
          admission form stays above while you use hub tabs.
        </Text>
        <AddStudentInlineAdmission schoolRows={props.schoolRows} />
      </Stack>

      <Divider label="Student hub" labelPosition="center" />

      <Stack gap="md">
        <Text size="sm" c="dimmed" lh={1.65} maw={900}>
          Roster links, class matrix, attendance, exports, and the admission section checklist (Add Student tab).
        </Text>

        <Tabs value={active} onChange={onTabChange} keepMounted={false}>
          <ScrollArea type="scroll" scrollbars="x" offsetScrollbars>
        <Tabs.List
          style={{
            flexWrap: "nowrap",
            width: "max-content",
            minWidth: "100%",
            paddingBottom: 2,
          }}
        >
          <Tabs.Tab value="add-student">Add Student</Tabs.Tab>
          <Tabs.Tab value="student-list">Student List</Tabs.Tab>
          <Tabs.Tab value="multi-class">Multi Class Student</Tabs.Tab>
          <Tabs.Tab value="delete-record">Delete Student Record</Tabs.Tab>
          <Tabs.Tab value="unassigned">Unassigned Student</Tabs.Tab>
          <Tabs.Tab value="student-attendance">Student Attendance</Tabs.Tab>
          <Tabs.Tab value="student-group">Student Group</Tabs.Tab>
          <Tabs.Tab value="student-promote">Student Promote</Tabs.Tab>
          <Tabs.Tab value="disabled-students">Disabled Students</Tabs.Tab>
          <Tabs.Tab value="subject-attendance">Subject Wise Attendance</Tabs.Tab>
          <Tabs.Tab value="student-export">Student Export</Tabs.Tab>
        </Tabs.List>
      </ScrollArea>

      <Tabs.Panel value="add-student" pt="lg">
        <AddStudentHubTabs schoolRows={props.schoolRows} />
      </Tabs.Panel>

      <Tabs.Panel value="student-list" pt="lg">
        <Stack gap="md">
          <Text size="sm" c="dimmed" maw={640}>
            Search and filter the roster, admission fields, and class links for each school you support.
          </Text>
          {props.schoolRows.length === 0 ? (
            <Alert color="yellow" title="No schools visible">
              No schools are visible yet. Use{" "}
              <NextMantineAnchor href="/admin/institutions" fw={600}>
                Admin → Schools
              </NextMantineAnchor>{" "}
              to add one.
            </Alert>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              {schoolCards}
            </SimpleGrid>
          )}
        </Stack>
      </Tabs.Panel>

      <Tabs.Panel value="multi-class" pt="lg">
        <Stack gap="md">
          <Text size="sm" c="dimmed" maw={640}>
            Assign each learner to one or more classes. Use the class matrix on the school workspace.
          </Text>
          {props.schoolRows.length === 0 ? (
            <Alert color="yellow" title="No schools visible">
              Add a school first under{" "}
              <NextMantineAnchor href="/admin/institutions" fw={600}>
                Admin → Schools
              </NextMantineAnchor>
              .
            </Alert>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              {props.schoolRows.map((s) => (
                <Paper key={s.id} withBorder p="md" radius="md">
                  <Text size="sm" fw={600}>
                    {s.name}
                  </Text>
                  <Text size="xs" c="dimmed" mb="sm">
                    {s.siteName}
                  </Text>
                  <NextMantineAnchor href={`/evaluations/students/${s.id}`} size="sm" fw={600}>
                    Class enrollments matrix →
                  </NextMantineAnchor>
                </Paper>
              ))}
            </SimpleGrid>
          )}
        </Stack>
      </Tabs.Panel>

      <Tabs.Panel value="delete-record" pt="lg">
        <PlaceholderPanel
          title="Delete Student Record"
          body="Removing a learner from the roster will be wired to your data-retention rules. Until then, manage removals from the school workspace with your administrator."
        />
        {props.schoolRows.length > 0 ? (
          <Text size="sm" mt="md">
            Per-school tools:{" "}
            {props.schoolRows.map((s, i) => (
              <span key={s.id}>
                {i > 0 ? " · " : null}
                <NextMantineAnchor href={`/evaluations/students/${s.id}`} fw={600}>
                  {s.name}
                </NextMantineAnchor>
              </span>
            ))}
          </Text>
        ) : null}
      </Tabs.Panel>

      <Tabs.Panel value="unassigned" pt="lg">
        <PlaceholderPanel
          title="Unassigned Student"
          body="Students not yet placed in a class will appear here once that report is enabled. Use the class matrix to assign learners to classes today."
        />
      </Tabs.Panel>

      <Tabs.Panel value="student-attendance" pt="lg">
        <Stack gap="md">
          <Text size="sm" c="dimmed" maw={640}>
            Staff roll, learner portal, and family views — open the hub to choose where to go.
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <HubLinkCard href="/students/attendance" variant="live">
              <Text fw={600} size="sm">
                Student attendance hub
              </Text>
              <Text size="sm" c="dimmed" mt="xs">
                Links to staff register, student portal, and family attendance.
              </Text>
            </HubLinkCard>
            <HubLinkCard href="/attendance" variant="live">
              <Text fw={600} size="sm">
                Staff attendance register
              </Text>
              <Text size="sm" c="dimmed" mt="xs">
                Daily marks per school (where you have access).
              </Text>
            </HubLinkCard>
          </SimpleGrid>
        </Stack>
      </Tabs.Panel>

      <Tabs.Panel value="student-group" pt="lg">
        <PlaceholderPanel
          title="Student Group"
          body="Group-based messaging, bulk actions, and cohort reports are on the roadmap. Use communications and class lists in the meantime."
        />
        <NextMantineAnchor href="/communications" fw={600} size="sm" display="block" mt="md">
          Communications
        </NextMantineAnchor>
      </Tabs.Panel>

      <Tabs.Panel value="student-promote" pt="lg">
        <PlaceholderPanel
          title="Student Promote"
          body="End-of-year promotion workflows (move cohorts to the next grade or class) will be added here."
        />
      </Tabs.Panel>

      <Tabs.Panel value="disabled-students" pt="lg">
        <PlaceholderPanel
          title="Disabled Students"
          body="Filter learners who are inactive, excluded, or archived — planned. Coordinate with your administrator for account status today."
        />
      </Tabs.Panel>

      <Tabs.Panel value="subject-attendance" pt="lg">
        <PlaceholderPanel
          title="Subject Wise Attendance"
          body="Per-subject or per-period attendance will extend the daily roll. Daily attendance is available from the Student Attendance tab."
        />
      </Tabs.Panel>

      <Tabs.Panel value="student-export" pt="lg">
        <Stack gap="md">
          <Text size="sm" c="dimmed" maw={640}>
            Export rosters and programme summaries for reporting.
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <HubLinkCard href="/reports" variant="live">
              <Text fw={600} size="sm">
                Programme reports (PDF)
              </Text>
              <Text size="sm" c="dimmed" mt="xs">
                Dated PDF summary for funders or internal review.
              </Text>
            </HubLinkCard>
            <HubLinkCard href="/evaluations" variant="live">
              <Text fw={600} size="sm">
                Evaluation reports
              </Text>
              <Text size="sm" c="dimmed" mt="xs">
                Filter scores by school, class, and date range.
              </Text>
            </HubLinkCard>
          </SimpleGrid>
        </Stack>
      </Tabs.Panel>
        </Tabs>
      </Stack>
    </Stack>
  );
}
