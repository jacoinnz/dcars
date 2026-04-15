"use client";

import { useMemo, useState } from "react";
import { Group, Paper, Select, Stack, Table, TableScrollContainer, Text, TextInput } from "@mantine/core";

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
  /** Set when the roster spans more than one school. */
  schoolName?: string | null;
};

export function StudentListTable(props: {
  students: StudentListRow[];
  classNamesByStudentId: Record<string, string[]>;
  /** Show a School column (e.g. all-students view across sites). */
  showSchoolColumn?: boolean;
  emptyHintNoStudents?: string;
  emptyHintNoMatch?: string;
}) {
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<
    "name-asc" | "name-desc" | "admission-asc" | "admission-desc" | "school-asc" | "school-desc" | "admdate-asc" | "admdate-desc"
  >("name-asc");
  const showSchool = Boolean(props.showSchoolColumn);

  function displayName(st: StudentListRow) {
    const mid = st.middleName?.trim();
    return [st.firstName, mid, st.lastName].filter(Boolean).join(" ");
  }

  function contact(st: StudentListRow) {
    if (st.phone?.trim()) return st.phone.trim();
    if (st.email?.trim()) return st.email.trim();
    return "—";
  }

  const filteredAndSorted = useMemo(() => {
    const s = q.trim().toLowerCase();
    const filtered = !s
      ? props.students
      : props.students.filter((st) => {
          const classStr = (props.classNamesByStudentId[st.id] ?? []).join(" ");
          const blob = [
            st.firstName,
            st.middleName,
            st.lastName,
            st.admissionNumber,
            st.gender,
            st.phone,
            st.email,
            st.schoolName,
            classStr,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return blob.includes(s);
        });

    const nameKey = (st: StudentListRow) => displayName(st).toLowerCase();
    const admissionKey = (st: StudentListRow) => (st.admissionNumber ?? "").trim().toLowerCase();
    const schoolKey = (st: StudentListRow) => (st.schoolName ?? "").trim().toLowerCase();
    const admDateKey = (st: StudentListRow) => (st.admissionDate ?? "").trim();

    const sorted = [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "name-asc":
          return nameKey(a).localeCompare(nameKey(b));
        case "name-desc":
          return nameKey(b).localeCompare(nameKey(a));
        case "admission-asc":
          return admissionKey(a).localeCompare(admissionKey(b));
        case "admission-desc":
          return admissionKey(b).localeCompare(admissionKey(a));
        case "school-asc":
          return schoolKey(a).localeCompare(schoolKey(b));
        case "school-desc":
          return schoolKey(b).localeCompare(schoolKey(a));
        case "admdate-asc":
          return admDateKey(a).localeCompare(admDateKey(b));
        case "admdate-desc":
          return admDateKey(b).localeCompare(admDateKey(a));
      }
    });

    return { filtered, sorted };
  }, [props.students, props.classNamesByStudentId, q, sortKey]);

  return (
    <Stack gap="md">
      <Paper
        withBorder
        radius="md"
        p="sm"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          background: "var(--mantine-color-body)",
        }}
      >
        <Group align="flex-end" justify="space-between" wrap="wrap" gap="sm">
          <TextInput
            label="Search"
            description={`Showing ${filteredAndSorted.filtered.length} of ${props.students.length}`}
            placeholder="Name, roll number, class, phone…"
            value={q}
            onChange={(e) => setQ(e.currentTarget.value)}
            autoComplete="off"
            size="sm"
            style={{ flex: 1, minWidth: 260 }}
          />
          <Select
            label="Sort"
            value={sortKey}
            onChange={(v) => {
              if (!v) return;
              setSortKey(
                v as
                  | "name-asc"
                  | "name-desc"
                  | "admission-asc"
                  | "admission-desc"
                  | "school-asc"
                  | "school-desc"
                  | "admdate-asc"
                  | "admdate-desc",
              );
            }}
            data={[
              { value: "name-asc", label: "Name (A → Z)" },
              { value: "name-desc", label: "Name (Z → A)" },
              { value: "admission-asc", label: "Roll / adm. no. (A → Z)" },
              { value: "admission-desc", label: "Roll / adm. no. (Z → A)" },
              ...(showSchool
                ? [
                    { value: "school-asc", label: "School (A → Z)" },
                    { value: "school-desc", label: "School (Z → A)" },
                  ]
                : []),
              { value: "admdate-asc", label: "Admission date (oldest)" },
              { value: "admdate-desc", label: "Admission date (newest)" },
            ]}
            size="sm"
            style={{ minWidth: 220 }}
            allowDeselect={false}
          />
        </Group>
      </Paper>

      {filteredAndSorted.filtered.length === 0 ? (
        <Paper withBorder p="xl" radius="md" bg="gray.0">
          <Text size="sm" c="dimmed" ta="center">
            {props.students.length === 0
              ? (props.emptyHintNoStudents ??
                "No students recorded yet. Admit a learner using the form below.")
              : (props.emptyHintNoMatch ?? "No students match your search.")}
          </Text>
        </Paper>
      ) : (
        <TableScrollContainer minWidth={720}>
          <Table
            striped
            highlightOnHover
            withTableBorder
            withColumnBorders
            verticalSpacing="sm"
            horizontalSpacing="md"
            stickyHeader
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: 48 }}>#</Table.Th>
                {showSchool ? <Table.Th>School</Table.Th> : null}
                <Table.Th>Student</Table.Th>
                <Table.Th>Roll / adm. no.</Table.Th>
                <Table.Th>Gender</Table.Th>
                <Table.Th>Contact</Table.Th>
                <Table.Th>Classes</Table.Th>
                <Table.Th>Adm. date</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredAndSorted.sorted.map((st, i) => {
                const classes = props.classNamesByStudentId[st.id] ?? [];
                return (
                  <Table.Tr key={st.id}>
                    <Table.Td>
                      <Text size="sm" c="dimmed" ff="monospace">
                        {i + 1}
                      </Text>
                    </Table.Td>
                    {showSchool ? (
                      <Table.Td maw={200}>
                        <Text size="sm">{st.schoolName?.trim() || "—"}</Text>
                      </Table.Td>
                    ) : null}
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
        </TableScrollContainer>
      )}
    </Stack>
  );
}
