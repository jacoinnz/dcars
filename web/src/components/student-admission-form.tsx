"use client";

import { useActionState } from "react";
import {
  Alert,
  Button,
  Code,
  Divider,
  NativeSelect,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import type { StudentAdmissionState } from "@/app/evaluations/actions";
import { submitStudentAdmission } from "@/app/evaluations/actions";

function fe(fieldErrors: Record<string, string[]> | undefined, key: string) {
  return fieldErrors?.[key]?.join(" ");
}

const GENDER_OPTIONS = [
  { value: "", label: "Select…", disabled: true },
  { value: "Female", label: "Female" },
  { value: "Male", label: "Male" },
  { value: "Non-binary", label: "Non-binary" },
  { value: "Prefer not to say", label: "Prefer not to say" },
  { value: "Other", label: "Other" },
];

export function StudentAdmissionForm(props: {
  institutionId: string;
  schoolName: string;
  defaultAdmissionDate: string;
}) {
  const [state, formAction, pending] = useActionState(
    submitStudentAdmission,
    undefined as StudentAdmissionState | undefined,
  );

  const fieldErrors = state?.ok === false ? state.fieldErrors : undefined;

  return (
    <Paper
      component="form"
      action={formAction}
      withBorder
      shadow="sm"
      p={{ base: "md", sm: "xl" }}
      radius="lg"
    >
      <input type="hidden" name="institutionId" value={props.institutionId} />

      <Stack gap="xl">
        <Stack gap={6}>
          <Title order={2} size="h4" fw={600}>
            New student admission
          </Title>
          <Text size="sm" c="dimmed" maw={640} lh={1.6}>
            Complete the learner profile for <Text span fw={600} c="dark.7">{props.schoolName}</Text>.
            Required fields are marked with an asterisk; other fields support records and family contact.
          </Text>
        </Stack>

        {state?.ok ? (
          <Alert color="green" title="Saved" variant="light">
            <Text size="sm">{state.message}</Text>
            {state.studentId ? (
              <Code block mt="sm" style={{ wordBreak: "break-all" }}>
                Student ID: {state.studentId}
              </Code>
            ) : null}
          </Alert>
        ) : null}

        {!state?.ok && state?.message ? (
          <Alert color="yellow" title="Could not save" variant="light">
            {state.message}
          </Alert>
        ) : null}

        <Stack gap="md">
          <Title order={3} size="sm" fw={600} c="dark.7">
            Admission & identity
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              name="admissionDate"
              type="date"
              label="Admission date"
              defaultValue={props.defaultAdmissionDate}
              error={fe(fieldErrors, "admissionDate")}
            />
            <TextInput
              name="admissionNumber"
              label="Admission / roll number"
              placeholder="e.g. 2026-0142"
              autoComplete="off"
              error={fe(fieldErrors, "admissionNumber")}
            />
          </SimpleGrid>
        </Stack>

        <Divider />

        <Stack gap="md">
          <Title order={3} size="sm" fw={600} c="dark.7">
            Student name
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <TextInput
              name="firstName"
              label="First name"
              required
              autoComplete="given-name"
              error={fe(fieldErrors, "firstName")}
            />
            <TextInput
              name="middleName"
              label="Middle name"
              placeholder="Optional"
              autoComplete="additional-name"
              error={fe(fieldErrors, "middleName")}
            />
            <TextInput
              name="lastName"
              label="Last name"
              required
              autoComplete="family-name"
              error={fe(fieldErrors, "lastName")}
            />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <TextInput
              name="dateOfBirth"
              type="date"
              label="Date of birth"
              error={fe(fieldErrors, "dateOfBirth")}
            />
            <NativeSelect
              name="gender"
              label="Gender"
              data={GENDER_OPTIONS}
              defaultValue=""
              error={fe(fieldErrors, "gender")}
            />
            <TextInput
              name="bloodGroup"
              label="Blood group"
              placeholder="e.g. O+"
              error={fe(fieldErrors, "bloodGroup")}
            />
          </SimpleGrid>
        </Stack>

        <Divider />

        <Stack gap="md">
          <Title order={3} size="sm" fw={600} c="dark.7">
            Contact & address
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              name="email"
              type="email"
              label="Student email"
              autoComplete="email"
              error={fe(fieldErrors, "email")}
            />
            <TextInput
              name="phone"
              type="tel"
              inputMode="tel"
              label="Student phone"
              autoComplete="tel"
              error={fe(fieldErrors, "phone")}
            />
          </SimpleGrid>
          <Textarea
            name="address"
            label="Address"
            placeholder="Street, town, postcode"
            rows={3}
            autoComplete="street-address"
            error={fe(fieldErrors, "address")}
          />
        </Stack>

        <Divider />

        <Stack gap="md">
          <Title order={3} size="sm" fw={600} c="dark.7">
            Parent & guardian
          </Title>
          <Text size="sm" c="dimmed" maw={640}>
            Contact details for parents and, if applicable, a local guardian (same structure as typical school
            admission forms).
          </Text>

          <Paper withBorder p="md" radius="md" bg="gray.0">
            <Stack gap="md">
              <Text size="xs" fw={700} tt="uppercase" c="dimmed" lts={0.5}>
                Father
              </Text>
              <TextInput
                name="fatherName"
                label="Full name"
                autoComplete="section-father name"
                error={fe(fieldErrors, "fatherName")}
              />
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <TextInput
                  name="fatherOccupation"
                  label="Occupation"
                  error={fe(fieldErrors, "fatherOccupation")}
                />
                <TextInput
                  name="fatherPhone"
                  type="tel"
                  inputMode="tel"
                  label="Phone"
                  autoComplete="section-father tel"
                  error={fe(fieldErrors, "fatherPhone")}
                />
              </SimpleGrid>
              <TextInput
                name="fatherEmail"
                type="email"
                label="Email"
                autoComplete="section-father email"
                error={fe(fieldErrors, "fatherEmail")}
              />
            </Stack>
          </Paper>

          <Paper withBorder p="md" radius="md" bg="gray.0">
            <Stack gap="md">
              <Text size="xs" fw={700} tt="uppercase" c="dimmed" lts={0.5}>
                Mother
              </Text>
              <TextInput
                name="motherName"
                label="Full name"
                autoComplete="section-mother name"
                error={fe(fieldErrors, "motherName")}
              />
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <TextInput
                  name="motherOccupation"
                  label="Occupation"
                  error={fe(fieldErrors, "motherOccupation")}
                />
                <TextInput
                  name="motherPhone"
                  type="tel"
                  inputMode="tel"
                  label="Phone"
                  autoComplete="section-mother tel"
                  error={fe(fieldErrors, "motherPhone")}
                />
              </SimpleGrid>
              <TextInput
                name="motherEmail"
                type="email"
                label="Email"
                autoComplete="section-mother email"
                error={fe(fieldErrors, "motherEmail")}
              />
            </Stack>
          </Paper>

          <Paper withBorder p="md" radius="md" bg="gray.0">
            <Stack gap="sm">
              <Text size="xs" fw={700} tt="uppercase" c="dimmed" lts={0.5}>
                Guardian / local contact
              </Text>
              <Text size="xs" c="dimmed">
                When someone other than the parents is the primary contact (e.g. grandparent, foster carer).
              </Text>
              <Stack gap="md">
                <TextInput name="guardianName" label="Guardian name" error={fe(fieldErrors, "guardianName")} />
                <TextInput
                  name="guardianRelationship"
                  label="Relationship to student"
                  placeholder="e.g. Grandmother, uncle"
                  error={fe(fieldErrors, "guardianRelationship")}
                />
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <TextInput
                    name="guardianPhone"
                    type="tel"
                    inputMode="tel"
                    label="Phone"
                    error={fe(fieldErrors, "guardianPhone")}
                  />
                  <TextInput
                    name="guardianEmail"
                    type="email"
                    label="Email"
                    error={fe(fieldErrors, "guardianEmail")}
                  />
                </SimpleGrid>
              </Stack>
            </Stack>
          </Paper>
        </Stack>

        <Divider />

        <Stack gap="md">
          <Title order={3} size="sm" fw={600} c="dark.7">
            Documents & references
          </Title>
          <Text size="sm" c="dimmed">
            Record document details supplied at admission. File uploads are not stored here yet — use this as a
            checklist and reference log.
          </Text>
          <Stack gap="md">
            <TextInput
              name="documentBirthCert"
              label="Birth certificate"
              placeholder="Registration number, authority, or date issued"
              error={fe(fieldErrors, "documentBirthCert")}
            />
            <TextInput
              name="documentNationalId"
              label="National ID / passport"
              placeholder="Document number and type"
              error={fe(fieldErrors, "documentNationalId")}
            />
            <TextInput
              name="documentTransferCert"
              label="Transfer / leaving certificate"
              placeholder="Reference from previous school (if applicable)"
              error={fe(fieldErrors, "documentTransferCert")}
            />
            <Textarea
              name="documentMedicalImmunization"
              label="Medical / immunization"
              placeholder="Health card ref, immunization summary, or clinic note"
              rows={2}
              error={fe(fieldErrors, "documentMedicalImmunization")}
            />
            <Textarea
              name="documentOtherNotes"
              label="Other documents"
              placeholder="Custody order, sponsorship letter, etc."
              rows={2}
              error={fe(fieldErrors, "documentOtherNotes")}
            />
          </Stack>
        </Stack>

        <Divider />

        <Stack gap="md">
          <Title order={3} size="sm" fw={600} c="dark.7">
            Education & previous school
          </Title>
          <Text size="sm" c="dimmed">
            If the learner is transferring from another institution, capture the last school&apos;s details.
          </Text>
          <Paper withBorder p="md" radius="md" bg="gray.0">
            <Stack gap="md">
              <Text size="xs" fw={700} tt="uppercase" c="dimmed" lts={0.5}>
                Previous school
              </Text>
              <TextInput
                name="previousSchool"
                label="School name"
                placeholder="Full name of the last school or college"
                error={fe(fieldErrors, "previousSchool")}
              />
              <Textarea
                name="previousSchoolAddress"
                label="School address"
                placeholder="Town, region, postcode / country"
                rows={2}
                error={fe(fieldErrors, "previousSchoolAddress")}
              />
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <TextInput
                  name="previousSchoolClassOrGrade"
                  label="Last class / grade / year"
                  placeholder="e.g. Year 9, Grade 7"
                  error={fe(fieldErrors, "previousSchoolClassOrGrade")}
                />
                <TextInput
                  name="previousSchoolDateLeft"
                  type="date"
                  label="Date left school"
                  error={fe(fieldErrors, "previousSchoolDateLeft")}
                />
              </SimpleGrid>
              <Textarea
                name="previousSchoolLeavingReason"
                label="Reason for leaving / transfer"
                rows={2}
                error={fe(fieldErrors, "previousSchoolLeavingReason")}
              />
            </Stack>
          </Paper>
          <Textarea
            name="admissionNotes"
            label="General admission notes"
            placeholder="Medical alerts, learning needs, or other notes."
            rows={3}
            error={fe(fieldErrors, "admissionNotes")}
          />
        </Stack>

        <Button type="submit" fullWidth size="md" color="teal" loading={pending} mt="xs">
          Submit admission
        </Button>
      </Stack>
    </Paper>
  );
}
