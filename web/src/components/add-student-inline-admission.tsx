"use client";

import { format } from "date-fns";
import { Alert, NativeSelect, Stack, Text } from "@mantine/core";
import { useMemo, useState } from "react";
import { StudentAdmissionForm } from "@/components/student-admission-form";

function formatAcademicYearLabel(d = new Date()): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const start = m >= 4 ? y : y - 1;
  return `${start}–${start + 1}`;
}

export type AddStudentInlineSchoolRow = { id: string; name: string; siteName: string };

/**
 * Full tabbed admission form on the Students hub. Class names are not loaded here (use free-text class field);
 * use the school workspace for a class dropdown when that data is wired.
 */
export function AddStudentInlineAdmission(props: { schoolRows: AddStudentInlineSchoolRow[] }) {
  const [institutionId, setInstitutionId] = useState(() => props.schoolRows[0]?.id ?? "");

  const selected = useMemo(
    () => props.schoolRows.find((s) => s.id === institutionId),
    [props.schoolRows, institutionId],
  );

  const today = format(new Date(), "yyyy-MM-dd");
  const academicYear = formatAcademicYearLabel(new Date());

  if (props.schoolRows.length === 0) {
    return (
      <Alert color="yellow" title="No school to admit into">
        <Text size="sm">
          No schools are visible for your account. Ask an administrator to assign you to a school, or add one under{" "}
          <strong>Admin → Schools</strong>.
        </Text>
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      {props.schoolRows.length > 1 ? (
        <NativeSelect
          label="School"
          description="Admissions are saved for the selected school."
          data={props.schoolRows.map((s) => ({
            value: s.id,
            label: `${s.name} — ${s.siteName}`,
          }))}
          value={institutionId}
          onChange={(e) => setInstitutionId(e.currentTarget.value)}
        />
      ) : null}

      {selected ? (
        <StudentAdmissionForm
          key={selected.id}
          institutionId={selected.id}
          schoolName={selected.name}
          defaultAdmissionDate={today}
          defaultAcademicYear={academicYear}
          classNames={[]}
        />
      ) : (
        <Alert color="yellow" title="Choose a school">Select a school above to load the admission form.</Alert>
      )}
    </Stack>
  );
}
