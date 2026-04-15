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
  NZ_PHASE_BANDS,
  NZ_SECTION_CONCEPTS,
  NZ_SECTION_EXAMPLES,
  NZ_SECTION_NAMING,
} from "@/lib/nz-academic-section-data";

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function matchesFilter(q: string, ...fields: (string | undefined)[]): boolean {
  if (!q) return true;
  const n = normalize(q);
  return fields.some((f) => f && normalize(f).includes(n));
}

export function NzAcademicSectionView() {
  const [q, setQ] = useState("");

  const conceptRows = useMemo(
    () =>
      NZ_SECTION_CONCEPTS.filter((r) =>
        matchesFilter(q, r.concept, r.meaning, r.nzNotes),
      ),
    [q],
  );
  const phaseRows = useMemo(
    () =>
      NZ_PHASE_BANDS.filter((r) =>
        matchesFilter(q, r.code, r.label, r.years, r.typicalUse),
      ),
    [q],
  );
  const namingRows = useMemo(
    () =>
      NZ_SECTION_NAMING.filter((r) =>
        matchesFilter(q, r.pattern, r.example, r.notes),
      ),
    [q],
  );
  const exampleRows = useMemo(
    () =>
      NZ_SECTION_EXAMPLES.filter((r) =>
        matchesFilter(q, r.code, r.description, r.detail),
      ),
    [q],
  );

  const anyHit =
    conceptRows.length + phaseRows.length + namingRows.length + exampleRows.length > 0;

  return (
    <Stack gap="lg" mt="md">
      <TextInput
        label="Filter"
        description="Search concepts, phases, naming patterns, and examples."
        placeholder="e.g. junior, NCEA, whānau, primary"
        value={q}
        onChange={(e) => setQ(e.currentTarget.value)}
        radius="md"
      />

      {!anyHit ? (
        <Text size="sm" c="dimmed">
          No rows match your filter.
        </Text>
      ) : (
        <Accordion variant="separated" radius="md" multiple defaultValue={["c", "p", "n", "e"]}>
          {conceptRows.length > 0 ? (
            <Accordion.Item value="c">
              <Accordion.Control>
                <Title order={4} size="h5">
                  What “section” can mean
                </Title>
              </Accordion.Control>
              <Accordion.Panel>
                <Table striped highlightOnHover horizontalSpacing="md" verticalSpacing="xs">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: "11rem" }}>Concept</Table.Th>
                      <Table.Th>Meaning</Table.Th>
                      <Table.Th>NZ notes</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {conceptRows.map((row) => (
                      <Table.Tr key={row.concept}>
                        <Table.Td>
                          <Text size="sm" fw={600}>
                            {row.concept}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{row.meaning}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">
                            {row.nzNotes}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Accordion.Panel>
            </Accordion.Item>
          ) : null}

          {phaseRows.length > 0 ? (
            <Accordion.Item value="p">
              <Accordion.Control>
                <Title order={4} size="h5">
                  Typical phase bands (NZ)
                </Title>
              </Accordion.Control>
              <Accordion.Panel>
                <Table striped highlightOnHover horizontalSpacing="md" verticalSpacing="xs">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: "5rem" }}>Code</Table.Th>
                      <Table.Th style={{ width: "11rem" }}>Label</Table.Th>
                      <Table.Th>Years</Table.Th>
                      <Table.Th>Typical use</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {phaseRows.map((row) => (
                      <Table.Tr key={row.code}>
                        <Table.Td>
                          <Text size="sm" ff="monospace" fw={600}>
                            {row.code}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{row.label}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">
                            {row.years}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">
                            {row.typicalUse}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Accordion.Panel>
            </Accordion.Item>
          ) : null}

          {namingRows.length > 0 ? (
            <Accordion.Item value="n">
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
                    {namingRows.map((row) => (
                      <Table.Tr key={row.pattern}>
                        <Table.Td>
                          <Text size="sm" fw={600}>
                            {row.pattern}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{row.example}</Text>
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
            <Accordion.Item value="e">
              <Accordion.Control>
                <Title order={4} size="h5">
                  Example section codes (illustrative)
                </Title>
              </Accordion.Control>
              <Accordion.Panel>
                <Table striped highlightOnHover horizontalSpacing="md" verticalSpacing="xs">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: "11rem" }}>Code</Table.Th>
                      <Table.Th>Description</Table.Th>
                      <Table.Th>Detail</Table.Th>
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
