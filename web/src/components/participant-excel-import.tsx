"use client";

import { useActionState } from "react";
import { Alert, Box, Button, Paper, Stack, Text, Title } from "@mantine/core";
import type { ImportParticipantsResult } from "@/app/import-actions";
import { importParticipantsFromExcel } from "@/app/import-actions";

export function ParticipantExcelImport() {
  const [state, formAction, pending] = useActionState(
    importParticipantsFromExcel,
    undefined as ImportParticipantsResult | undefined,
  );

  return (
    <Paper component="section" withBorder radius="xl" p={{ base: "lg", sm: "xl" }} shadow="sm" w="100%">
      <Title order={2} size="h4">
        Import from Excel
      </Title>
      <Text size="sm" c="dimmed" mt="sm">
        Download the template, fill the <Text span fw={600}>Registrations</Text> sheet (keep the
        header row), then upload here. Each row creates one participant with a new unique ID. Site is
        selected using <Text span fw={600}>site_code</Text> from the Sites sheet — same codes as in
        the app.
      </Text>

      <Box mt="md">
        <Button
          component="a"
          href="/api/participants/template"
          download
          variant="outline"
          color="teal"
        >
          Download Excel template
        </Button>
      </Box>

      <form action={formAction}>
        <Stack gap="md" mt="lg">
          <Box>
            <Text component="label" size="sm" fw={500} display="block" htmlFor="participant-excel-file">
              Spreadsheet (.xlsx or .xls)
            </Text>
            <input
              id="participant-excel-file"
              name="file"
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              required
              style={{ marginTop: 8, width: "100%", fontSize: "var(--mantine-font-size-sm)" }}
            />
          </Box>

          <Button type="submit" color="dark" loading={pending} disabled={pending}>
            {pending ? "Importing…" : "Upload and import"}
          </Button>
        </Stack>
      </form>

      {state?.ok === false ? (
        <Alert mt="md" color="red" title="Import failed">
          {state.message}
        </Alert>
      ) : null}

      {state?.ok === true ? (
        <Stack gap="sm" mt="md">
          <Alert color={state.failed.length ? "yellow" : "green"} title="Import finished">
            <Text size="sm">
              Imported {state.imported} row{state.imported === 1 ? "" : "s"}.
              {state.failed.length > 0
                ? ` ${state.failed.length} row${state.failed.length === 1 ? "" : "s"} could not be imported.`
                : ""}
            </Text>
          </Alert>
          {state.failed.length > 0 ? (
            <Paper
              withBorder
              p="sm"
              radius="md"
              style={{
                maxHeight: "12rem",
                overflow: "auto",
                background: "var(--mantine-color-gray-0)",
              }}
            >
              <Text component="ul" size="xs" m={0} pl="md" style={{ listStyle: "disc" }}>
                {state.failed.map((f, i) => (
                  <li key={`${f.rowNumber}-${i}`}>
                    Row {f.rowNumber}: {f.message}
                  </li>
                ))}
              </Text>
            </Paper>
          ) : null}
        </Stack>
      ) : null}
    </Paper>
  );
}
