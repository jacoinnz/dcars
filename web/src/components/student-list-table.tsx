"use client";

import { useMemo, useState } from "react";
import { Paper, Stack, Table, Text, TextInput } from "@mantine/core";

export type StudentListRow = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  admissionNumber: string | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  admissionDate: string | null;
};

export function StudentListTable(props: {
  students: StudentListRow[];
  classNamesByStudentId: Record<string, string[]>;
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return props.students;
    return props.students.filter((st) => {
      const classStr = (props.classNamesByStudentId[st.id] ?? []).join(" ");
      const blob = [
        st.firstName,
        st.middleName,
        st.lastName,
        st.admissionNumber,
        st.gender,
        st.phone,
        st.email,
        classStr,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(s);
    });
  }, [props.students, props.classNamesByStudentId, q]);

  function displayName(st: StudentListRow) {
    const mid = st.middleName?.trim();
    return [st.firstName, mid, st.lastName].filter(Boolean).join(" ");
  }

  function contact(st: StudentListRow) {
    if (st.phone?.trim()) return st.phone.trim();
    if (st.email?.trim()) return st.email.trim();
    return "—";
  }

  return (
    <Stack gap="md">
      <TextInput
        label="Search students"
        description={`Showing ${filtered.length} of ${props.students.length}`}
        placeholder="Name, roll number, class, phone…"
        value={q}
        onChange={(e) => setQ(e.currentTarget.value)}
        autoComplete="off"
        size="sm"
      />

      {filtered.length === 0 ? (
        <Paper withBorder p="xl" radius="md" bg="gray.0">
          <Text size="sm" c="dimmed" ta="center">
            {props.students.length === 0
              ? "No students recorded yet. Admit a learner using the form below."
              : "No students match your search."}
          </Text>
        </Paper>
      ) : (
        <Table.ScrollContainer minWidth={720}>
          <Table striped highlightOnHover withTableBorder withColumnBorders verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: 48 }}>#</Table.Th>
                <Table.Th>Student</Table.Th>
                <Table.Th>Roll / adm. no.</Table.Th>
                <Table.Th>Gender</Table.Th>
                <Table.Th>Contact</Table.Th>
                <Table.Th>Classes</Table.Th>
                <Table.Th>Adm. date</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map((st, i) => {
                const classes = props.classNamesByStudentId[st.id] ?? [];
                return (
                  <Table.Tr key={st.id}>
                    <Table.Td>
                      <Text size="sm" c="dimmed" ff="monospace">
                        {i + 1}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {displayName(st)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{st.admissionNumber?.trim() || "—"}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{st.gender?.trim() || "—"}</Text>
                    </Table.Td>
                    <Table.Td maw={200}>
                      <Text size="sm" style={{ wordBreak: "break-word" }}>
                        {contact(st)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {classes.length ? [...classes].sort((a, b) => a.localeCompare(b)).join(", ") : "—"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" ff="monospace">
                        {st.admissionDate?.trim() || "—"}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </Stack>
  );
}
