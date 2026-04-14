"use client";

import { useTransition } from "react";
import { Alert, Checkbox, Table, Text } from "@mantine/core";
import { setStudentEnrollment } from "@/app/evaluations/actions";

type Student = { id: string; firstName: string; lastName: string };
type ClassRow = { id: string; name: string };

export function StudentClassMatrix(props: {
  students: Student[];
  classes: ClassRow[];
  enrolled: { studentId: string; classId: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const key = (sid: string, cid: string) => `${sid}:${cid}`;
  const set = new Set(props.enrolled.map((e) => key(e.studentId, e.classId)));

  function toggle(studentId: string, classId: string, next: boolean) {
    startTransition(async () => {
      await setStudentEnrollment(studentId, classId, next);
    });
  }

  if (props.classes.length === 0) {
    return (
      <Alert color="yellow" title="No classes yet" variant="light">
        <Text size="sm">Add classes for this school in Admin → Schools first.</Text>
      </Alert>
    );
  }

  return (
    <>
      <Table.ScrollContainer minWidth={480}>
        <Table striped highlightOnHover withTableBorder withColumnBorders verticalSpacing="sm" horizontalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Student</Table.Th>
              {props.classes.map((c) => (
                <Table.Th key={c.id} ta="center" maw={120}>
                  <Text size="xs" fw={600} lineClamp={2}>
                    {c.name}
                  </Text>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {props.students.map((s) => (
              <Table.Tr key={s.id}>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {s.firstName} {s.lastName}
                  </Text>
                </Table.Td>
                {props.classes.map((c) => {
                  const on = set.has(key(s.id, c.id));
                  return (
                    <Table.Td key={c.id} ta="center">
                      <Checkbox
                        checked={on}
                        disabled={pending}
                        onChange={(e) => toggle(s.id, c.id, e.currentTarget.checked)}
                        aria-label={`${s.firstName} ${s.lastName} in ${c.name}`}
                      />
                    </Table.Td>
                  );
                })}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      {pending ? (
        <Text size="xs" c="dimmed" mt="xs">
          Saving…
        </Text>
      ) : null}
    </>
  );
}
