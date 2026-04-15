"use client";

import { Stack, Text } from "@mantine/core";
import { AddStudentInlineAdmission } from "@/components/add-student-inline-admission";

export type StudentsInfoSchoolRow = { id: string; name: string; siteName: string };

export function StudentsInfoTabs(props: { schoolRows: StudentsInfoSchoolRow[] }) {
  return (
    <Stack gap="sm" style={{ width: "100%" }}>
      <AddStudentInlineAdmission schoolRows={props.schoolRows} />
    </Stack>
  );
}
