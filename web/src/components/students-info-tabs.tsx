"use client";

import { Stack, Text } from "@mantine/core";
import { AddStudentInlineAdmission } from "@/components/add-student-inline-admission";

export type StudentsInfoSchoolRow = { id: string; name: string; siteName: string };

export function StudentsInfoTabs(props: { schoolRows: StudentsInfoSchoolRow[] }) {
  return (
    <Stack gap="sm" style={{ width: "100%" }}>
      <Text size="sm" fw={600}>
        New student admission
      </Text>
      <Text size="xs" c="dimmed" lh={1.55} maw={900}>
        Complete the learner profile below. All fields are saved when you submit.
      </Text>
      <AddStudentInlineAdmission schoolRows={props.schoolRows} />
    </Stack>
  );
}
