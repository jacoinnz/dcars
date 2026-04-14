import {
  Badge,
  Box,
  Button,
  Group,
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
import { asc } from "drizzle-orm";
import { AppPage } from "@/components/app-page";
import { NextMantineAnchor, NextMantineButtonLink } from "@/components/next-mantine-links";
import { getDb } from "@/db";
import { appUsers } from "@/db/schema";
import { adminDeleteUser } from "@/app/admin/actions";
import { getServerSessionWithBypass } from "@/lib/auth-options";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Users — Admin",
};

export default async function AdminUsersPage() {
  const session = await getServerSessionWithBypass();
  const db = getDb();
  const rows = await db.select().from(appUsers).orderBy(asc(appUsers.email));

  return (
    <AppPage>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
          <Stack gap="xs">
            <Title order={1}>Users</Title>
            <Text c="dimmed" size="sm" maw={520}>
              Staff accounts for the same database. Super admins can manage sites and users; other
              accounts receive per-site permissions.
            </Text>
          </Stack>
          <NextMantineButtonLink href="/admin/users/new" color="teal">
            New user
          </NextMantineButtonLink>
        </Group>

        <Paper withBorder shadow="sm" radius="lg" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <Table striped highlightOnHover>
              <TableThead>
                <TableTr>
                  <TableTh>Email</TableTh>
                  <TableTh>Name</TableTh>
                  <TableTh>Role</TableTh>
                  <TableTh style={{ width: "8rem" }} />
                </TableTr>
              </TableThead>
              <TableTbody>
                {rows.map((u) => (
                  <TableTr key={u.id}>
                    <TableTd>
                      <Text fw={500} size="sm">
                        {u.email}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text size="sm">{u.name}</Text>
                    </TableTd>
                    <TableTd>
                      {u.isSuperAdmin ? (
                        <Badge color="teal" variant="light" size="sm">
                          Super admin
                        </Badge>
                      ) : (
                        <Text size="sm" c="dimmed">
                          Standard
                        </Text>
                      )}
                    </TableTd>
                    <TableTd>
                      <Stack gap={6} align="flex-end">
                        <NextMantineAnchor href={`/admin/users/${u.id}`} fw={600} size="sm">
                          Edit
                        </NextMantineAnchor>
                        {session?.user?.id !== u.id ? (
                          <Box component="form" action={adminDeleteUser.bind(null, u.id)}>
                            <Button type="submit" variant="subtle" color="red" size="compact-xs">
                              Delete
                            </Button>
                          </Box>
                        ) : null}
                      </Stack>
                    </TableTd>
                  </TableTr>
                ))}
              </TableTbody>
            </Table>
          </div>
          {rows.length === 0 ? (
            <Box p="lg">
              <Text size="sm" c="dimmed">
                No users yet.
              </Text>
            </Box>
          ) : null}
        </Paper>
      </Stack>
    </AppPage>
  );
}
