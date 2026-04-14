import type { CSSProperties } from "react";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  Title,
} from "@mantine/core";
import { notFound } from "next/navigation";
import { AppPage } from "@/components/app-page";
import { NextMantineAnchor } from "@/components/next-mantine-links";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { appUsers, siteUserPermissions, sites } from "@/db/schema";
import { adminSaveUserSitePermissions, adminUpdateUser } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

const fieldInputStyle: CSSProperties = {
  marginTop: 4,
  borderRadius: "var(--mantine-radius-md)",
  border: "1px solid var(--mantine-color-gray-4)",
  padding: "8px 12px",
  fontSize: "var(--mantine-font-size-sm)",
  width: "100%",
};

type Props = { params: Promise<{ id: string }> };

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params;
  const db = getDb();

  const [user] = await db.select().from(appUsers).where(eq(appUsers.id, id)).limit(1);
  if (!user) notFound();

  const siteRows = await db.select().from(sites).orderBy(asc(sites.name));
  const permRows = await db
    .select()
    .from(siteUserPermissions)
    .where(eq(siteUserPermissions.userId, id));

  const permBySite = new Map(permRows.map((p) => [p.siteId, p]));

  return (
    <AppPage>
      <Stack gap="xl">
        <Stack gap="xs">
          <NextMantineAnchor href="/admin/users" size="sm" fw={500}>
            ← Users
          </NextMantineAnchor>
          <Title order={1}>Edit user</Title>
          <Text size="sm" c="dimmed">
            {user.email}
          </Text>
        </Stack>

        <Paper component="form" action={adminUpdateUser.bind(null, id)} withBorder shadow="sm" radius="lg" p="xl" maw={560}>
          <Stack gap="md">
            <Title order={3} size="h5">
              Account
            </Title>
            <Box>
              <Text component="label" size="sm" fw={500} htmlFor="edit-user-email" display="block">
                Email
              </Text>
              <input
                id="edit-user-email"
                name="email"
                type="email"
                defaultValue={user.email}
                required
                style={fieldInputStyle}
              />
            </Box>
            <Box>
              <Text component="label" size="sm" fw={500} htmlFor="edit-user-name" display="block">
                Display name
              </Text>
              <input id="edit-user-name" name="name" defaultValue={user.name} required style={fieldInputStyle} />
            </Box>
            <Box>
              <Text component="label" size="sm" fw={500} htmlFor="edit-user-password" display="block">
                New password (leave blank to keep current)
              </Text>
              <input
                id="edit-user-password"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                style={fieldInputStyle}
              />
            </Box>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--mantine-spacing-sm)",
                fontSize: "var(--mantine-font-size-sm)",
                cursor: "pointer",
              }}
            >
              <input name="isSuperAdmin" type="checkbox" defaultChecked={user.isSuperAdmin} />
              <span>Super admin</span>
            </label>
            <Button type="submit" color="dark" mt="xs">
              Save account
            </Button>
          </Stack>
        </Paper>

        {user.isSuperAdmin ? (
          <Alert color="gray" title="Super admin" maw={672}>
            <Text size="sm">
              Super admins have full access to all sites. Per-site permissions are cleared while this role is
              enabled.
            </Text>
          </Alert>
        ) : (
          <Paper
            component="form"
            action={adminSaveUserSitePermissions.bind(null, id)}
            withBorder
            shadow="sm"
            radius="lg"
            style={{ overflow: "hidden" }}
            maw={900}
          >
            <Box p="md" style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}>
              <Title order={3} size="h5">
                Site permissions
              </Title>
              <Text size="xs" c="dimmed" mt={6}>
                View affects dashboards and reports; Create is required for participant registration.
              </Text>
            </Box>
            <div style={{ overflowX: "auto" }}>
              <Table striped highlightOnHover>
                <TableThead>
                  <TableTr>
                    <TableTh>Site</TableTh>
                    <TableTh ta="center">View</TableTh>
                    <TableTh ta="center">Create</TableTh>
                    <TableTh ta="center">Edit</TableTh>
                    <TableTh ta="center">Delete</TableTh>
                  </TableTr>
                </TableThead>
                <TableTbody>
                  {siteRows.map((s) => {
                    const p = permBySite.get(s.id);
                    return (
                      <TableTr key={s.id}>
                        <TableTd>
                          <Text fw={500} size="sm" component="span">
                            {s.name}
                          </Text>{" "}
                          <Text span c="dimmed" size="sm">
                            ({s.code})
                          </Text>
                        </TableTd>
                        <TableTd ta="center">
                          <input
                            name={`site_${s.id}_view`}
                            type="checkbox"
                            defaultChecked={p?.canView ?? false}
                          />
                        </TableTd>
                        <TableTd ta="center">
                          <input
                            name={`site_${s.id}_create`}
                            type="checkbox"
                            defaultChecked={p?.canCreate ?? false}
                          />
                        </TableTd>
                        <TableTd ta="center">
                          <input
                            name={`site_${s.id}_update`}
                            type="checkbox"
                            defaultChecked={p?.canUpdate ?? false}
                          />
                        </TableTd>
                        <TableTd ta="center">
                          <input
                            name={`site_${s.id}_delete`}
                            type="checkbox"
                            defaultChecked={p?.canDelete ?? false}
                          />
                        </TableTd>
                      </TableTr>
                    );
                  })}
                </TableTbody>
              </Table>
            </div>
            {siteRows.length === 0 ? (
              <Box p="lg">
                <Text size="sm" c="dimmed">
                  No sites defined yet.{" "}
                  <NextMantineAnchor href="/admin/sites" fw={600}>
                    Add sites
                  </NextMantineAnchor>{" "}
                  first.
                </Text>
              </Box>
            ) : (
              <Box p="md" style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}>
                <Button type="submit" color="teal">
                  Save permissions
                </Button>
              </Box>
            )}
          </Paper>
        )}
      </Stack>
    </AppPage>
  );
}
