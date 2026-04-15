import { redirect } from "next/navigation";
import {
  Alert,
  Anchor,
  Button,
  Divider,
  Paper,
  Stack,
  Table,
  TableScrollContainer,
  Text,
  Title,
} from "@mantine/core";
import { deleteTeacherContent, getTeacherUploadsForSession } from "@/app/teacher-actions";
import { AppPage } from "@/components/app-page";
import { TeacherContentUploadForm } from "@/components/teacher-content-upload-form";
import { NextMantineAnchor } from "@/components/next-mantine-links";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { getInstitutionNamesBySiteIds } from "@/lib/institution-names";
import { canOnSite } from "@/lib/permissions";
import { getSitesForParticipantEntry } from "@/lib/sites-for-user";

export const metadata = {
  title: "Teacher resources — Youth programme",
};

export const dynamic = "force-dynamic";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function TeacherContentPage() {
  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const isSuperAdmin = Boolean(session.user.isSuperAdmin);

  const [uploads, uploadSites] = await Promise.all([
    getTeacherUploadsForSession(),
    getSitesForParticipantEntry(userId, isSuperAdmin),
  ]);

  const siteIds = uploadSites.map((s) => s.id);
  const institutionsBySite = await getInstitutionNamesBySiteIds(siteIds);
  const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  const rows = await Promise.all(
    uploads.map(async (u) => ({
      ...u,
      canDelete:
        isSuperAdmin ||
        (await canOnSite(userId, isSuperAdmin, u.siteId, "delete")) ||
        (u.uploadedByUserId === userId &&
          (await canOnSite(userId, isSuperAdmin, u.siteId, "create"))),
    })),
  );

  return (
    <AppPage maxWidth="wide">
      <Stack gap="xl">
        <NextMantineAnchor href="/teachers" size="sm" c="blue.7" fw={500} underline="hover">
          ← Teachers
        </NextMantineAnchor>

        <Stack gap="xs" maw={672}>
          <Title order={1} size="h2">
            Teacher resources
          </Title>
          <Text size="sm" c="dimmed" lh={1.65}>
            Upload documents or resources for a specific school or institution within a programme site. Colleagues
            who can view that site will see them here; only people with create access can add files.
          </Text>
        </Stack>

        <Paper withBorder shadow="sm" radius="md" p={0}>
          <Stack gap={0}>
            <Stack gap={4} p="md" bg="gray.0">
              <Text fw={600} size="sm">
                Uploaded files
              </Text>
              <Text size="xs" c="dimmed">
                Scoped by programme site and school / institution name.
              </Text>
            </Stack>
            <Divider />
            {rows.length === 0 ? (
              <Text size="sm" c="dimmed" px="md" py="xl">
                No uploads yet.
              </Text>
            ) : (
              <TableScrollContainer minWidth={720}>
                <Table
                  striped
                  highlightOnHover
                  withTableBorder
                  withColumnBorders
                  verticalSpacing="sm"
                  horizontalSpacing="md"
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Site</Table.Th>
                      <Table.Th>Institution</Table.Th>
                      <Table.Th>Title</Table.Th>
                      <Table.Th>File</Table.Th>
                      <Table.Th>Uploaded</Table.Th>
                      <Table.Th style={{ width: 120 }} />
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {rows.map((r) => (
                      <Table.Tr key={r.id}>
                        <Table.Td>
                          <Text size="sm" fw={500}>
                            {r.siteName}{" "}
                            <Text component="span" size="sm" c="dimmed" fw={400}>
                              ({r.siteCode})
                            </Text>
                          </Text>
                        </Table.Td>
                        <Table.Td maw={180}>
                          <Text size="sm">{r.institutionName}</Text>
                        </Table.Td>
                        <Table.Td maw={160}>
                          <Text size="sm">{r.title?.trim() ? r.title : "—"}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" style={{ wordBreak: "break-all" }}>
                            {r.fileName}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {formatBytes(r.fileSize)}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed">
                            {r.uploadedAt.toLocaleDateString()}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {r.uploadedByEmail}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Stack gap="xs" align="flex-end">
                            <Anchor href={`/api/teacher-content/${r.id}/download`} size="sm" fw={600} underline="hover">
                              Download
                            </Anchor>
                            {r.canDelete ? (
                              <form action={deleteTeacherContent.bind(null, r.id)}>
                                <Button type="submit" variant="subtle" color="red" size="compact-xs">
                                  Remove
                                </Button>
                              </form>
                            ) : null}
                          </Stack>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </TableScrollContainer>
            )}
          </Stack>
        </Paper>

        {uploadSites.length === 0 ? (
          <Alert color="yellow" title="Cannot upload yet" radius="md">
            <Text size="sm">
              Your account needs <strong>create</strong> permission on at least one programme site. Ask an
              administrator to update your access.
            </Text>
          </Alert>
        ) : (
          <TeacherContentUploadForm
            sites={uploadSites.map((s) => ({ id: s.id, name: s.name, code: s.code }))}
            institutionsBySite={institutionsBySite}
            hasBlobToken={hasBlobToken}
          />
        )}

        <Text size="sm" c="dimmed">
          <NextMantineAnchor href="/entry" fw={600}>
            Participant registration
          </NextMantineAnchor>
        </Text>
      </Stack>
    </AppPage>
  );
}
