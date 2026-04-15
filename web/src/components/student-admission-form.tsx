"use client";

import { useActionState, useState } from "react";
import {
  Alert,
  Button,
  Code,
  Divider,
  FileButton,
  Group,
  Input,
  NativeSelect,
  Paper,
  Radio,
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
  { value: "", label: "Gender", disabled: true },
  { value: "Female", label: "Female" },
  { value: "Male", label: "Male" },
  { value: "Non-binary", label: "Non-binary" },
  { value: "Prefer not to say", label: "Prefer not to say" },
  { value: "Other", label: "Other" },
];

const BLOOD_GROUP_OPTIONS = [
  { value: "", label: "Blood group", disabled: true },
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
  { value: "Unknown", label: "Unknown" },
];

function formatAcademicYearLabel(d = new Date()): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const start = m >= 4 ? y : y - 1;
  return `${start}–${start + 1}`;
}

function academicYearSelectData(centerLabel: string) {
  const m = centerLabel.match(/^(\d{4})/);
  const centerStart = m ? Number.parseInt(m[1]!, 10) : new Date().getFullYear();
  const opts: { value: string; label: string }[] = [];
  for (let i = -2; i <= 3; i++) {
    const s = centerStart + i;
    opts.push({ value: `${s}–${s + 1}`, label: `${s}–${s + 1}` });
  }
  return [{ value: "", label: "Academic year", disabled: true }, ...opts];
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Title order={4} size="sm" fw={700} tt="uppercase" c="blue.7" lts={0.5}>
      {children}
    </Title>
  );
}

const DOC_FIELD_LABEL_PROPS = { style: { textTransform: "uppercase" as const }, size: "xs" as const };

/** Placeholder lists until route/dorm masters exist; extend per school as needed. */
const OTHER_ROUTE_OPTIONS = [
  { value: "", label: "Route list", disabled: true },
  { value: "Not applicable", label: "Not applicable" },
  { value: "Morning route — contact transport", label: "Morning route — contact transport" },
  { value: "Afternoon route — contact transport", label: "Afternoon route — contact transport" },
];

const OTHER_VEHICLE_OPTIONS = [
  { value: "", label: "Vehicle number", disabled: true },
  { value: "Not applicable", label: "Not applicable" },
  { value: "To be assigned", label: "To be assigned" },
];

const OTHER_DORMITORY_OPTIONS = [
  { value: "", label: "Dormitory name", disabled: true },
  { value: "Not in dormitory", label: "Not in dormitory" },
  { value: "Boarding / hostel", label: "Boarding / hostel" },
];

const OTHER_ROOM_OPTIONS = [
  { value: "", label: "Room number", disabled: true },
  { value: "N/A", label: "N/A" },
  { value: "To be assigned", label: "To be assigned" },
];

function DocumentAttachmentSlot(props: {
  slotLabel: string;
  titleName: string;
  urlName: string;
  fieldErrors?: Record<string, string[]>;
}) {
  const titleErr = fe(props.fieldErrors, props.titleName);
  const urlErr = fe(props.fieldErrors, props.urlName);
  return (
    <Stack gap="xs">
      <TextInput
        type="text"
        name={props.titleName}
        label={`Document ${props.slotLabel} title`}
        labelProps={DOC_FIELD_LABEL_PROPS}
        placeholder="Title"
        error={titleErr}
      />
      <Input.Wrapper label="Attachment" error={urlErr}>
        <Group gap="xs" align="flex-end" wrap="nowrap">
          <Text
            fw={600}
            size="sm"
            ta="center"
            py={6}
            px={8}
            bg="gray.1"
            style={{ borderRadius: 4, minWidth: 36 }}
            c="dark.6"
          >
            {props.slotLabel}
          </Text>
          <TextInput
            type="text"
            name={props.urlName}
            placeholder="File URL"
            style={{ flex: 1, minWidth: 0 }}
          />
          <FileButton accept="image/*,application/pdf" onChange={() => undefined}>
            {(btnProps) => (
              <Button {...btnProps} color="violet" variant="filled" size="sm">
                Browse
              </Button>
            )}
          </FileButton>
        </Group>
      </Input.Wrapper>
      <Text size="xs" c="dimmed">
        Paste a public file URL; direct upload is not stored yet.
      </Text>
    </Stack>
  );
}

function PhotoUrlWithBrowse(props: {
  name: string;
  label: string;
  fieldErrors?: Record<string, string[]>;
}) {
  const err = fe(props.fieldErrors, props.name);
  return (
    <Input.Wrapper label={props.label} error={err}>
      <Group gap="xs" align="flex-end" wrap="nowrap">
        <TextInput
          type="text"
          name={props.name}
          placeholder="Photo URL"
          style={{ flex: 1, minWidth: 0 }}
        />
        <FileButton accept="image/png,image/jpeg,image/webp" onChange={() => undefined}>
          {(btnProps) => (
            <Button {...btnProps} color="violet" variant="filled" size="sm">
              Browse
            </Button>
          )}
        </FileButton>
      </Group>
      <Text size="xs" c="dimmed" mt={4}>
        Paste a public HTTPS image URL; file storage is not wired yet.
      </Text>
    </Input.Wrapper>
  );
}

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
  /** Label such as `2025–2026`; used as default academic year. */
  defaultAcademicYear?: string;
  /** When provided, Class is chosen from this list; otherwise Class is free text. */
  classNames?: string[];
}) {
  const classNames = props.classNames ?? [];
  const defaultAcademicYear = props.defaultAcademicYear ?? formatAcademicYearLabel(new Date());
  const academicYearData = academicYearSelectData(defaultAcademicYear);
  const [state, formAction, pending] = useActionState(
    submitStudentAdmission,
    undefined as StudentAdmissionState | undefined,
  );

  const [addSection, setAddSection] = useState<AddSection>("personal");
  const [guardianKind, setGuardianKind] = useState<"father" | "mother" | "other">("other");

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

              <SimpleGrid cols={{ base: 1, md: 2 }} spacing={{ base: "lg", md: "xl" }}>
                <Stack gap="md">
                  <SectionHeading>Academic information</SectionHeading>
                  <NativeSelect
                    name="academicYear"
                    label="Academic year"
                    required
                    data={academicYearData}
                    defaultValue={defaultAcademicYear}
                    error={fe(fieldErrors, "academicYear")}
                  />
                  {classNames.length > 0 ? (
                    <NativeSelect
                      name="admissionClassLabel"
                      label="Class"
                      required
                      data={[
                        { value: "", label: "Class", disabled: true },
                        ...classNames.map((n) => ({ value: n, label: n })),
                      ]}
                      defaultValue=""
                      error={fe(fieldErrors, "admissionClassLabel")}
                    />
                  ) : (
                    <TextInput
                      name="admissionClassLabel"
                      label="Class"
                      placeholder="e.g. Grade 9"
                      required
                      autoComplete="off"
                      error={fe(fieldErrors, "admissionClassLabel")}
                    />
                  )}
                  <TextInput
                    name="admissionSectionLabel"
                    label="Section"
                    placeholder="e.g. A"
                    required
                    autoComplete="off"
                    error={fe(fieldErrors, "admissionSectionLabel")}
                  />
                  <TextInput
                    name="admissionNumber"
                    label="Admission number"
                    placeholder="e.g. 900031"
                    autoComplete="off"
                    error={fe(fieldErrors, "admissionNumber")}
                  />
                  <TextInput
                    name="admissionDate"
                    type="date"
                    label="Admission date"
                    defaultValue={props.defaultAdmissionDate}
                    error={fe(fieldErrors, "admissionDate")}
                  />
                  <TextInput
                    name="rollNumber"
                    label="Roll"
                    placeholder="Optional"
                    autoComplete="off"
                    error={fe(fieldErrors, "rollNumber")}
                  />
                  <TextInput
                    name="studentGroup"
                    label="Group"
                    placeholder="Optional"
                    autoComplete="off"
                    error={fe(fieldErrors, "studentGroup")}
                  />
                </Stack>

                <Stack gap="md">
                  <SectionHeading>Personal information</SectionHeading>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput
                      name="firstName"
                      label="First name"
                      required
                      autoComplete="given-name"
                      error={fe(fieldErrors, "firstName")}
                    />
                    <TextInput
                      name="lastName"
                      label="Last name"
                      required
                      autoComplete="family-name"
                      error={fe(fieldErrors, "lastName")}
                    />
                  </SimpleGrid>
                  <TextInput
                    name="middleName"
                    label="Middle name"
                    placeholder="Optional"
                    autoComplete="additional-name"
                    error={fe(fieldErrors, "middleName")}
                  />
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <NativeSelect
                      name="gender"
                      label="Gender"
                      required
                      data={GENDER_OPTIONS}
                      defaultValue=""
                      error={fe(fieldErrors, "gender")}
                    />
                    <TextInput
                      name="dateOfBirth"
                      type="date"
                      label="Date of birth"
                      error={fe(fieldErrors, "dateOfBirth")}
                    />
                  </SimpleGrid>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput
                      name="religion"
                      label="Religion"
                      placeholder="Optional"
                      error={fe(fieldErrors, "religion")}
                    />
                    <TextInput
                      name="caste"
                      label="Caste"
                      placeholder="Optional"
                      error={fe(fieldErrors, "caste")}
                    />
                  </SimpleGrid>
                  <TextInput
                    name="photoUrl"
                    type="text"
                    label="Student photo URL"
                    placeholder="https://… (optional)"
                    autoComplete="off"
                    error={fe(fieldErrors, "photoUrl")}
                  />
                </Stack>
              </SimpleGrid>

              <Stack gap="md">
                <SectionHeading>Contact information</SectionHeading>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <TextInput
                    name="email"
                    type="email"
                    label="Email address"
                    autoComplete="email"
                    error={fe(fieldErrors, "email")}
                  />
                  <TextInput
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    label="Phone number"
                    required
                    autoComplete="tel"
                    error={fe(fieldErrors, "phone")}
                  />
                </SimpleGrid>
              </Stack>

              <Stack gap="md">
                <SectionHeading>Student address info</SectionHeading>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <Textarea
                    name="currentAddress"
                    label="Current address"
                    placeholder="Street, town, postcode"
                    rows={4}
                    autoComplete="street-address"
                    error={fe(fieldErrors, "currentAddress")}
                  />
                  <Textarea
                    name="permanentAddress"
                    label="Permanent address"
                    placeholder="Street, town, postcode"
                    rows={4}
                    error={fe(fieldErrors, "permanentAddress")}
                  />
                </SimpleGrid>
              </Stack>

              <Stack gap="md">
                <SectionHeading>Medical record</SectionHeading>
                <Text size="xs" c="dimmed">
                  Vitals and blood type; use the notes field for immunization, allergies, or clinic references (not file
                  uploads).
                </Text>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <NativeSelect
                    name="bloodGroup"
                    label="Blood group"
                    data={BLOOD_GROUP_OPTIONS}
                    defaultValue=""
                    error={fe(fieldErrors, "bloodGroup")}
                  />
                  <TextInput
                    name="medicalCategory"
                    label="Category"
                    placeholder="e.g. General / quota category"
                    error={fe(fieldErrors, "medicalCategory")}
                  />
                </SimpleGrid>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <TextInput
                    name="heightIn"
                    label="Height (in)"
                    placeholder="e.g. 65"
                    error={fe(fieldErrors, "heightIn")}
                  />
                  <TextInput
                    name="weightKg"
                    label="Weight (kg)"
                    placeholder="e.g. 48"
                    error={fe(fieldErrors, "weightKg")}
                  />
                </SimpleGrid>
                <Textarea
                  name="documentMedicalImmunization"
                  label="Medical / immunization notes"
                  placeholder="Health card ref, immunization summary, allergies, or clinic note"
                  rows={4}
                  error={fe(fieldErrors, "documentMedicalImmunization")}
                />
              </Stack>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="parents" pt="md">
            <input type="hidden" name="guardianRelationKind" value={guardianKind} />

            <Stack gap="lg">
              <Text size="sm" c="dimmed" maw={720} lh={1.65}>
                Father is required; mother and guardian details are optional. Match your school MIS: parents on the left,
                guardian contact on the right. Photo fields accept a public image URL for now (browse is a placeholder
                until uploads are enabled).
              </Text>

              <SimpleGrid cols={{ base: 1, md: 2 }} spacing={{ base: "lg", md: "xl" }}>
                <Stack gap="xl">
                  <Stack gap="md">
                    <SectionHeading>Fathers info</SectionHeading>
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                      <TextInput
                        name="fatherName"
                        label="Father name"
                        required
                        autoComplete="section-parent father name"
                        error={fe(fieldErrors, "fatherName")}
                      />
                      <TextInput
                        name="fatherOccupation"
                        label="Occupation"
                        error={fe(fieldErrors, "fatherOccupation")}
                      />
                      <TextInput
                        name="fatherPhone"
                        type="tel"
                        inputMode="tel"
                        label="Father phone"
                        autoComplete="tel"
                        error={fe(fieldErrors, "fatherPhone")}
                      />
                      <PhotoUrlWithBrowse
                        name="fatherPhotoUrl"
                        label="Father's photo"
                        fieldErrors={fieldErrors}
                      />
                    </SimpleGrid>
                    <TextInput
                      name="fatherEmail"
                      type="email"
                      label="Father email"
                      placeholder="Optional"
                      autoComplete="email"
                      error={fe(fieldErrors, "fatherEmail")}
                    />
                  </Stack>

                  <Stack gap="md">
                    <SectionHeading>Mother info</SectionHeading>
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                      <TextInput
                        name="motherName"
                        label="Mother name"
                        autoComplete="section-parent mother name"
                        error={fe(fieldErrors, "motherName")}
                      />
                      <TextInput
                        name="motherOccupation"
                        label="Occupation"
                        error={fe(fieldErrors, "motherOccupation")}
                      />
                      <TextInput
                        name="motherPhone"
                        type="tel"
                        inputMode="tel"
                        label="Mother phone"
                        autoComplete="tel"
                        error={fe(fieldErrors, "motherPhone")}
                      />
                      <PhotoUrlWithBrowse
                        name="motherPhotoUrl"
                        label="Mother's photo"
                        fieldErrors={fieldErrors}
                      />
                    </SimpleGrid>
                    <TextInput
                      name="motherEmail"
                      type="email"
                      label="Mother email"
                      placeholder="Optional"
                      autoComplete="email"
                      error={fe(fieldErrors, "motherEmail")}
                    />
                  </Stack>
                </Stack>

                <Stack gap="md">
                  <SectionHeading>Guardian info</SectionHeading>
                  <Radio.Group
                    label="Relation with guardian"
                    value={guardianKind}
                    onChange={(v) => setGuardianKind(v as "father" | "mother" | "other")}
                  >
                    <Group gap="lg" mt={6}>
                      <Radio value="father" label="Father" color="violet" />
                      <Radio value="mother" label="Mother" color="violet" />
                      <Radio value="other" label="Others" color="violet" />
                    </Group>
                  </Radio.Group>
                  {guardianKind === "other" ? (
                    <TextInput
                      name="guardianRelationship"
                      label="Relation with guardian"
                      placeholder="e.g. Grandmother, uncle"
                      error={fe(fieldErrors, "guardianRelationship")}
                    />
                  ) : null}
                  <TextInput name="guardianName" label="Guardian name" error={fe(fieldErrors, "guardianName")} />
                  <TextInput
                    name="guardianEmail"
                    type="email"
                    label="Guardian email"
                    autoComplete="email"
                    error={fe(fieldErrors, "guardianEmail")}
                  />
                  <PhotoUrlWithBrowse
                    name="guardianPhotoUrl"
                    label="Guardian photo"
                    fieldErrors={fieldErrors}
                  />
                  <TextInput
                    name="guardianPhone"
                    type="tel"
                    inputMode="tel"
                    label="Guardian phone"
                    autoComplete="tel"
                    error={fe(fieldErrors, "guardianPhone")}
                  />
                  <TextInput
                    name="guardianOccupation"
                    label="Guardian occupation"
                    error={fe(fieldErrors, "guardianOccupation")}
                  />
                  <TextInput
                    name="guardianAddress"
                    label="Guardian address"
                    error={fe(fieldErrors, "guardianAddress")}
                  />
                </Stack>
              </SimpleGrid>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="documents" pt="md">
            <Stack gap="xl">
              <Text size="sm" c="dimmed" maw={720} lh={1.65}>
                Identity references, bank details for fees, and up to four attachment titles with file URLs. Medical
                notes stay on Personal; previous-school narrative is on the next tab.
              </Text>

              <SimpleGrid cols={{ base: 1, lg: 2 }} spacing={{ base: "lg", lg: "xl" }}>
                <Stack gap="md">
                  <SectionHeading>Document info</SectionHeading>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput
                      name="documentNationalId"
                      label="National ID card"
                      labelProps={DOC_FIELD_LABEL_PROPS}
                      placeholder="Document number"
                      error={fe(fieldErrors, "documentNationalId")}
                    />
                    <TextInput
                      name="documentBirthCert"
                      label="Birth certificate number"
                      labelProps={DOC_FIELD_LABEL_PROPS}
                      placeholder="Registration number"
                      error={fe(fieldErrors, "documentBirthCert")}
                    />
                  </SimpleGrid>
                  <Textarea
                    name="documentOtherNotes"
                    label="Additional notes"
                    labelProps={DOC_FIELD_LABEL_PROPS}
                    placeholder="Extra document references, custody or sponsorship note refs, etc."
                    rows={4}
                    error={fe(fieldErrors, "documentOtherNotes")}
                  />
                  <TextInput
                    name="documentTransferCert"
                    label="Transfer certificate reference"
                    labelProps={DOC_FIELD_LABEL_PROPS}
                    placeholder="Optional — certificate no. or authority if applicable"
                    error={fe(fieldErrors, "documentTransferCert")}
                  />
                </Stack>

                <Stack gap="md">
                  <SectionHeading>Bank information</SectionHeading>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput
                      name="bankName"
                      label="Bank name"
                      labelProps={DOC_FIELD_LABEL_PROPS}
                      error={fe(fieldErrors, "bankName")}
                    />
                    <TextInput
                      name="bankAccountNumber"
                      label="Bank account number"
                      labelProps={DOC_FIELD_LABEL_PROPS}
                      error={fe(fieldErrors, "bankAccountNumber")}
                    />
                    <TextInput
                      name="bankIfscCode"
                      label="IFSC code"
                      labelProps={DOC_FIELD_LABEL_PROPS}
                      placeholder="e.g. SBIN0001234"
                      error={fe(fieldErrors, "bankIfscCode")}
                    />
                  </SimpleGrid>
                </Stack>
              </SimpleGrid>

              <Divider />

              <Stack gap="md">
                <SectionHeading>Document attachment</SectionHeading>
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
                  <DocumentAttachmentSlot
                    slotLabel="01"
                    titleName="documentAttach1Title"
                    urlName="documentAttach1Url"
                    fieldErrors={fieldErrors}
                  />
                  <DocumentAttachmentSlot
                    slotLabel="02"
                    titleName="documentAttach2Title"
                    urlName="documentAttach2Url"
                    fieldErrors={fieldErrors}
                  />
                  <DocumentAttachmentSlot
                    slotLabel="03"
                    titleName="documentAttach3Title"
                    urlName="documentAttach3Url"
                    fieldErrors={fieldErrors}
                  />
                  <DocumentAttachmentSlot
                    slotLabel="04"
                    titleName="documentAttach4Title"
                    urlName="documentAttach4Url"
                    fieldErrors={fieldErrors}
                  />
                </SimpleGrid>
              </Stack>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="previous-school" pt="md">
            <Stack gap="md">
              <Text size="sm" c="dimmed" maw={720} lh={1.65}>
                One free-text block for the last institution: name, location, class, dates, and reason to move.
                Certificate references belong under <strong>Document Info</strong>.
              </Text>

              <Paper withBorder p={{ base: "md", sm: "lg" }} radius="md" bg="gray.0">
                <Stack gap="sm">
                  <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts={0.6}>
                    Previous school details
                  </Text>
                  <Textarea
                    name="previousSchoolDetails"
                    placeholder="School name, address, last class or grade, dates, reason for leaving…"
                    minRows={12}
                    autosize
                    maxRows={24}
                    error={fe(fieldErrors, "previousSchoolDetails")}
                  />
                </Stack>
              </Paper>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="other" pt="md">
            <Stack gap="lg">
              <Text size="sm" c="dimmed" maw={720} lh={1.65}>
                Transport and boarding picks (eSkooly-style); optional free-text notes below. Dropdown lists are
                placeholders — extend options in code or add masters later. Certificate and medical detail belong in{" "}
                <strong>Document Info</strong> and <strong>Personal</strong>.
              </Text>

              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                <Paper withBorder p={{ base: "md", sm: "lg" }} radius="md" bg="gray.0">
                  <Stack gap="sm">
                    <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts={0.6}>
                      Transport
                    </Text>
                    <Divider />
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                      <NativeSelect
                        name="transportRouteList"
                        label="Route list"
                        labelProps={DOC_FIELD_LABEL_PROPS}
                        data={OTHER_ROUTE_OPTIONS}
                        defaultValue=""
                        error={fe(fieldErrors, "transportRouteList")}
                      />
                      <NativeSelect
                        name="transportVehicleNumber"
                        label="Vehicle number"
                        labelProps={DOC_FIELD_LABEL_PROPS}
                        data={OTHER_VEHICLE_OPTIONS}
                        defaultValue=""
                        error={fe(fieldErrors, "transportVehicleNumber")}
                      />
                    </SimpleGrid>
                  </Stack>
                </Paper>

                <Paper withBorder p={{ base: "md", sm: "lg" }} radius="md" bg="gray.0">
                  <Stack gap="sm">
                    <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts={0.6}>
                      Other info
                    </Text>
                    <Divider />
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                      <NativeSelect
                        name="dormitoryName"
                        label="Dormitory"
                        labelProps={DOC_FIELD_LABEL_PROPS}
                        data={OTHER_DORMITORY_OPTIONS}
                        defaultValue=""
                        error={fe(fieldErrors, "dormitoryName")}
                      />
                      <NativeSelect
                        name="dormitoryRoomNumber"
                        label="Room number"
                        labelProps={DOC_FIELD_LABEL_PROPS}
                        data={OTHER_ROOM_OPTIONS}
                        defaultValue=""
                        error={fe(fieldErrors, "dormitoryRoomNumber")}
                      />
                    </SimpleGrid>
                  </Stack>
                </Paper>
              </SimpleGrid>

              <Paper withBorder p={{ base: "md", sm: "lg" }} radius="md" bg="gray.0">
                <Stack gap="sm">
                  <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts={0.6}>
                    Additional notes
                  </Text>
                  <Divider />
                  <Textarea
                    name="admissionNotes"
                    label="Other admission notes"
                    labelProps={DOC_FIELD_LABEL_PROPS}
                    placeholder="e.g. learning support, pastoral handover, timing, anything not captured above"
                    minRows={5}
                    autosize
                    maxRows={16}
                    error={fe(fieldErrors, "admissionNotes")}
                  />
                </Stack>
              </Paper>
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
