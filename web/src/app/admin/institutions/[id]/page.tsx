import type { CSSProperties } from "react";
import { Badge, Box, Button, Divider, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { notFound } from "next/navigation";
import { AppPage } from "@/components/app-page";
import { NextMantineAnchor } from "@/components/next-mantine-links";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  appUsers,
  classes,
  institutionAttendanceSettings,
  institutionStaff,
  institutionSyllabuses,
  institutions,
  sites,
  studentGuardians,
  students,
} from "@/db/schema";
import {
  adminAssignStaff,
  adminCreateClass,
  adminCreateSyllabus,
  adminDeleteClass,
  adminDeleteSyllabus,
  adminLinkGuardianToStudent,
  adminLinkStudentPortal,
  adminRemoveStaff,
  adminSaveAttendanceFamilyMessage,
  adminUnlinkGuardian,
  adminUnlinkStudentPortal,
  adminUpdateSyllabus,
} from "@/app/admin/school-actions";

export const dynamic = "force-dynamic";

const inSm: CSSProperties = {
  marginTop: 4,
  borderRadius: "var(--mantine-radius-md)",
  border: "1px solid var(--mantine-color-gray-4)",
  padding: "6px 10px",
  fontSize: "var(--mantine-font-size-sm)",
};

const inFull: CSSProperties = { ...inSm, width: "100%", boxSizing: "border-box" as const };

const mono: CSSProperties = {
  ...inFull,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
};

const selectMd: CSSProperties = { ...inSm, minWidth: "12rem", maxWidth: "18rem" };

const listRowBox: CSSProperties = {
  padding: "var(--mantine-spacing-sm) var(--mantine-spacing-md)",
  borderRadius: "var(--mantine-radius-md)",
  border: "1px solid var(--mantine-color-gray-3)",
};

type Props = { params: Promise<{ id: string }> };

export default async function AdminInstitutionDetailPage({ params }: Props) {
  const { id } = await params;
  const db = getDb();

  const [inst] = await db
    .select({
      id: institutions.id,
      name: institutions.name,
      code: institutions.code,
      siteName: sites.name,
      siteCode: sites.code,
    })
    .from(institutions)
    .innerJoin(sites, eq(sites.id, institutions.siteId))
    .where(eq(institutions.id, id))
    .limit(1);
  if (!inst) notFound();

  const classRows = await db
    .select()
    .from(classes)
    .where(eq(classes.institutionId, id))
    .orderBy(asc(classes.name));

  const staffRows = await db
    .select({
      rowId: institutionStaff.id,
      role: institutionStaff.role,
      email: appUsers.email,
      name: appUsers.name,
      userId: institutionStaff.userId,
    })
    .from(institutionStaff)
    .innerJoin(appUsers, eq(appUsers.id, institutionStaff.userId))
    .where(eq(institutionStaff.institutionId, id))
    .orderBy(asc(appUsers.email));

  const allUsers = await db
    .select({ id: appUsers.id, email: appUsers.email, name: appUsers.name })
    .from(appUsers)
    .orderBy(asc(appUsers.email));

  const syllabusRows = await db
    .select()
    .from(institutionSyllabuses)
    .where(eq(institutionSyllabuses.institutionId, id))
    .orderBy(asc(institutionSyllabuses.sortOrder), asc(institutionSyllabuses.title));

  const studentRows = await db
    .select()
    .from(students)
    .where(eq(students.institutionId, id))
    .orderBy(asc(students.lastName), asc(students.firstName));

  const [attendanceSettings] = await db
    .select()
    .from(institutionAttendanceSettings)
    .where(eq(institutionAttendanceSettings.institutionId, id))
    .limit(1);

  const guardianRows = await db
    .select({
      linkId: studentGuardians.id,
      relationshipLabel: studentGuardians.relationshipLabel,
      guardianEmail: appUsers.email,
      guardianName: appUsers.name,
      studentFirst: students.firstName,
      studentLast: students.lastName,
      studentId: students.id,
    })
    .from(studentGuardians)
    .innerJoin(students, eq(students.id, studentGuardians.studentId))
    .innerJoin(appUsers, eq(appUsers.id, studentGuardians.guardianUserId))
    .where(eq(students.institutionId, id))
    .orderBy(asc(appUsers.email));

  return (
    <AppPage>
      <Stack gap="xl">
        <Stack gap="xs">
          <NextMantineAnchor href="/admin/institutions" size="sm" fw={500}>
            ← Schools
          </NextMantineAnchor>
          <Title order={1}>{inst.name}</Title>
          <Text size="sm" c="dimmed">
            Programme site: {inst.siteName} ({inst.siteCode})
          </Text>
        </Stack>

        <Paper withBorder shadow="sm" radius="lg" p="xl">
          <Stack gap="md">
            <Title order={2} size="h5">
              Classes
            </Title>
            <Text size="xs" c="dimmed">
              Students can belong to several classes; staff filter reports by class.
            </Text>
            <Box component="form" action={adminCreateClass.bind(null, id)}>
              <Group wrap="wrap" align="flex-end" gap="md">
                <Box>
                  <Text component="label" size="xs" fw={500} htmlFor="new-class-name" display="block">
                    Class name
                  </Text>
                  <input id="new-class-name" name="name" required style={inSm} />
                </Box>
                <Box>
                  <label htmlFor="new-class-code" style={{ display: "block", marginBottom: 4 }}>
                    <Text component="span" size="xs" fw={500}>
                      Code{" "}
                    </Text>
                    <Text component="span" size="xs" c="dimmed">
                      (optional)
                    </Text>
                  </label>
                  <input id="new-class-code" name="code" style={inSm} />
                </Box>
                <Button type="submit" color="dark">
                  Add class
                </Button>
              </Group>
            </Box>
            <Stack gap="sm">
              {classRows.map((c) => (
                <Group key={c.id} justify="space-between" align="center" wrap="wrap" gap="sm" style={listRowBox}>
                  <Text size="sm">
                    <Text component="span" fw={600}>
                      {c.name}
                    </Text>
                    {c.code ? (
                      <Text component="span" c="dimmed">
                        {" "}
                        ({c.code})
                      </Text>
                    ) : null}
                  </Text>
                  <Box component="form" action={adminDeleteClass.bind(null, c.id, id)}>
                    <Button type="submit" variant="subtle" color="red" size="compact-xs">
                      Remove
                    </Button>
                  </Box>
                </Group>
              ))}
            </Stack>
            {classRows.length === 0 ? (
              <Text size="sm" c="dimmed">
                No classes yet.
              </Text>
            ) : null}
          </Stack>
        </Paper>

        <Paper withBorder shadow="sm" radius="lg" p="xl">
          <Stack gap="md">
            <Title order={2} size="h5">
              Staff & teachers
            </Title>
            <Text size="xs" c="dimmed">
              Assigned users can enter scores and manage students for this school.
            </Text>
            <Box component="form" action={adminAssignStaff}>
              <input type="hidden" name="institutionId" value={id} />
              <Group wrap="wrap" align="flex-end" gap="md">
                <Box>
                  <Text component="label" size="xs" fw={500} htmlFor="assign-staff-user" display="block">
                    User
                  </Text>
                  <select id="assign-staff-user" name="userId" required style={selectMd}>
                    <option value="">Select…</option>
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.email} — {u.name}
                      </option>
                    ))}
                  </select>
                </Box>
                <Box>
                  <Text component="label" size="xs" fw={500} htmlFor="assign-staff-role" display="block">
                    Role
                  </Text>
                  <select id="assign-staff-role" name="role" style={inSm}>
                    <option value="teacher">Teacher</option>
                    <option value="management">Management</option>
                  </select>
                </Box>
                <Button type="submit" color="dark">
                  Assign
                </Button>
              </Group>
            </Box>
            <Stack gap="sm">
              {staffRows.map((s) => (
                <Group key={s.rowId} justify="space-between" align="center" wrap="wrap" gap="sm" style={listRowBox}>
                  <Group gap="xs" wrap="wrap">
                    <Text size="sm" fw={600}>
                      {s.name}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {s.email}
                    </Text>
                    <Badge size="sm" variant="light" color="gray" tt="uppercase">
                      {s.role}
                    </Badge>
                  </Group>
                  <Box component="form" action={adminRemoveStaff.bind(null, s.rowId, id)}>
                    <Button type="submit" variant="subtle" color="red" size="compact-xs">
                      Remove
                    </Button>
                  </Box>
                </Group>
              ))}
            </Stack>
          </Stack>
        </Paper>

        <Paper withBorder shadow="sm" radius="lg" p="xl">
          <Stack gap="lg">
            <Stack gap="xs">
              <Title order={2} size="h5">
                Attendance setup
              </Title>
              <Text size="xs" c="dimmed">
                Message shown to families above their child&apos;s attendance (bell times, expectations,
                how to report absences). Staff record marks on{" "}
                <NextMantineAnchor href="/attendance" fw={600}>
                  Attendance
                </NextMantineAnchor>
                .
              </Text>
            </Stack>
            <Box component="form" action={adminSaveAttendanceFamilyMessage.bind(null, id)}>
              <Stack gap="md">
                <Box>
                  <Text component="label" size="xs" fw={500} htmlFor="family-instructions" display="block">
                    Family-facing notes
                  </Text>
                  <textarea
                    id="family-instructions"
                    name="familyInstructions"
                    rows={4}
                    defaultValue={attendanceSettings?.familyInstructions ?? ""}
                    placeholder="e.g. School day 8:30–15:00. Report absences before 9:00."
                    style={{ ...inFull, minHeight: "6rem", resize: "vertical" as const }}
                  />
                </Box>
                <Button type="submit" color="dark">
                  Save attendance message
                </Button>
              </Stack>
            </Box>

            <Divider />

            <Stack gap="md">
              <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts={0.5}>
                Family accounts (guardians)
              </Text>
              <Text size="xs" c="dimmed">
                Link a parent or guardian&apos;s login to a student so they can view attendance on{" "}
                <Text component="span" fw={600} c="dark">
                  Family
                </Text>{" "}
                in the main menu. The guardian must already have a user account.
              </Text>
              <Box component="form" action={adminLinkGuardianToStudent}>
                <input type="hidden" name="institutionId" value={id} />
                <Group wrap="wrap" align="flex-end" gap="md">
                  <Box>
                    <Text component="label" size="xs" fw={500} htmlFor="link-guardian-student" display="block">
                      Student
                    </Text>
                    <select id="link-guardian-student" name="studentId" required style={selectMd}>
                      <option value="">Select…</option>
                      {studentRows.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.lastName}, {s.firstName}
                        </option>
                      ))}
                    </select>
                  </Box>
                  <Box>
                    <Text component="label" size="xs" fw={500} htmlFor="link-guardian-user" display="block">
                      Guardian account
                    </Text>
                    <select id="link-guardian-user" name="guardianUserId" required style={selectMd}>
                      <option value="">Select…</option>
                      {allUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.email} — {u.name}
                        </option>
                      ))}
                    </select>
                  </Box>
                  <Box>
                    <label htmlFor="link-guardian-rel" style={{ display: "block", marginBottom: 4 }}>
                      <Text component="span" size="xs" fw={500}>
                        Relationship{" "}
                      </Text>
                      <Text component="span" size="xs" c="dimmed">
                        (optional)
                      </Text>
                    </label>
                    <input
                      id="link-guardian-rel"
                      name="relationshipLabel"
                      placeholder="Mother, father…"
                      style={{ ...inSm, width: "8rem" }}
                    />
                  </Box>
                  <Button type="submit" color="teal">
                    Link guardian
                  </Button>
                </Group>
              </Box>
              <Stack gap="sm">
                {guardianRows.map((g) => (
                  <Group key={g.linkId} justify="space-between" align="center" wrap="wrap" gap="sm" style={listRowBox}>
                    <Text size="sm">
                      <Text component="span" fw={600}>
                        {g.studentFirst} {g.studentLast}
                      </Text>
                      <Text component="span" c="dimmed">
                        {" "}
                        ←{" "}
                      </Text>
                      <Text component="span">{g.guardianName}</Text>{" "}
                      <Text component="span" c="dimmed">
                        ({g.guardianEmail})
                      </Text>
                      {g.relationshipLabel ? (
                        <Text component="span" size="xs" c="dimmed" ml="xs">
                          {g.relationshipLabel}
                        </Text>
                      ) : null}
                    </Text>
                    <Box component="form" action={adminUnlinkGuardian.bind(null, g.linkId, id)}>
                      <Button type="submit" variant="subtle" color="red" size="compact-xs">
                        Unlink
                      </Button>
                    </Box>
                  </Group>
                ))}
              </Stack>
              {guardianRows.length === 0 ? (
                <Text size="sm" c="dimmed">
                  No guardian links yet.
                </Text>
              ) : null}
            </Stack>

            <Divider />

            <Stack gap="md">
              <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts={0.5}>
                Student portal (learner login)
              </Text>
              <Text size="xs" c="dimmed">
                Link a student&apos;s{" "}
                <Text component="span" fw={600} c="dark">
                  own
                </Text>{" "}
                user account so they can use{" "}
                <Text component="span" fw={600} c="dark">
                  Student
                </Text>{" "}
                in the main menu (marks, attendance, downloads). One login can only be linked to one student.
              </Text>
              <Box component="form" action={adminLinkStudentPortal}>
                <input type="hidden" name="institutionId" value={id} />
                <Group wrap="wrap" align="flex-end" gap="md">
                  <Box>
                    <Text component="label" size="xs" fw={500} htmlFor="portal-student" display="block">
                      Student
                    </Text>
                    <select id="portal-student" name="studentId" required style={selectMd}>
                      <option value="">Select…</option>
                      {studentRows.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.lastName}, {s.firstName}
                        </option>
                      ))}
                    </select>
                  </Box>
                  <Box>
                    <Text component="label" size="xs" fw={500} htmlFor="portal-user" display="block">
                      Student login account
                    </Text>
                    <select id="portal-user" name="portalUserId" required style={selectMd}>
                      <option value="">Select…</option>
                      {allUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.email} — {u.name}
                        </option>
                      ))}
                    </select>
                  </Box>
                  <Button type="submit" color="dark">
                    Link portal login
                  </Button>
                </Group>
              </Box>
              <Stack gap="sm">
                {studentRows.map((s) => {
                  const portal = s.portalUserId ? allUsers.find((u) => u.id === s.portalUserId) : null;
                  return (
                    <Group
                      key={`portal-${s.id}`}
                      justify="space-between"
                      align="center"
                      wrap="wrap"
                      gap="sm"
                      style={listRowBox}
                    >
                      <Text size="sm">
                        <Text component="span" fw={600}>
                          {s.lastName}, {s.firstName}
                        </Text>
                        {portal ? (
                          <Text component="span" c="dimmed">
                            {" "}
                            → <Text component="span" c="dark">{portal.email}</Text>
                          </Text>
                        ) : (
                          <Text component="span" c="dimmed">
                            {" "}
                            — no portal login
                          </Text>
                        )}
                      </Text>
                      {s.portalUserId ? (
                        <Box component="form" action={adminUnlinkStudentPortal.bind(null, s.id, id)}>
                          <Button type="submit" variant="subtle" color="red" size="compact-xs">
                            Unlink portal
                          </Button>
                        </Box>
                      ) : null}
                    </Group>
                  );
                })}
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        <Paper withBorder shadow="sm" radius="lg" p="xl">
          <Stack gap="md">
            <Title order={2} size="h5">
              Syllabuses
            </Title>
            <Text size="xs" c="dimmed">
              Each school keeps its own syllabus entries (topics, outcomes, terms). Staff see them under
              Evaluations → syllabuses.
            </Text>
            <Box component="form" action={adminCreateSyllabus.bind(null, id)}>
              <Stack gap="md">
                <Box>
                  <Text component="label" size="xs" fw={500} htmlFor="new-syl-title" display="block">
                    Title
                  </Text>
                  <input
                    id="new-syl-title"
                    name="title"
                    required
                    placeholder="e.g. Year 9 English"
                    style={inFull}
                  />
                </Box>
                <Box>
                  <label htmlFor="new-syl-summary" style={{ display: "block", marginBottom: 4 }}>
                    <Text component="span" size="xs" fw={500}>
                      Short summary{" "}
                    </Text>
                    <Text component="span" size="xs" c="dimmed">
                      (optional)
                    </Text>
                  </label>
                  <input id="new-syl-summary" name="summary" style={inFull} />
                </Box>
                <Box>
                  <Text component="label" size="xs" fw={500} htmlFor="new-syl-body" display="block">
                    Content
                  </Text>
                  <textarea
                    id="new-syl-body"
                    name="body"
                    required
                    rows={6}
                    placeholder="Outline units, learning outcomes, assessment weightings…"
                    style={{ ...mono, minHeight: "8rem", resize: "vertical" as const }}
                  />
                </Box>
                <Box>
                  <Text component="label" size="xs" fw={500} htmlFor="new-syl-sort" display="block">
                    Sort order
                  </Text>
                  <input id="new-syl-sort" name="sortOrder" type="number" defaultValue={0} style={{ ...inSm, width: "6rem" }} />
                </Box>
                <Button type="submit" color="dark">
                  Add syllabus
                </Button>
              </Stack>
            </Box>

            <Stack gap="lg" mt="md" pt="xl" style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}>
              {syllabusRows.map((sy) => (
                <Paper key={sy.id} withBorder p="md" radius="md" bg="gray.0">
                  <Stack gap="md">
                    <Box component="form" action={adminUpdateSyllabus.bind(null, sy.id, id)}>
                      <Stack gap="md">
                        <Box>
                          <Text component="label" size="xs" fw={500} htmlFor={`syl-title-${sy.id}`} display="block">
                            Title
                          </Text>
                          <input id={`syl-title-${sy.id}`} name="title" required defaultValue={sy.title} style={inFull} />
                        </Box>
                        <Box>
                          <Text component="label" size="xs" fw={500} htmlFor={`syl-sum-${sy.id}`} display="block">
                            Summary
                          </Text>
                          <input id={`syl-sum-${sy.id}`} name="summary" defaultValue={sy.summary ?? ""} style={inFull} />
                        </Box>
                        <Box>
                          <Text component="label" size="xs" fw={500} htmlFor={`syl-body-${sy.id}`} display="block">
                            Content
                          </Text>
                          <textarea
                            id={`syl-body-${sy.id}`}
                            name="body"
                            required
                            rows={5}
                            defaultValue={sy.body}
                            style={{ ...mono, minHeight: "7rem", resize: "vertical" as const }}
                          />
                        </Box>
                        <Box>
                          <Text component="label" size="xs" fw={500} htmlFor={`syl-sort-${sy.id}`} display="block">
                            Sort order
                          </Text>
                          <input
                            id={`syl-sort-${sy.id}`}
                            name="sortOrder"
                            type="number"
                            defaultValue={sy.sortOrder}
                            style={{ ...inSm, width: "6rem" }}
                          />
                        </Box>
                        <Button type="submit" variant="default">
                          Save
                        </Button>
                      </Stack>
                    </Box>
                    <Box component="form" action={adminDeleteSyllabus.bind(null, sy.id, id)}>
                      <Button type="submit" variant="subtle" color="red" size="compact-xs">
                        Delete syllabus
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
            {syllabusRows.length === 0 ? (
              <Text size="sm" c="dimmed">
                No syllabuses yet — add one above.
              </Text>
            ) : null}
          </Stack>
        </Paper>

        <Group gap="xs" wrap="wrap">
          <NextMantineAnchor href={`/evaluations/syllabuses/${id}`} size="sm" fw={600}>
            View syllabuses (staff)
          </NextMantineAnchor>
          <Text component="span" size="sm" c="dimmed">
            ·
          </Text>
          <NextMantineAnchor href={`/evaluations/students/${id}`} size="sm" fw={600}>
            Manage students & enrollments
          </NextMantineAnchor>
          <Text component="span" size="sm" c="dimmed">
            (staff) ·
          </Text>
          <NextMantineAnchor href="/students" size="sm" fw={600}>
            Student information
          </NextMantineAnchor>
          <Text component="span" size="sm" c="dimmed">
            ·
          </Text>
          <NextMantineAnchor href="/evaluations" size="sm" fw={600}>
            Evaluation reports
          </NextMantineAnchor>
        </Group>
      </Stack>
    </AppPage>
  );
}
