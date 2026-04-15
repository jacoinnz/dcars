"use client";

import { useState } from "react";
import { Divider, List, Paper, ScrollArea, Stack, Tabs, Text } from "@mantine/core";
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
      <Text size="sm" c="dimmed" maw={720} lh={1.65}>
        The full admission form is fixed at the top of this page. Use the outline tabs here only as a{" "}
        <strong>field guide</strong> for what each section contains.
      </Text>

      <Divider label="Field guide" labelPosition="center" />

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
                — academic year, class, section, admission number and date, roll, group
              </List.Item>
              <List.Item>
                <Text span fw={600} c="dark.5">
                  Personal information
                </Text>{" "}
                — legal name, gender, date of birth, religion, caste, optional photo URL
              </List.Item>
              <List.Item>
                <Text span fw={600} c="dark.5">
                  Contact information
                </Text>{" "}
                — student email and phone
              </List.Item>
              <List.Item>
                <Text span fw={600} c="dark.5">
                  Student address info
                </Text>{" "}
                — current and permanent address
              </List.Item>
              <List.Item>
                <Text span fw={600} c="dark.5">
                  Medical record
                </Text>{" "}
                — blood group, category, height and weight, plus immunization / health notes
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
                  Fathers info
                </Text>{" "}
                — father name (required), occupation, phone, optional photo URL and email
              </List.Item>
              <List.Item>
                <Text span fw={600} c="dark.5">
                  Mother info
                </Text>{" "}
                — mother name, occupation, phone, optional photo URL and email
              </List.Item>
              <List.Item>
                <Text span fw={600} c="dark.5">
                  Guardian info
                </Text>{" "}
                — relation (Father / Mother / Others), guardian name and contacts; when Others, specify the
                relationship; optional photo URL, occupation, and address
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
              Identity refs and notes, bank details for payouts, and four optional attachment slots (title + file URL).
              Nothing from Personal or Previous School belongs here.
            </Text>
            <List size="sm" spacing="xs" c="dimmed">
              <List.Item>
                <Text span fw={600} c="dark.5">
                  Document info
                </Text>{" "}
                — national ID, birth certificate number, additional notes, optional transfer certificate ref
              </List.Item>
              <List.Item>
                <Text span fw={600} c="dark.5">
                  Bank information
                </Text>{" "}
                — bank name, account number, IFSC
              </List.Item>
              <List.Item>
                <Text span fw={600} c="dark.5">
                  Document attachment
                </Text>{" "}
                — four titled slots with file URL + Browse (upload storage not wired yet)
              </List.Item>
            </List>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="previous-school" pt="md">
          <Paper withBorder p="md" radius="md" bg="gray.0">
            <Text size="sm" fw={600} mb="xs">
              Previous School Info
            </Text>
            <Text size="xs" c="dimmed" mb="sm">
              Single bordered block: <strong>Previous school details</strong> — one large text area for the last
              institution (name, address, class, dates, reason to move). Certificate refs stay under Document Info.
            </Text>
            <List size="sm" spacing="xs" c="dimmed">
              <List.Item>Matches common MIS “previous school” screens: one narrative field, not split columns.</List.Item>
            </List>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="other" pt="md">
          <Paper withBorder p="md" radius="md" bg="gray.0">
            <Text size="sm" fw={600} mb="xs">
              Other Info
            </Text>
            <Text size="xs" c="dimmed" mb="sm">
              Two cards on wide screens: <strong>Transport</strong> (route list, vehicle number) and{" "}
              <strong>Other info</strong> (dormitory, room number) as dropdowns; then <strong>Additional notes</strong> for
              free text. Option lists are placeholders until school masters exist.
            </Text>
            <List size="sm" spacing="xs" c="dimmed">
              <List.Item>Learning or behavioural context, pastoral handover, timing, or team remarks in notes</List.Item>
            </List>
          </Paper>
        </Tabs.Panel>
      </Tabs>

      {props.schoolRows.length > 0 ? (
        <Text size="sm" c="dimmed">
          After saving, open the{" "}
          <NextMantineAnchor href="/evaluations" fw={600}>
            school workspace
          </NextMantineAnchor>{" "}
          for class membership, roster, and the class dropdown when your data includes class names.
        </Text>
      ) : (
        <Text size="sm" c="dimmed">
          Add schools under{" "}
          <NextMantineAnchor href="/admin/institutions" fw={600}>
            Admin → Schools
          </NextMantineAnchor>{" "}
          to use admission.
        </Text>
      )}
    </Stack>
  );
}
