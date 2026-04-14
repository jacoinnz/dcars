"use client";

import { useActionState } from "react";
import {
  Alert,
  Button,
  Code,
  NativeSelect,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import type { ActionState } from "@/app/actions";
import { submitParticipantEntry } from "@/app/actions";

type SiteOption = { id: string; name: string; code: string };

function fe(fieldErrors: Record<string, string[]> | undefined, key: string) {
  return fieldErrors?.[key]?.join(" ");
}

export function ParticipantEntryForm(props: {
  sites: SiteOption[];
  defaultDateOfEntry: string;
}) {
  const [state, formAction, pending] = useActionState(
    submitParticipantEntry,
    undefined as ActionState | undefined,
  );

  const fieldErrors = state?.ok === false ? state.fieldErrors : undefined;

  const siteData = [
    { value: "", label: "Select a site…", disabled: true },
    ...props.sites.map((s) => ({ value: s.id, label: `${s.name} (${s.code})` })),
  ];

  return (
    <Paper component="form" action={formAction} withBorder shadow="sm" p={{ base: "md", sm: "xl" }} radius="lg">
      <Stack gap="xl">
        <Stack gap={4}>
          <Title order={1} size="h3">
            Participant registration
          </Title>
          <Text size="sm" c="dimmed">
            One form per young person. Each submission is stored with its own unique ID.
          </Text>
        </Stack>

        {state?.ok ? (
          <Alert color="green" title="Saved">
            <Text size="sm">{state.message}</Text>
            {state.entryId ? (
              <Code block mt="sm" style={{ wordBreak: "break-all" }}>
                {state.entryId}
              </Code>
            ) : null}
          </Alert>
        ) : null}

        {!state?.ok && state?.message ? (
          <Alert color="yellow" title="Could not save">
            {state.message}
          </Alert>
        ) : null}

        {props.sites.length === 0 ? (
          <Text size="sm" c="red">
            No sites are configured. Add <Code>DATABASE_URL</Code> and run <Code>npm run db:push</Code> /{" "}
            <Code>npm run db:seed</Code> in <Code>web</Code>.
          </Text>
        ) : null}

        <Stack gap="md">
          <Title order={3} size="sm">
            Programme & dates
          </Title>
          <NativeSelect
            name="siteId"
            label="Site"
            required
            data={siteData}
            defaultValue=""
            error={fe(fieldErrors, "siteId")}
          />
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              name="dateOfEntry"
              type="date"
              label="Date of entry"
              required
              defaultValue={props.defaultDateOfEntry}
              error={fe(fieldErrors, "dateOfEntry")}
            />
            <TextInput
              name="dateOfBirth"
              type="date"
              label="Date of birth"
              required
              error={fe(fieldErrors, "dateOfBirth")}
            />
          </SimpleGrid>
        </Stack>

        <Stack gap="md">
          <Title order={3} size="sm">
            Name
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
              label="Second / middle name"
              autoComplete="additional-name"
              placeholder="Optional"
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
        </Stack>

        <Stack gap="md">
          <Title order={3} size="sm">
            Education & location
          </Title>
          <TextInput
            name="institutionName"
            label="School / college / institution"
            required
            error={fe(fieldErrors, "institutionName")}
          />
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput name="ethnicGroup" label="Ethnic group" required error={fe(fieldErrors, "ethnicGroup")} />
            <TextInput name="town" label="Town" required error={fe(fieldErrors, "town")} />
          </SimpleGrid>
        </Stack>

        <Stack gap="md">
          <Title order={3} size="sm">
            Contacts
          </Title>
          <TextInput
            name="pointOfContact"
            label="Point of contact"
            required
            placeholder="Name or role"
            error={fe(fieldErrors, "pointOfContact")}
          />
          <TextInput
            name="studentContactNumber"
            type="tel"
            label="Contact number (student)"
            required
            autoComplete="tel"
            error={fe(fieldErrors, "studentContactNumber")}
          />
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              name="emergencyContact"
              label="Emergency contact"
              required
              error={fe(fieldErrors, "emergencyContact")}
            />
            <TextInput
              name="emergencyContactNumber"
              type="tel"
              label="Emergency contact number"
              required
              error={fe(fieldErrors, "emergencyContactNumber")}
            />
          </SimpleGrid>
          <Textarea
            name="nextOfKin"
            label="Next of kin"
            required
            rows={2}
            placeholder="Name and relationship"
            error={fe(fieldErrors, "nextOfKin")}
          />
        </Stack>

        <Stack gap="md">
          <Title order={3} size="sm">
            Parents & guardian info
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput name="fatherName" label="Father name" error={fe(fieldErrors, "fatherName")} />
            <TextInput
              name="fatherOccupation"
              label="Father occupation"
              error={fe(fieldErrors, "fatherOccupation")}
            />
            <TextInput name="fatherPhone" type="tel" label="Father phone" error={fe(fieldErrors, "fatherPhone")} />
            <TextInput name="fatherEmail" type="email" label="Father email" error={fe(fieldErrors, "fatherEmail")} />
            <TextInput name="motherName" label="Mother name" error={fe(fieldErrors, "motherName")} />
            <TextInput
              name="motherOccupation"
              label="Mother occupation"
              error={fe(fieldErrors, "motherOccupation")}
            />
            <TextInput name="motherPhone" type="tel" label="Mother phone" error={fe(fieldErrors, "motherPhone")} />
            <TextInput name="motherEmail" type="email" label="Mother email" error={fe(fieldErrors, "motherEmail")} />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput name="guardianName" label="Guardian name" error={fe(fieldErrors, "guardianName")} />
            <TextInput
              name="guardianRelationship"
              label="Relationship"
              placeholder="e.g. uncle, grandparent"
              error={fe(fieldErrors, "guardianRelationship")}
            />
            <TextInput name="guardianPhone" type="tel" label="Guardian phone" error={fe(fieldErrors, "guardianPhone")} />
            <TextInput name="guardianEmail" type="email" label="Guardian email" error={fe(fieldErrors, "guardianEmail")} />
          </SimpleGrid>
        </Stack>

        <Stack gap="md">
          <Title order={3} size="sm">
            Document info
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              name="documentBirthCert"
              label="Birth certificate"
              error={fe(fieldErrors, "documentBirthCert")}
            />
            <TextInput
              name="documentNationalId"
              label="National ID"
              error={fe(fieldErrors, "documentNationalId")}
            />
            <TextInput
              name="documentTransferCert"
              label="Transfer certificate"
              error={fe(fieldErrors, "documentTransferCert")}
            />
            <TextInput
              name="documentMedicalImmunization"
              label="Medical / immunization"
              error={fe(fieldErrors, "documentMedicalImmunization")}
            />
          </SimpleGrid>
          <Textarea
            name="documentOtherNotes"
            label="Other document notes"
            rows={2}
            error={fe(fieldErrors, "documentOtherNotes")}
          />
        </Stack>

        <Stack gap="md">
          <Title order={3} size="sm">
            Previous school information
          </Title>
          <TextInput name="previousSchool" label="Previous school" error={fe(fieldErrors, "previousSchool")} />
          <Textarea
            name="previousSchoolAddress"
            label="Previous school address"
            rows={2}
            error={fe(fieldErrors, "previousSchoolAddress")}
          />
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              name="previousSchoolClassOrGrade"
              label="Last class / grade"
              error={fe(fieldErrors, "previousSchoolClassOrGrade")}
            />
            <TextInput
              name="previousSchoolDateLeft"
              type="date"
              label="Date left"
              error={fe(fieldErrors, "previousSchoolDateLeft")}
            />
          </SimpleGrid>
          <Textarea
            name="previousSchoolLeavingReason"
            label="Leaving reason"
            rows={2}
            error={fe(fieldErrors, "previousSchoolLeavingReason")}
          />
        </Stack>

        <Stack gap="md">
          <Title order={3} size="sm">
            Admission notes
          </Title>
          <Textarea name="admissionNotes" label="Notes" rows={3} error={fe(fieldErrors, "admissionNotes")} />
        </Stack>

        <Button type="submit" fullWidth size="md" loading={pending} disabled={pending || props.sites.length === 0}>
          {pending ? "Saving…" : "Submit registration"}
        </Button>
      </Stack>
    </Paper>
  );
}
