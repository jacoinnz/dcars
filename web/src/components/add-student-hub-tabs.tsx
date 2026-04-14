"use client";

import { useState } from "react";
import { List, Paper, ScrollArea, Stack, Tabs, Text } from "@mantine/core";
import { HubLinkCard } from "@/components/hub-link-card";
import { NextMantineAnchor } from "@/components/next-mantine-links";

export type AddStudentHubSchoolRow = { id: string; name: string; siteName: string };

const HUB_TAB_VALUES = [
  "personal",
  "parents",
  "documents",
  "previous-school",
  "other",
] as const;

type HubTab = (typeof HUB_TAB_VALUES)[number];

function isHubTab(v: string | null): v is HubTab {
  return v !== null && (HUB_TAB_VALUES as readonly string[]).includes(v);
}

export function AddStudentHubTabs(props: { schoolRows: AddStudentHubSchoolRow[] }) {
  const [active, setActive] = useState<HubTab>("personal");

  return (
    <Stack gap="lg">
      <Text size="sm" c="dimmed" maw={640}>
        Use the tabs to see what belongs in each part of a new admission. The full form (all sections) opens from each
        school workspace below.
      </Text>

      <HubLinkCard href="/entry" variant="live">
        <Text fw={600} size="sm">
          Participant registration
        </Text>
        <Text size="sm" c="dimmed" mt="xs">
          Register a new youth before linking to a school student profile.
        </Text>
      </HubLinkCard>

      <Tabs
        value={active}
        onChange={(v) => {
          if (v && isHubTab(v)) setActive(v);
        }}
        keepMounted={false}
        variant="outline"
      >
        <ScrollArea type="scroll" scrollbars="x" offsetScrollbars>
          <Tabs.List
            style={{
              flexWrap: "nowrap",
              width: "max-content",
              minWidth: "100%",
            }}
          >
            <Tabs.Tab value="personal">Personal Info</Tabs.Tab>
            <Tabs.Tab value="parents">Parents &amp; Guardian Info</Tabs.Tab>
            <Tabs.Tab value="documents">Document Info</Tabs.Tab>
            <Tabs.Tab value="previous-school">Previous School Info</Tabs.Tab>
            <Tabs.Tab value="other">Other Info</Tabs.Tab>
          </Tabs.List>
        </ScrollArea>

        <Tabs.Panel value="personal" pt="md">
          <Paper withBorder p="md" radius="md" bg="gray.0">
            <Text size="sm" fw={600} mb="sm">
              Personal Info
            </Text>
            <List size="sm" spacing="xs" c="dimmed">
              <List.Item>Admission date and roll number</List.Item>
              <List.Item>Legal name (first, middle, last)</List.Item>
              <List.Item>Date of birth, gender, blood group</List.Item>
              <List.Item>Student email, phone, and postal address</List.Item>
            </List>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="parents" pt="md">
          <Paper withBorder p="md" radius="md" bg="gray.0">
            <Text size="sm" fw={600} mb="sm">
              Parents &amp; Guardian Info
            </Text>
            <List size="sm" spacing="xs" c="dimmed">
              <List.Item>Father — name, occupation, phone, email</List.Item>
              <List.Item>Mother — name, occupation, phone, email</List.Item>
              <List.Item>Guardian / local contact when not the parents</List.Item>
            </List>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="documents" pt="md">
          <Paper withBorder p="md" radius="md" bg="gray.0">
            <Text size="sm" fw={600} mb="sm">
              Document Info
            </Text>
            <List size="sm" spacing="xs" c="dimmed">
              <List.Item>Birth certificate reference</List.Item>
              <List.Item>National ID or passport details</List.Item>
              <List.Item>Transfer / leaving certificate references</List.Item>
              <List.Item>Medical / immunization notes</List.Item>
              <List.Item>Other documents (custody, sponsorship, etc.)</List.Item>
            </List>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="previous-school" pt="md">
          <Paper withBorder p="md" radius="md" bg="gray.0">
            <Text size="sm" fw={600} mb="sm">
              Previous School Info
            </Text>
            <List size="sm" spacing="xs" c="dimmed">
              <List.Item>Last school name and address</List.Item>
              <List.Item>Class / grade / year completed</List.Item>
              <List.Item>Date left and reason for transfer</List.Item>
            </List>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="other" pt="md">
          <Paper withBorder p="md" radius="md" bg="gray.0">
            <Text size="sm" fw={600} mb="sm">
              Other Info
            </Text>
            <Text size="sm" c="dimmed">
              General admission notes — medical alerts, learning needs, safeguarding context, or anything that does
              not fit the categories above.
            </Text>
          </Paper>
        </Tabs.Panel>
      </Tabs>

      {props.schoolRows.length === 0 ? (
        <Text size="sm" c="dimmed">
          Add schools under{" "}
          <NextMantineAnchor href="/admin/institutions" fw={600}>
            Admin → Schools
          </NextMantineAnchor>{" "}
          to open the tabbed admission form.
        </Text>
      ) : (
        <Stack gap="xs">
          <Text size="sm" fw={600}>
            Complete admission (all tabs) at a school
          </Text>
          <Stack gap="sm">
            {props.schoolRows.map((s) => (
              <Paper key={s.id} withBorder p="md" radius="md">
                <Text size="sm" fw={600}>
                  {s.name}
                </Text>
                <Text size="xs" c="dimmed" mb="sm">
                  {s.siteName}
                </Text>
                <NextMantineAnchor href={`/evaluations/students/${s.id}`} size="sm" fw={600}>
                  Open admission form →
                </NextMantineAnchor>
              </Paper>
            ))}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
