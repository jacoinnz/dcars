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
  NZ_OPTIONAL_CONCEPTS,
  NZ_OPTIONAL_DOMAINS,
  NZ_OPTIONAL_EXAMPLES,
  NZ_OPTIONAL_NAMING,
} from "@/lib/nz-optional-subjects-data";

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function matchesFilter(q: string, ...fields: (string | undefined)[]): boolean {
  if (!q) return true;
  const n = normalize(q);
  return fields.some((f) => f && normalize(f).includes(n));
}

export function NzOptionalSubjectsView() {
  const [q, setQ] = useState("");

  const conceptRows = useMemo(
    () =>
      NZ_OPTIONAL_CONCEPTS.filter((r) =>
        matchesFilter(q, r.term, r.meaning, r.nzNotes),
      ),
    [q],
  );
  const domainRows = useMemo(
    () =>
      NZ_OPTIONAL_DOMAINS.filter((r) =>
        matchesFilter(q, r.domain, r.examples, r.codeHints),
      ),
    [q],
  );
  const namingRows = useMemo(
    () =>
      NZ_OPTIONAL_NAMING.filter((r) =>
        matchesFilter(q, r.pattern, r.example, r.notes),
      ),
    [q],
  );
  const exampleRows = useMemo(
    () =>
      NZ_OPTIONAL_EXAMPLES.filter((r) =>
        matchesFilter(q, r.code, r.description, r.detail),
      ),
    [q],
  );

  const anyHit =
    conceptRows.length + domainRows.length + namingRows.length + exampleRows.length > 0;

  return (
    <Stack gap="lg" mt="md">
      <TextInput
        label="Filter"
        description="Search concepts, domains, naming patterns, and examples."
        placeholder="e.g. NCEA, rotation, language, OPT"
        value={q}
        onChange={(e) => setQ(e.currentTarget.value)}
        radius="md"
      />

      {!anyHit ? (
        <Text size="sm" c="dimmed">
          No rows match your filter.
        </Text>
      ) : (
        <Accordion variant="separated" radius="md" multiple defaultValue={["c", "d", "n", "e"]}>
          {conceptRows.length > 0 ? (
            <Accordion.Item value="c">
              <Accordion.Control>
                <Title order={4} size="h5">
                  Concepts
                </Title>
              </Accordion.Control>
              <Accordion.Panel>
                <Table striped highlightOnHover horizontalSpacing="md" verticalSpacing="xs">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: "11rem" }}>Term</Table.Th>
                      <Table.Th>Meaning</Table.Th>
                      <Table.Th>NZ notes</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {conceptRows.map((row) => (
                      <Table.Tr key={row.term}>
                        <Table.Td>
                          <Text size="sm" fw={600}>
                            {row.term}
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

          {domainRows.length > 0 ? (
            <Accordion.Item value="d">
              <Accordion.Control>
                <Title order={4} size="h5">
                  Common optional domains
                </Title>
              </Accordion.Control>
              <Accordion.Panel>
                <Table striped highlightOnHover horizontalSpacing="md" verticalSpacing="xs">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: "12rem" }}>Domain</Table.Th>
                      <Table.Th>Examples</Table.Th>
                      <Table.Th>Code hints</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {domainRows.map((row) => (
                      <Table.Tr key={row.domain}>
                        <Table.Td>
                          <Text size="sm" fw={600}>
                            {row.domain}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{row.examples}</Text>
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
            <Accordion.Item value="e">
              <Accordion.Control>
                <Title order={4} size="h5">
                  Example optional line codes (illustrative)
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
