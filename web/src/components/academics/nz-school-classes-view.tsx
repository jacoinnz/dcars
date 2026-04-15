"use client";

import { useMemo, useState } from "react";
import {
  Accordion,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  NZ_CLASS_KINDS,
  NZ_EXAMPLE_CLASS_CODES,
  NZ_NAMING_PATTERNS,
  NZ_YEAR_LEVELS,
} from "@/lib/nz-school-classes-data";

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function matchesFilter(q: string, ...fields: (string | undefined)[]): boolean {
  if (!q) return true;
  const n = normalize(q);
  return fields.some((f) => f && normalize(f).includes(n));
}

export function NzSchoolClassesView() {
  const [q, setQ] = useState("");

  const yearRows = useMemo(
    () =>
      NZ_YEAR_LEVELS.filter((r) =>
        matchesFilter(q, r.year, r.label, r.typicalNotes),
      ),
    [q],
  );
  const kindRows = useMemo(
    () =>
      NZ_CLASS_KINDS.filter((r) =>
        matchesFilter(q, r.kind, r.purpose, r.codeHints),
      ),
    [q],
  );
  const patternRows = useMemo(
    () =>
      NZ_NAMING_PATTERNS.filter((r) =>
        matchesFilter(q, r.pattern, r.example, r.notes),
      ),
    [q],
  );
  const exampleRows = useMemo(
    () =>
      NZ_EXAMPLE_CLASS_CODES.filter((r) =>
        matchesFilter(q, r.code, r.description, r.detail),
      ),
    [q],
  );

  const anyHit =
    yearRows.length + kindRows.length + patternRows.length + exampleRows.length > 0;

  return (
    <Stack gap="lg" mt="md">
      <TextInput
        label="Filter"
        description="Search across year levels, class types, patterns, and examples."
        placeholder="e.g. form, NCEA, 10A, subject"
        value={q}
        onChange={(e) => setQ(e.currentTarget.value)}
        radius="md"
      />

      {!anyHit ? (
        <Text size="sm" c="dimmed">
          No rows match your filter.
        </Text>
      ) : (
        <Accordion variant="separated" radius="md" multiple defaultValue={["years", "kinds", "patterns", "examples"]}>
          {yearRows.length > 0 ? (
            <Accordion.Item value="years">
              <Accordion.Control>
                <Title order={4} size="h5">
                  NZ year levels (reference)
                </Title>
              </Accordion.Control>
              <Accordion.Panel>
                <Table striped highlightOnHover horizontalSpacing="md" verticalSpacing="xs">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: "7rem" }}>Years</Table.Th>
                      <Table.Th>Label</Table.Th>
                      <Table.Th>Typical notes</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {yearRows.map((row) => (
                      <Table.Tr key={row.year}>
                        <Table.Td>
                          <Text size="sm" fw={600}>
                            {row.year}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{row.label}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">
                            {row.typicalNotes}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Accordion.Panel>
            </Accordion.Item>
          ) : null}

          {kindRows.length > 0 ? (
            <Accordion.Item value="kinds">
              <Accordion.Control>
                <Title order={4} size="h5">
                  Types of “class” in a school
                </Title>
              </Accordion.Control>
              <Accordion.Panel>
                <Table striped highlightOnHover horizontalSpacing="md" verticalSpacing="xs">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: "14rem" }}>Kind</Table.Th>
                      <Table.Th>Purpose</Table.Th>
                      <Table.Th>Code hints</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {kindRows.map((row) => (
                      <Table.Tr key={row.kind}>
                        <Table.Td>
                          <Text size="sm" fw={600}>
                            {row.kind}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{row.purpose}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">
                            {row.codeHints}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Accordion.Panel>
            </Accordion.Item>
          ) : null}

          {patternRows.length > 0 ? (
            <Accordion.Item value="patterns">
              <Accordion.Control>
                <Title order={4} size="h5">
                  Naming patterns
                </Title>
              </Accordion.Control>
              <Accordion.Panel>
                <Table striped highlightOnHover horizontalSpacing="md" verticalSpacing="xs">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: "12rem" }}>Pattern</Table.Th>
                      <Table.Th>Example</Table.Th>
                      <Table.Th>Notes</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {patternRows.map((row) => (
                      <Table.Tr key={row.pattern}>
                        <Table.Td>
                          <Text size="sm" fw={600}>
                            {row.pattern}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" ff="monospace">
                            {row.example}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">
                            {row.notes}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Accordion.Panel>
            </Accordion.Item>
          ) : null}

          {exampleRows.length > 0 ? (
            <Accordion.Item value="examples">
              <Accordion.Control>
                <Title order={4} size="h5">
                  Example class codes (illustrative)
                </Title>
              </Accordion.Control>
              <Accordion.Panel>
                <Table striped highlightOnHover horizontalSpacing="md" verticalSpacing="xs">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: "11rem" }}>Code</Table.Th>
                      <Table.Th>Description</Table.Th>
                      <Table.Th>Type</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {exampleRows.map((row) => (
                      <Table.Tr key={row.code}>
                        <Table.Td>
                          <Text size="sm" ff="monospace" fw={600}>
                            {row.code}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{row.description}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">
                            {row.detail}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Accordion.Panel>
            </Accordion.Item>
          ) : null}
        </Accordion>
      )}
    </Stack>
  );
}
