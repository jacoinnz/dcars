import Link from "next/link";
import { format } from "date-fns";
import { and, asc, eq, inArray } from "drizzle-orm";
import { Alert, Anchor, Box, Button, Paper, Stack, Table, Text, Title } from "@mantine/core";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { attendanceRecords, institutions, sites, students } from "@/db/schema";
import { ATTENDANCE_STATUSES } from "@/app/attendance/constants";
import { saveAttendanceForDate } from "@/app/attendance/actions";
import { AppPage } from "@/components/app-page";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { getManageableInstitutionIds } from "@/lib/school-access";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Student attendance (staff) — Youth programme",
};

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const isSuperAdmin = Boolean(session.user.isSuperAdmin);
  const sp = await searchParams;

  const institutionId = typeof sp.institutionId === "string" ? sp.institutionId : "";
  const dateStr =
    typeof sp.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.date)
      ? sp.date
      : format(new Date(), "yyyy-MM-dd");

  const manageable = await getManageableInstitutionIds(userId, isSuperAdmin);
  const db = getDb();

  const institutionOptions =
    manageable.length === 0
      ? []
      : await db
          .select({
            id: institutions.id,
            name: institutions.name,
            siteName: sites.name,
          })
          .from(institutions)
          .innerJoin(sites, eq(sites.id, institutions.siteId))
          .where(inArray(institutions.id, manageable))
          .orderBy(asc(institutions.name));

  const activeInstitutionId =
    institutionId && manageable.includes(institutionId)
      ? institutionId
      : (institutionOptions[0]?.id ?? "");

  let studRows: (typeof students.$inferSelect)[] = [];
  const existing = new Map<
    string,
    { status: string; notes: string | null }
  >();

  if (activeInstitutionId) {
    studRows = await db
      .select()
      .from(students)
      .where(eq(students.institutionId, activeInstitutionId))
      .orderBy(asc(students.lastName), asc(students.firstName));

    if (studRows.length) {
      const ids = studRows.map((s) => s.id);
      const att = await db
        .select()
        .from(attendanceRecords)
        .where(
          and(
            inArray(attendanceRecords.studentId, ids),
            eq(attendanceRecords.sessionDate, dateStr),
          ),
        );
      for (const a of att) {
        existing.set(a.studentId, { status: a.status, notes: a.notes });
      }
    }
  }

  return (
    <AppPage>
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={1}>Student attendance</Title>
          <Text c="dimmed" size="sm" maw={520}>
            Staff register: one mark per student per school day (present, absent, late, excused). Clear a
            row to remove a mark for that day.
          </Text>
        </Stack>

        {manageable.length === 0 ? (
          <Alert color="yellow" mt="md">
            You are not assigned as staff for any school. Ask an administrator to add you under Admin →
            Schools → Staff.
          </Alert>
        ) : (
          <Box
            component="form"
            method="get"
            mt="md"
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-end",
              gap: "var(--mantine-spacing-md)",
            }}
          >
            <Box>
              <Text component="label" size="xs" fw={500} htmlFor="att-institution" display="block">
                School
              </Text>
              <select
                id="att-institution"
                name="institutionId"
                defaultValue={activeInstitutionId}
                style={{
                  marginTop: 4,
                  minWidth: "14rem",
                  borderRadius: "var(--mantine-radius-md)",
                  border: "1px solid var(--mantine-color-gray-4)",
                  padding: "6px 8px",
                  fontSize: "var(--mantine-font-size-sm)",
                }}
              >
                {institutionOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} — {o.siteName}
                  </option>
                ))}
              </select>
            </Box>
            <Box>
              <Text component="label" size="xs" fw={500} htmlFor="att-date" display="block">
                Date
              </Text>
              <input
                id="att-date"
                type="date"
                name="date"
                defaultValue={dateStr}
                style={{
                  marginTop: 4,
                  borderRadius: "var(--mantine-radius-md)",
                  border: "1px solid var(--mantine-color-gray-4)",
                  padding: "6px 8px",
                  fontSize: "var(--mantine-font-size-sm)",
                }}
              />
            </Box>
            <Button type="submit" color="dark">
              Load
            </Button>
          </Box>
        )}

        {activeInstitutionId && studRows.length > 0 ? (
          <Paper
            component="form"
            action={saveAttendanceForDate.bind(null, activeInstitutionId, dateStr)}
            withBorder
            shadow="sm"
            radius="lg"
            mt="xl"
            style={{ overflow: "hidden" }}
          >
            <Box p="md" style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}>
              <Title order={2} size="h5">
                {format(new Date(`${dateStr}T12:00:00`), "EEEE d MMM yyyy")}
              </Title>
            </Box>
            <Table.ScrollContainer minWidth={500}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Student</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th style={{ maxWidth: 320 }}>Note</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {studRows.map((s) => {
                    const ex = existing.get(s.id);
                    return (
                      <Table.Tr key={s.id}>
                        <Table.Td fw={600}>
                          {s.lastName}, {s.firstName}
                        </Table.Td>
                        <Table.Td>
                          <select
                            name={`s_${s.id}`}
                            defaultValue={ex?.status ?? ""}
                            style={{
                              borderRadius: "var(--mantine-radius-sm)",
                              border: "1px solid var(--mantine-color-gray-4)",
                              padding: "4px 8px",
                              fontSize: "var(--mantine-font-size-sm)",
                            }}
                          >
                            <option value="">— no mark / clear —</option>
                            {ATTENDANCE_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </Table.Td>
                        <Table.Td style={{ maxWidth: 320 }}>
                          <input
                            name={`n_${s.id}`}
                            defaultValue={ex?.notes ?? ""}
                            placeholder="Optional"
                            style={{
                              width: "100%",
                              borderRadius: "var(--mantine-radius-sm)",
                              border: "1px solid var(--mantine-color-gray-4)",
                              padding: "4px 8px",
                              fontSize: "var(--mantine-font-size-sm)",
                            }}
                          />
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
            <Box p="md" style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}>
              <Button type="submit" color="teal">
                Save attendance
              </Button>
            </Box>
          </Paper>
        ) : null}

        {activeInstitutionId && studRows.length === 0 ? (
          <Text size="sm" c="dimmed" mt="xl">
            No students in this school yet. Add them under{" "}
            <Anchor component={Link} href={`/evaluations/students/${activeInstitutionId}`} fw={600}>
              Evaluations → students
            </Anchor>
            .
          </Text>
        ) : null}

        <Text size="sm" c="dimmed" mt="xl">
          <Anchor component={Link} href="/students/attendance" fw={600}>
            Student attendance hub
          </Anchor>
          {" · "}
          <Anchor component={Link} href="/students" fw={600}>
            Student information
          </Anchor>
        </Text>
      </Stack>
    </AppPage>
  );
}
