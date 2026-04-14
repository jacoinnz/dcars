import type { CSSProperties } from "react";
import { Box, Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { asc } from "drizzle-orm";
import { AppPage } from "@/components/app-page";
import { getDb } from "@/db";
import { sites } from "@/db/schema";
import { adminCreateSite, adminDeleteSite, adminUpdateSite } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sites — Admin",
};

const fieldInputStyle: CSSProperties = {
  marginTop: 4,
  borderRadius: "var(--mantine-radius-md)",
  border: "1px solid var(--mantine-color-gray-4)",
  padding: "6px 10px",
  fontSize: "var(--mantine-font-size-sm)",
  minWidth: "10rem",
};

export default async function AdminSitesPage() {
  const db = getDb();
  const rows = await db.select().from(sites).orderBy(asc(sites.name));

  return (
    <AppPage>
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={1}>Sites</Title>
          <Text c="dimmed" size="sm" maw={520}>
            Each site appears in dashboards and registration. Codes must be unique (e.g. short
            abbreviations).
          </Text>
        </Stack>

        <Paper withBorder shadow="sm" radius="lg" p="xl">
          <Stack gap="md">
            <Title order={2} size="h5">
              Add site
            </Title>
            <Box component="form" action={adminCreateSite}>
              <Group wrap="wrap" align="flex-end" gap="md">
                <Box>
                  <Text component="label" size="xs" fw={500} htmlFor="new-site-name" display="block">
                    Name
                  </Text>
                  <input id="new-site-name" name="name" required style={fieldInputStyle} />
                </Box>
                <Box>
                  <Text component="label" size="xs" fw={500} htmlFor="new-site-code" display="block">
                    Code
                  </Text>
                  <input
                    id="new-site-code"
                    name="code"
                    required
                    style={{ ...fieldInputStyle, textTransform: "uppercase" }}
                  />
                </Box>
                <Button type="submit" color="dark">
                  Create
                </Button>
              </Group>
            </Box>
          </Stack>
        </Paper>

        <Paper withBorder shadow="sm" radius="lg" style={{ overflow: "hidden" }}>
          <Box p="md" style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}>
            <Title order={2} size="h5">
              Existing sites
            </Title>
          </Box>
          {rows.length === 0 ? (
            <Box p="lg">
              <Text size="sm" c="dimmed">
                No sites yet — add one above.
              </Text>
            </Box>
          ) : (
            <Stack gap={0}>
              {rows.map((s, idx) => (
                <Box
                  key={s.id}
                  p="md"
                  style={{
                    borderTop: idx > 0 ? "1px solid var(--mantine-color-gray-3)" : undefined,
                  }}
                >
                  <Stack gap="sm">
                    <Box component="form" action={adminUpdateSite.bind(null, s.id)}>
                      <Group wrap="wrap" align="flex-end" gap="md">
                        <Box>
                          <Text
                            component="label"
                            size="xs"
                            fw={500}
                            htmlFor={`site-name-${s.id}`}
                            display="block"
                          >
                            Name
                          </Text>
                          <input
                            id={`site-name-${s.id}`}
                            name="name"
                            defaultValue={s.name}
                            required
                            style={fieldInputStyle}
                          />
                        </Box>
                        <Box>
                          <Text
                            component="label"
                            size="xs"
                            fw={500}
                            htmlFor={`site-code-${s.id}`}
                            display="block"
                          >
                            Code
                          </Text>
                          <input
                            id={`site-code-${s.id}`}
                            name="code"
                            defaultValue={s.code}
                            required
                            style={{ ...fieldInputStyle, textTransform: "uppercase" }}
                          />
                        </Box>
                        <Button type="submit" variant="default">
                          Save
                        </Button>
                      </Group>
                    </Box>
                    <Box component="form" action={adminDeleteSite.bind(null, s.id)}>
                      <Button type="submit" variant="subtle" color="red" size="compact-xs">
                        Delete site
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
