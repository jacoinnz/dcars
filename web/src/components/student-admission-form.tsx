"use client";

import { useActionState, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  Code,
  NativeSelect,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Tabs,
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

const ADD_SECTIONS = [
  "personal",
  "parents",
  "documents",
  "previous-school",
  "other",
] as const;

type AddSection = (typeof ADD_SECTIONS)[number];

function isAddSection(v: string | null): v is AddSection {
  return v !== null && (ADD_SECTIONS as readonly string[]).includes(v);
}

export function StudentAdmissionForm(props: {
  institutionId: string;
  schoolName: string;
  defaultAdmissionDate: string;
}) {
  const [state, formAction, pending] = useActionState(
    submitStudentAdmission,
    undefined as StudentAdmissionState | undefined,
  );

  const [addSection, setAddSection] = useState<AddSection>("personal");
  const [secondParent, setSecondParent] = useState(false);

  const fieldErrors = state?.ok === false ? state.fieldErrors : undefined;

  useEffect(() => {
    if (!fieldErrors) return;
    if (fieldErrors.motherName || fieldErrors.motherPhone || fieldErrors.motherEmail) {
      setSecondParent(true);
    }
  }, [fieldErrors]);

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
            Use each tab for the right category; only the selected tab is highlighted. All fields are saved when you
            submit (switch tabs to review before sending).
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

        <Tabs
          value={addSection}
          onChange={(v) => {
            if (v && isAddSection(v)) setAddSection(v);
          }}
          keepMounted
          variant="outline"
        >
          <ScrollArea type="scroll" scrollbars="x" offsetScrollbars>
            <Tabs.List
              style={{
                flexWrap: "nowrap",
                width: "max-content",
                minWidth: "100%",
              }}
            >
              <Tabs.Tab value="personal">Personal Info</Tabs.Tab>
              <Tabs.Tab value="parents">Parents &amp; Guardian Info</Tabs.Tab>
              <Tabs.Tab value="documents">Document Info</Tabs.Tab>
              <Tabs.Tab value="previous-school">Previous School Info</Tabs.Tab>
              <Tabs.Tab value="other">Other Info</Tabs.Tab>
            </Tabs.List>
          </ScrollArea>

          <Tabs.Panel value="personal" pt="md">
            <Stack gap="xl">
              <Text size="sm" c="dimmed" maw={640}>
                This tab is only for the learner: academic details, identity, contact, medical notes, and address.
                Parents and guardians are on the next tab.
              </Text>

              <Stack gap="md">
                <Title order={4} size="sm" fw={700} tt="uppercase" c="dimmed" lts={0.6}>
                  Academic information
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

              <Stack gap="md">
                <Title order={4} size="sm" fw={700} tt="uppercase" c="dimmed" lts={0.6}>
                  Personal information
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

              <Stack gap="md">
                <Title order={4} size="sm" fw={700} tt="uppercase" c="dimmed" lts={0.6}>
                  Contact information
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
              </Stack>

              <Stack gap="md">
                <Title order={4} size="sm" fw={700} tt="uppercase" c="dimmed" lts={0.6}>
                  Medical records
                </Title>
                <Text size="xs" c="dimmed">
                  Immunization, conditions, or clinic references for this learner (not file uploads).
                </Text>
                <Textarea
                  name="documentMedicalImmunization"
                  label="Medical / immunization"
                  placeholder="Health card ref, immunization summary, allergies, or clinic note"
                  rows={4}
                  error={fe(fieldErrors, "documentMedicalImmunization")}
                />
              </Stack>

              <Stack gap="md">
                <Title order={4} size="sm" fw={700} tt="uppercase" c="dimmed" lts={0.6}>
                  Student address
                </Title>
                <Textarea
                  name="address"
                  label="Home address"
                  placeholder="Street, town, postcode"
                  rows={4}
                  autoComplete="street-address"
                  error={fe(fieldErrors, "address")}
                />
              </Stack>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="parents" pt="md">
            <input type="hidden" name="secondParentActive" value={secondParent ? "1" : "0"} />

            <Stack gap="lg">
              <Text size="sm" c="dimmed" maw={640}>
                Only parent and guardian contacts belong here. Use <strong>Parent 1</strong> for the first parent; add a
                second parent if needed — name and at least one contact method are then required for parent 2.
              </Text>

              <Stack gap="xs">
                <Title order={4} size="sm" fw={700} tt="uppercase" c="dimmed" lts={0.6}>
                  Parents
                </Title>

                <Paper withBorder p="md" radius="md" bg="gray.0">
                  <Stack gap="md">
                    <Text size="sm" fw={600}>
                      Parent 1
                    </Text>
                    <TextInput
                      name="fatherName"
                      label="Full name"
                      autoComplete="section-parent1 name"
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
                        autoComplete="tel"
                        error={fe(fieldErrors, "fatherPhone")}
                      />
                    </SimpleGrid>
                    <TextInput
                      name="fatherEmail"
                      type="email"
                      label="Email"
                      autoComplete="email"
                      error={fe(fieldErrors, "fatherEmail")}
                    />
                  </Stack>
                </Paper>

                <Checkbox
                  label="Include second parent"
                  description="Turn on to enter Parent 2. Those fields become required."
                  checked={secondParent}
                  onChange={(e) => setSecondParent(e.currentTarget.checked)}
                />

                {secondParent ? (
                  <Paper withBorder p="md" radius="md" bg="gray.0">
                    <Stack gap="md">
                      <Text size="sm" fw={600}>
                        Parent 2
                      </Text>
                      <TextInput
                        name="motherName"
                        label="Full name"
                        required={secondParent}
                        autoComplete="section-parent2 name"
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
                          autoComplete="tel"
                          error={fe(fieldErrors, "motherPhone")}
                        />
                      </SimpleGrid>
                      <TextInput
                        name="motherEmail"
                        type="email"
                        label="Email"
                        autoComplete="email"
                        error={fe(fieldErrors, "motherEmail")}
                      />
                    </Stack>
                  </Paper>
                ) : null}
              </Stack>

              <Stack gap="md">
                <Title order={4} size="sm" fw={700} tt="uppercase" c="dimmed" lts={0.6}>
                  Guardian
                </Title>
                <Paper withBorder p="md" radius="md" bg="gray.0">
                  <Stack gap="sm">
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
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="documents" pt="md">
            <Stack gap="xl">
              <Text size="sm" c="dimmed" maw={640}>
                This tab is only for <strong>document references</strong> (numbers, issuing authority, dates). It does
                not include medical notes, address, or previous-school narrative — those belong in their own tabs.
              </Text>

              <Stack gap="md">
                <Title order={4} size="sm" fw={700} tt="uppercase" c="dimmed" lts={0.6}>
                  Birth &amp; identity papers
                </Title>
                <TextInput
                  name="documentBirthCert"
                  label="Birth certificate"
                  placeholder="Registration number, issuing authority, date issued"
                  error={fe(fieldErrors, "documentBirthCert")}
                />
                <TextInput
                  name="documentNationalId"
                  label="National ID / passport"
                  placeholder="Document number and document type"
                  error={fe(fieldErrors, "documentNationalId")}
                />
              </Stack>

              <Stack gap="md">
                <Title order={4} size="sm" fw={700} tt="uppercase" c="dimmed" lts={0.6}>
                  Transfer / leaving certificate
                </Title>
                <TextInput
                  name="documentTransferCert"
                  label="Certificate reference"
                  placeholder="Certificate no., authority, or date (proof of transfer)"
                  error={fe(fieldErrors, "documentTransferCert")}
                />
              </Stack>

              <Stack gap="md">
                <Title order={4} size="sm" fw={700} tt="uppercase" c="dimmed" lts={0.6}>
                  Other supporting documents
                </Title>
                <Textarea
                  name="documentOtherNotes"
                  label="Other documents (references only)"
                  placeholder="e.g. custody order ref., sponsorship letter ref., court order number"
                  rows={3}
                  error={fe(fieldErrors, "documentOtherNotes")}
                />
              </Stack>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="previous-school" pt="md">
            <Stack gap="xl">
              <Text size="sm" c="dimmed" maw={640}>
                This tab is only about the <strong>last institution</strong> the learner attended: identity of that
                school, where it was, what class they were in, when they left, and why. It does{" "}
                <strong>not</strong> include document certificate numbers (those belong under Document Info), learner
                personal details, or parent contacts.
              </Text>

              <Stack gap="md">
                <Title order={4} size="sm" fw={700} tt="uppercase" c="dimmed" lts={0.6}>
                  Institution
                </Title>
                <TextInput
                  name="previousSchool"
                  label="School name"
                  placeholder="Full name of the last school or college"
                  error={fe(fieldErrors, "previousSchool")}
                />
                <Textarea
                  name="previousSchoolAddress"
                  label="School location / address"
                  placeholder="Town, region, postcode / country"
                  rows={3}
                  error={fe(fieldErrors, "previousSchoolAddress")}
                />
              </Stack>

              <Stack gap="md">
                <Title order={4} size="sm" fw={700} tt="uppercase" c="dimmed" lts={0.6}>
                  Class &amp; exit
                </Title>
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
                    label="Date left that school"
                    error={fe(fieldErrors, "previousSchoolDateLeft")}
                  />
                </SimpleGrid>
                <Textarea
                  name="previousSchoolLeavingReason"
                  label="Reason for leaving / transfer"
                  placeholder="Why the learner left or moved (narrative for this school only)"
                  rows={3}
                  error={fe(fieldErrors, "previousSchoolLeavingReason")}
                />
              </Stack>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="other" pt="md">
            <Stack gap="lg">
              <Text size="sm" c="dimmed" maw={640}>
                This tab is only for <strong>free-text notes</strong> that genuinely do not fit Personal, Parents,
                Document, or Previous School. Do not repeat structured fields from those tabs. Do not use this for
                certificate numbers, ID refs, or the learner&apos;s medical record — those belong in Document Info and
                Personal → Medical records respectively.
              </Text>
              <Textarea
                name="admissionNotes"
                label="Other admission notes (catch-all)"
                placeholder="e.g. learning support summary, pastoral handover, timing of move, anything unstructured not captured above"
                rows={6}
                error={fe(fieldErrors, "admissionNotes")}
              />
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Button type="submit" fullWidth size="md" color="teal" loading={pending} mt="xs">
          Submit admission
        </Button>
      </Stack>
    </Paper>
  );
}
