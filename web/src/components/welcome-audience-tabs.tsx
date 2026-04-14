"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useState } from "react";
import { Anchor, Card, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import type { AudienceTabCounts } from "@/lib/audience-tab-counts";

type TabId = "students" | "teachers" | "parents" | "staff";

const tabs: { id: TabId; label: string }[] = [
  { id: "students", label: "Students" },
  { id: "teachers", label: "Teachers" },
  { id: "parents", label: "Parents" },
  { id: "staff", label: "Staff" },
];

const emptyCounts: AudienceTabCounts = {
  students: 0,
  teachers: 0,
  parents: 0,
  staff: 0,
};

export function WelcomeAudienceTabs(props: {
  userName: string | null;
  isSuperAdmin?: boolean;
  tabCounts?: AudienceTabCounts;
  children?: ReactNode;
  /** Anchor for sidebar links; four audience tabs stay fixed in this block */
  sectionId?: string;
}) {
  const [active, setActive] = useState<TabId>("students");
  const greeting = props.userName?.trim() ? `, ${props.userName.trim()}` : "";
  const counts = props.tabCounts ?? emptyCounts;

  return (
    <Card
      component="section"
      id={props.sectionId}
      withBorder
      radius="lg"
      p="lg"
      shadow="sm"
      mb="xl"
      className="scroll-mt-24"
    >
      <Title order={1} size="h2">
        Welcome{greeting}
      </Title>
      <Text size="sm" c="dimmed" mt="xs">
        Select who you are working with today — quick links open the right area of the programme.
      </Text>

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mt="lg">
        {tabs.map((t) => {
          const isActive = active === t.id;
          const n = counts[t.id];
          return (
            <Card
              key={t.id}
              component="button"
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`${t.label}, ${n.toLocaleString()} in your programme scope`}
              withBorder
              padding="md"
              radius="md"
              onClick={() => setActive(t.id)}
              style={{
                cursor: "pointer",
                borderWidth: 2,
                borderColor: isActive ? "var(--mantine-color-teal-6)" : "var(--mantine-color-gray-3)",
                backgroundColor: isActive ? "var(--mantine-color-teal-0)" : "var(--mantine-color-white)",
                boxShadow: isActive ? "0 0 0 1px rgba(13, 148, 136, 0.25)" : undefined,
              }}
            >
              <Text size="sm" fw={600} ta="center">
                {t.label}
              </Text>
              <Text
                size="xl"
                fw={600}
                ta="center"
                mt="xs"
                c={isActive ? "teal.8" : "dimmed"}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {n.toLocaleString()}
              </Text>
            </Card>
          );
        })}
      </SimpleGrid>

      {props.children}

      <Stack gap="xs" mt="lg" role="tabpanel">
        {active === "students" ? (
          <ul className="m-0 flex list-none flex-col gap-2 p-0 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
            <li>
              <Anchor component={Link} href="/students" fw={600} c="teal.8" underline="always">
                Student information
              </Anchor>
              <Text span size="sm" c="dimmed">
                {" "}
                — admission, lists, classes
              </Text>
            </li>
            <li>
              <Anchor component={Link} href="/students/attendance" fw={600} c="teal.8" underline="always">
                Student attendance
              </Anchor>
              <Text span size="sm" c="dimmed">
                {" "}
                — daily roll
              </Text>
            </li>
            <li>
              <Anchor component={Link} href="/evaluations" fw={600} c="teal.8" underline="always">
                Evaluations
              </Anchor>
              <Text span size="sm" c="dimmed">
                {" "}
                — scores & classes
              </Text>
            </li>
            <li>
              <Anchor component={Link} href="/examinations" fw={600} c="teal.8" underline="always">
                Examinations
              </Anchor>
              <Text span size="sm" c="dimmed">
                {" "}
                — exams & marks
              </Text>
            </li>
          </ul>
        ) : null}

        {active === "teachers" ? (
          <ul className="m-0 flex list-none flex-col gap-2 p-0 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
            <li>
              <Anchor component={Link} href="/teachers" fw={600} c="teal.8" underline="always">
                Teachers hub
              </Anchor>
              <Text span size="sm" c="dimmed">
                {" "}
                — resources & planned tools
              </Text>
            </li>
            <li>
              <Anchor component={Link} href="/teacher-content" fw={600} c="teal.8" underline="always">
                Teacher content
              </Anchor>
              <Text span size="sm" c="dimmed">
                {" "}
                — uploads & downloads
              </Text>
            </li>
            <li>
              <Anchor component={Link} href="/evaluations" fw={600} c="teal.8" underline="always">
                Evaluations
              </Anchor>
              <Text span size="sm" c="dimmed">
                {" "}
                — class assessment
              </Text>
            </li>
          </ul>
        ) : null}

        {active === "parents" ? (
          <ul className="m-0 flex list-none flex-col gap-2 p-0 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
            <li>
              <Anchor component={Link} href="/parents" fw={600} c="teal.8" underline="always">
                Parents portal
              </Anchor>
              <Text span size="sm" c="dimmed">
                {" "}
                — overview & marks
              </Text>
            </li>
            <li>
              <Anchor component={Link} href="/family" fw={600} c="teal.8" underline="always">
                Family attendance
              </Anchor>
              <Text span size="sm" c="dimmed">
                {" "}
                — linked children
              </Text>
            </li>
            <li>
              <Anchor component={Link} href="/communications" fw={600} c="teal.8" underline="always">
                Communications
              </Anchor>
              <Text span size="sm" c="dimmed">
                {" "}
                — school messages
              </Text>
            </li>
          </ul>
        ) : null}

        {active === "staff" ? (
          <ul className="m-0 flex list-none flex-col gap-2 p-0 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
            <li>
              <Anchor component={Link} href="/hr" fw={600} c="teal.8" underline="always">
                Human resources
              </Anchor>
              <Text span size="sm" c="dimmed">
                {" "}
                — HR hub & roadmap
              </Text>
            </li>
            <li>
              <Anchor component={Link} href="/hr/directory" fw={600} c="teal.8" underline="always">
                Staff directory
              </Anchor>
              <Text span size="sm" c="dimmed">
                {" "}
                — who is assigned where
              </Text>
            </li>
            <li>
              <Anchor component={Link} href="/attendance" fw={600} c="teal.8" underline="always">
                Student attendance (register)
              </Anchor>
              <Text span size="sm" c="dimmed">
                {" "}
                — record roll by school
              </Text>
            </li>
            {props.isSuperAdmin ? (
              <li>
                <Anchor component={Link} href="/admin" fw={600} c="teal.8" underline="always">
                  Administration
                </Anchor>
                <Text span size="sm" c="dimmed">
                  {" "}
                  — sites, schools, users
                </Text>
              </li>
            ) : null}
          </ul>
        ) : null}
      </Stack>
    </Card>
  );
}
