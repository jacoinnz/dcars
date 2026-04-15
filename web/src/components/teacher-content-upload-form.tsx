"use client";

import { useActionState, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Code,
  NativeSelect,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import type { TeacherUploadActionState } from "@/app/teacher-actions";
import { uploadTeacherContent } from "@/app/teacher-actions";

type SiteOpt = { id: string; name: string; code: string };

export function TeacherContentUploadForm(props: {
  sites: SiteOpt[];
  institutionsBySite: Record<string, string[]>;
  hasBlobToken: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    uploadTeacherContent,
    undefined as TeacherUploadActionState | undefined,
  );

  const siteIds = useMemo(() => props.sites.map((s) => s.id), [props.sites]);
  const defaultSiteId = siteIds[0] ?? "";
  const [siteId, setSiteId] = useState(defaultSiteId);
  const institutionSuggestions = props.institutionsBySite[siteId] ?? [];

  const siteData = useMemo(
    () => props.sites.map((s) => ({ value: s.id, label: `${s.name} (${s.code})` })),
    [props.sites],
  );

  return (
    <Stack
      component="section"
      gap="md"
      p={{ base: "md", sm: "xl" }}
      style={{
        borderRadius: "var(--mantine-radius-md)",
        border: "1px solid var(--mantine-color-gray-3)",
        backgroundColor: "var(--mantine-color-body)",
      }}
    >
      <div>
        <Title order={2} size="h4">
          Upload for a school or institution
        </Title>
        <Text size="sm" c="dimmed" mt="xs" lh={1.65}>
          Choose the programme site, then the school or college this file relates to. You can pick an existing name
          from registrations or type a new one.
        </Text>
      </div>

      {!props.hasBlobToken ? (
        <Alert color="yellow" title="Storage" radius="md">
          <Text size="sm">
            Large files: set <Code>BLOB_READ_WRITE_TOKEN</Code> (Vercel Blob). Without it, uploads are stored in the
            database with a 2MB limit.
          </Text>
        </Alert>
      ) : null}

      <form action={formAction}>
        <Stack gap="md">
          <input type="hidden" name="siteId" value={siteId} />
          <NativeSelect
            label="Programme site"
            data={siteData}
            value={siteId}
            onChange={(e) => setSiteId(e.currentTarget.value || defaultSiteId)}
            required
            disabled={props.sites.length === 0}
          />

          <TextInput
            label="School / college / institution"
            name="institutionName"
            required
            maxLength={200}
            placeholder="e.g. Riverside Academy"
            list="institution-suggestions"
            autoComplete="off"
          />
          <datalist id="institution-suggestions" key={siteId}>
            {institutionSuggestions.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>

          <TextInput
            label="Title"
            description="Optional"
            name="title"
            maxLength={200}
            placeholder="Short label for this file"
          />

          <Textarea
            label="Notes"
            description="Optional"
            name="description"
            maxLength={2000}
            rows={2}
            placeholder="Context for colleagues"
          />

          <Stack gap={6}>
            <Text component="label" size="sm" fw={500} htmlFor="teacher-content-file">
              File <span style={{ color: "var(--mantine-color-red-filled)" }}>*</span>
            </Text>
            <input
              id="teacher-content-file"
              type="file"
              name="file"
              required
              disabled={props.sites.length === 0}
              style={{
                fontSize: "var(--mantine-font-size-sm)",
                width: "100%",
                maxWidth: "100%",
              }}
            />
          </Stack>

          <Button type="submit" loading={pending} disabled={pending || props.sites.length === 0}>
            {pending ? "Uploading…" : "Upload"}
          </Button>
        </Stack>
      </form>

      {state?.ok === false ? (
        <Alert color="red" title="Upload failed" radius="md">
          <Text size="sm">{state.message}</Text>
        </Alert>
      ) : null}
      {state?.ok === true ? (
        <Alert color="green" title="Uploaded" radius="md">
          <Text size="sm">{state.message}</Text>
        </Alert>
      ) : null}
    </Stack>
  );
}
