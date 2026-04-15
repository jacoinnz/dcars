"use client";

import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  Alert,
  Button,
  Checkbox,
  Group,
  Paper,
  Stack,
  Table,
  TableScrollContainer,
  Text,
  Title,
} from "@mantine/core";
import { restoreStudents, softDeleteStudents } from "@/app/students/students-soft-delete-actions";
import type { StudentListRow } from "@/components/student-list-table";

export type DeleteRecordRosterRow = StudentListRow & { schoolName: string };

export type RecoverableRow = DeleteRecordRosterRow & { deletedAtIso: string };

function displayName(st: StudentListRow) {
  const mid = st.middleName?.trim();
  return [st.firstName, mid, st.lastName].filter(Boolean).join(" ");
}

export function StudentDeleteRecordPanel(props: {
  roster: DeleteRecordRosterRow[];
  recoverable: RecoverableRow[];
  classNamesByStudentId: Record<string, string[]>;
  showSchoolColumn: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedActive, setSelectedActive] = useState<Set<string>>(new Set());
  const [selectedRecover, setSelectedRecover] = useState<Set<string>>(new Set());

  const showSchool = props.showSchoolColumn;

  const allActiveIds = useMemo(() => props.roster.map((r) => r.id), [props.roster]);
  const allRecoverIds = useMemo(() => props.recoverable.map((r) => r.id), [props.recoverable]);

  function toggleActive(id: string, checked: boolean) {
    setSelectedActive((prev) => {
      const n = new Set(prev);
      if (checked) n.add(id);
      else n.delete(id);
      return n;
    });
  }

  function toggleRecover(id: string, checked: boolean) {
    setSelectedRecover((prev) => {
      const n = new Set(prev);
      if (checked) n.add(id);
      else n.delete(id);
      return n;
    });
  }

  function selectAllActive(checked: boolean) {
    setSelectedActive(checked ? new Set(allActiveIds) : new Set());
  }

  function selectAllRecover(checked: boolean) {
    setSelectedRecover(checked ? new Set(allRecoverIds) : new Set());
  }

  function runDelete() {
    setError(null);
    const ids = [...selectedActive];
    if (ids.length === 0) return;
    if (!window.confirm(`Remove ${ids.length} student record(s) from the active list? They can be restored within 7 days.`)) {
      return;
    }
    startTransition(async () => {
      const res = await softDeleteStudents(ids);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSelectedActive(new Set());
      router.refresh();
    });
  }

  function runRestore() {
    setError(null);
    const ids = [...selectedRecover];
    if (ids.length === 0) return;
    startTransition(async () => {
      const res = await restoreStudents(ids);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSelectedRecover(new Set());
      router.refresh();
    });
  }

  return (
    <Stack gap="xl">
      {error ? (
        <Alert color="red" title="Could not complete action" onClose={() => setError(null)} withCloseButton>
          <Text size="sm">{error}</Text>
        </Alert>
      ) : null}

      <Paper withBorder shadow="sm" p={{ base: "md", lg: "xl" }} radius="lg">
        <Stack gap="md">
          <div>
            <Title order={2} size="h5">
              Active students
            </Title>
            <Text size="xs" c="dimmed" mt={6}>
              Select learners to remove from the roster. Records stay recoverable for <strong>7 days</strong> after
              removal.
            </Text>
          </div>

          {props.roster.length === 0 ? (
            <Text size="sm" c="dimmed">
              No active students in your schools.
            </Text>
          ) : (
            <>
              <Group justify="flex-end">
                <Button
                  color="red"
                  disabled={selectedActive.size === 0 || pending}
                  loading={pending}
                  onClick={runDelete}
                >
                  Remove selected
                </Button>
              </Group>
              <TableScrollContainer minWidth={showSchool ? 840 : 720}>
                <Table striped highlightOnHover withTableBorder withColumnBorders verticalSpacing="sm" horizontalSpacing="md">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: 40 }}>
                        <Checkbox
                          aria-label="Select all active"
                          checked={allActiveIds.length > 0 && selectedActive.size === allActiveIds.length}
                          indeterminate={selectedActive.size > 0 && selectedActive.size < allActiveIds.length}
                          onChange={(e) => selectAllActive(e.currentTarget.checked)}
                        />
                      </Table.Th>
                      <Table.Th style={{ width: 40 }}>#</Table.Th>
                      {showSchool ? <Table.Th>School</Table.Th> : null}
                      <Table.Th>Student</Table.Th>
                      <Table.Th>Roll / adm. no.</Table.Th>
                      <Table.Th>Classes</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {props.roster.map((st, i) => {
                      const classes = props.classNamesByStudentId[st.id] ?? [];
                      return (
                        <Table.Tr key={st.id}>
                          <Table.Td>
                            <Checkbox
                              aria-label={`Select ${displayName(st)}`}
                              checked={selectedActive.has(st.id)}
                              onChange={(e) => toggleActive(st.id, e.currentTarget.checked)}
                            />
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" c="dimmed" ff="monospace">
                              {i + 1}
                            </Text>
                          </Table.Td>
                          {showSchool ? (
                            <Table.Td maw={180}>
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
                            <Text size="sm">
                              {classes.length ? [...classes].sort((a, b) => a.localeCompare(b)).join(", ") : "—"}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </TableScrollContainer>
            </>
          )}
        </Stack>
      </Paper>

      <Paper withBorder shadow="sm" p={{ base: "md", lg: "xl" }} radius="lg">
        <Stack gap="md">
          <div>
            <Title order={2} size="h5">
              Recently removed
            </Title>
            <Text size="xs" c="dimmed" mt={6}>
              Restore a learner to the active roster while the 7-day window is open. After that, the record stays hidden
              from normal lists (contact your administrator if you need history).
            </Text>
          </div>

          {props.recoverable.length === 0 ? (
            <Text size="sm" c="dimmed">
              No students in the recovery window.
            </Text>
          ) : (
            <>
              <Group justify="flex-end">
                <Button
                  color="blue"
                  disabled={selectedRecover.size === 0 || pending}
                  loading={pending}
                  onClick={runRestore}
                >
                  Restore selected
                </Button>
              </Group>
              <TableScrollContainer minWidth={showSchool ? 920 : 800}>
                <Table striped highlightOnHover withTableBorder withColumnBorders verticalSpacing="sm" horizontalSpacing="md">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: 40 }}>
                        <Checkbox
                          aria-label="Select all recoverable"
                          checked={allRecoverIds.length > 0 && selectedRecover.size === allRecoverIds.length}
                          indeterminate={selectedRecover.size > 0 && selectedRecover.size < allRecoverIds.length}
                          onChange={(e) => selectAllRecover(e.currentTarget.checked)}
                        />
                      </Table.Th>
                      <Table.Th style={{ width: 40 }}>#</Table.Th>
                      {showSchool ? <Table.Th>School</Table.Th> : null}
                      <Table.Th>Student</Table.Th>
                      <Table.Th>Removed</Table.Th>
                      <Table.Th>Classes</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {props.recoverable.map((st, i) => {
                      const classes = props.classNamesByStudentId[st.id] ?? [];
                      let removedLabel = "—";
                      try {
                        removedLabel = format(parseISO(st.deletedAtIso), "d MMM yyyy HH:mm");
                      } catch {
                        removedLabel = st.deletedAtIso;
                      }
                      return (
                        <Table.Tr key={st.id}>
                          <Table.Td>
                            <Checkbox
                              aria-label={`Select restore ${displayName(st)}`}
                              checked={selectedRecover.has(st.id)}
                              onChange={(e) => toggleRecover(st.id, e.currentTarget.checked)}
                            />
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" c="dimmed" ff="monospace">
                              {i + 1}
                            </Text>
                          </Table.Td>
                          {showSchool ? (
                            <Table.Td maw={180}>
                              <Text size="sm">{st.schoolName?.trim() || "—"}</Text>
                            </Table.Td>
                          ) : null}
                          <Table.Td>
                            <Text size="sm" fw={500}>
                              {displayName(st)}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" ff="monospace">
                              {removedLabel}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">
                              {classes.length ? [...classes].sort((a, b) => a.localeCompare(b)).join(", ") : "—"}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </TableScrollContainer>
            </>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
