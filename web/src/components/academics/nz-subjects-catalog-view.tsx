"use client";

import { useMemo, useState } from "react";
import {
  Accordion,
  Code,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { NZ_LEARNING_AREAS } from "@/lib/nz-subjects-catalog-data";

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

export function NzSubjectsCatalogView() {
  const [q, setQ] = useState("");

  const filteredAreas = useMemo(() => {
    const needle = normalize(q);
    if (!needle) return NZ_LEARNING_AREAS;
    return NZ_LEARNING_AREAS.map((area) => ({
      ...area,
      subjects: area.subjects.filter(
        (s) =>
          normalize(s.name).includes(needle) ||
          normalize(s.code).includes(needle) ||
          (s.note && normalize(s.note).includes(needle)),
      ),
    })).filter((a) => a.subjects.length > 0);
  }, [q]);

  return (
    <Stack gap="lg" mt="md">
      <TextInput
        label="Filter subjects"
        description="Search by name, code, or note."
        placeholder="e.g. biology, TRM, NCEA"
        value={q}
        onChange={(e) => setQ(e.currentTarget.value)}
        radius="md"
      />

      <Accordion variant="separated" radius="md" multiple defaultValue={NZ_LEARNING_AREAS.map((a) => a.id)}>
        {filteredAreas.map((area) => (
          <Accordion.Item key={area.id} value={area.id}>
            <Accordion.Control>
              <Stack gap={2}>
                <Title order={4} size="h5">
                  {area.title}
                </Title>
                {area.titleMi ? (
                  <Text size="xs" c="dimmed">
                    {area.titleMi}
                  </Text>
                ) : null}
              </Stack>
            </Accordion.Control>
            <Accordion.Panel>
              <Table striped highlightOnHover horizontalSpacing="md" verticalSpacing="xs">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: "9rem" }}>Code</Table.Th>
                    <Table.Th>Subject</Table.Th>
                    <Table.Th>Notes</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {area.subjects.map((row) => (
                    <Table.Tr key={`${area.id}-${row.code}`}>
                      <Table.Td>
                        <Code>{row.code}</Code>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{row.name}</Text>
                      </Table.Td>
                      <Table.Td>
                        {row.note ? (
                          <Text size="sm" c="dimmed">
                            {row.note}
                          </Text>
                        ) : (
                          <Text size="sm" c="dimmed">
                            —
                          </Text>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>

      {filteredAreas.length === 0 ? (
        <Text size="sm" c="dimmed">
          No subjects match your filter.
        </Text>
      ) : null}
    </Stack>
  );
}
