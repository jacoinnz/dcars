import type { CSSProperties } from "react";
import { Alert, Box, Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { asc, eq } from "drizzle-orm";
import { AppPage } from "@/components/app-page";
import { NextMantineAnchor } from "@/components/next-mantine-links";
import { getDb } from "@/db";
import { institutions, sites } from "@/db/schema";
import {
  adminCreateInstitution,
  adminDeleteInstitution,
  adminUpdateInstitution,
} from "@/app/admin/school-actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Schools — Admin",
};

const fieldInputStyle: CSSProperties = {
  marginTop: 4,
  borderRadius: "var(--mantine-radius-md)",
  border: "1px solid var(--mantine-color-gray-4)",
  padding: "6px 10px",
  fontSize: "var(--mantine-font-size-sm)",
  minWidth: "10rem",
};

const fieldSelectStyle: CSSProperties = {
  ...fieldInputStyle,
  minWidth: "14rem",
};

export default async function AdminInstitutionsPage() {
  const db = getDb();
  const rows = await db
    .select({
      id: institutions.id,
      name: institutions.name,
      code: institutions.code,
      siteName: sites.name,
      siteCode: sites.code,
      siteId: institutions.siteId,
    })
    .from(institutions)
    .innerJoin(sites, eq(sites.id, institutions.siteId))
    .orderBy(asc(institutions.name));

  const siteList = await db.select().from(sites).orderBy(asc(sites.name));

  return (
    <AppPage>
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={1}>Schools & classes</Title>
          <Text c="dimmed" size="sm" maw={560}>
            Create a school under a programme site, then add classes and assign staff on the school detail
            page. Staff can record evaluations and manage students from Evaluations in the main app.
          </Text>
        </Stack>

        <Paper withBorder shadow="sm" radius="lg" p="xl">
          <Stack gap="md">
            <Title order={2} size="h5">
              Add school
            </Title>
            {siteList.length === 0 ? (
              <Alert color="yellow" title="Add a site first">
                <Text size="sm">
                  Create a programme site under{" "}
                  <NextMantineAnchor href="/admin/sites" fw={600}>
                    Sites
                  </NextMantineAnchor>{" "}
                  first.
                </Text>
              </Alert>
            ) : null}
            <Box component="form" action={adminCreateInstitution}>
              <Group wrap="wrap" align="flex-end" gap="md">
                <Box>
                  <Text component="label" size="xs" fw={500} htmlFor="new-inst-site" display="block">
                    Programme site
                  </Text>
                  <select id="new-inst-site" name="siteId" required disabled={siteList.length === 0} style={fieldSelectStyle}>
                    {siteList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </Box>
                <Box>
                  <Text component="label" size="xs" fw={500} htmlFor="new-inst-name" display="block">
                    School name
                  </Text>
                  <input id="new-inst-name" name="name" required disabled={siteList.length === 0} style={fieldInputStyle} />
                </Box>
                <Box>
                  <label htmlFor="new-inst-code" style={{ display: "block", marginBottom: 4 }}>
                    <Text component="span" size="xs" fw={500}>
                      Code{" "}
                    </Text>
                    <Text component="span" size="xs" c="dimmed">
                      (optional)
                    </Text>
                  </label>
                  <input id="new-inst-code" name="code" disabled={siteList.length === 0} style={fieldInputStyle} />
                </Box>
                <Button type="submit" color="dark" disabled={siteList.length === 0}>
                  Create
                </Button>
              </Group>
            </Box>
          </Stack>
        </Paper>

        <Paper withBorder shadow="sm" radius="lg" style={{ overflow: "hidden" }}>
          <Box p="md" style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}>
            <Title order={2} size="h5">
              Schools
            </Title>
          </Box>
          {rows.length === 0 ? (
            <Box p="lg">
              <Text size="sm" c="dimmed">
                No schools yet.
              </Text>
            </Box>
          ) : (
            <Stack gap={0}>
              {rows.map((r, idx) => (
                <Box
                  key={r.id}
                  p="md"
                  style={{
                    borderTop: idx > 0 ? "1px solid var(--mantine-color-gray-3)" : undefined,
                  }}
                >
                  <Stack gap="md">
                    <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
                      <Box style={{ minWidth: "12rem" }}>
                        <Text size="sm">
                          <NextMantineAnchor href={`/admin/institutions/${r.id}`} fw={600}>
                            {r.name}
                          </NextMantineAnchor>
                          {r.code ? (
                            <Text span c="dimmed" ml={6}>
                              ({r.code})
                            </Text>
                          ) : null}
                        </Text>
                        <Text size="xs" c="dimmed" mt={4}>
                          Site: {r.siteName} ({r.siteCode})
                        </Text>
                      </Box>
                      <Box component="form" action={adminUpdateInstitution.bind(null, r.id)}>
                        <Group wrap="wrap" align="flex-end" gap="sm">
                          <Box>
                            <Text
                              component="label"
                              size="xs"
                              c="dimmed"
                              htmlFor={`inst-name-${r.id}`}
                              display="block"
                            >
                              Name
                            </Text>
                            <input
                              id={`inst-name-${r.id}`}
                              name="name"
                              defaultValue={r.name}
                              required
                              style={{ ...fieldInputStyle, minWidth: "8rem" }}
                            />
                          </Box>
                          <Box>
                            <Text
                              component="label"
                              size="xs"
                              c="dimmed"
                              htmlFor={`inst-code-${r.id}`}
                              display="block"
                            >
                              Code
                            </Text>
                            <input
                              id={`inst-code-${r.id}`}
                              name="code"
                              defaultValue={r.code ?? ""}
                              style={{ ...fieldInputStyle, minWidth: "6rem" }}
                            />
                          </Box>
                          <Button type="submit" variant="default" size="compact-sm">
                            Save
                          </Button>
                        </Group>
                      </Box>
                    </Group>
                    <Box component="form" action={adminDeleteInstitution.bind(null, r.id)}>
                      <Button type="submit" variant="subtle" color="red" size="compact-xs">
                        Delete school
                      </Button>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      </Stack>
    </AppPage>
  );
}
