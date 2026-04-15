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
              Personal Info (learner only)
            </Text>
            <List size="sm" spacing="xs" c="dimmed">
              <List.Item>
                <Text span fw={600} c="dark.5">
                  Academic information
                </Text>{" "}
                — admission date, roll number
              </List.Item>
              <List.Item>
                <Text span fw={600} c="dark.5">
                  Personal information
                </Text>{" "}
                — legal name, date of birth, gender, blood group
              </List.Item>
              <List.Item>
                <Text span fw={600} c="dark.5">
                  Contact information
                </Text>{" "}
                — student email and phone
              </List.Item>
              <List.Item>
                <Text span fw={600} c="dark.5">
                  Medical records
                </Text>{" "}
                — immunization and health notes for this learner
              </List.Item>
              <List.Item>
                <Text span fw={600} c="dark.5">
                  Student address
                </Text>{" "}
                — home postal address
              </List.Item>
            </List>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="parents" pt="md">
          <Paper withBorder p="md" radius="md" bg="gray.0">
            <Text size="sm" fw={600} mb="sm">
              Parents &amp; Guardian Info
            </Text>
            <List size="sm" spacing="xs" c="dimmed">
              <List.Item>
                <Text span fw={600} c="dark.5">
                  Parents
                </Text>{" "}
                — Parent 1 (always); optional Parent 2 when you tick “Include second parent” (then Parent 2 name and
                contact are required)
              </List.Item>
              <List.Item>
                <Text span fw={600} c="dark.5">
                  Guardian
                </Text>{" "}
                — separate block for a non-parent primary contact when needed
              </List.Item>
            </List>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="documents" pt="md">
          <Paper withBorder p="md" radius="md" bg="gray.0">
            <Text size="sm" fw={600} mb="xs">
              Document Info
            </Text>
            <Text size="xs" c="dimmed" mb="sm">
              References and checklist text only (numbers, authority, dates) — not uploads. Nothing from Personal,
              Parents, or Previous School tabs belongs here.
            </Text>
            <List size="sm" spacing="xs" c="dimmed">
              <List.Item>Birth certificate — registration / authority / date issued</List.Item>
              <List.Item>National ID or passport — number and type</List.Item>
              <List.Item>Transfer or leaving certificate — certificate reference (paper proof of movement)</List.Item>
              <List.Item>Other supporting papers — custody, sponsorship, court orders (reference lines only)</List.Item>
            </List>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="previous-school" pt="md">
          <Paper withBorder p="md" radius="md" bg="gray.0">
            <Text size="sm" fw={600} mb="xs">
              Previous School Info
            </Text>
            <Text size="xs" c="dimmed" mb="sm">
              Prior institution narrative only — where they studied last, class level, when they left, and why.
              Certificate numbers and paper refs stay under Document Info.
            </Text>
            <List size="sm" spacing="xs" c="dimmed">
              <List.Item>
                <Text span fw={600} c="dark.5">
                  Institution
                </Text>{" "}
                — school or college name; town / region / address of that school
              </List.Item>
              <List.Item>
                <Text span fw={600} c="dark.5">
                  Class &amp; exit
                </Text>{" "}
                — last class, grade, or year; date left; reason for leaving / transfer
              </List.Item>
            </List>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="other" pt="md">
          <Paper withBorder p="md" radius="md" bg="gray.0">
            <Text size="sm" fw={600} mb="xs">
              Other Info
            </Text>
            <Text size="xs" c="dimmed" mb="sm">
              One catch-all notes box only — unstructured text that does not belong in the other tabs. Do not duplicate
              identity, parents, documents, or previous-school fields here.
            </Text>
            <List size="sm" spacing="xs" c="dimmed">
              <List.Item>Learning or behavioural context not captured elsewhere</List.Item>
              <List.Item>Pastoral / safeguarding handover phrased as narrative (not duplicate medical or document refs)</List.Item>
              <List.Item>Timing, special arrangements, or admissions team remarks</List.Item>
            </List>
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
