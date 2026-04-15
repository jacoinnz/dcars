import type { CSSProperties } from "react";
import { endOfDay, format, startOfDay, subMonths } from "date-fns";
import { and, asc, eq, inArray } from "drizzle-orm";
import {
  Alert,
  Box,
  Button,
  Grid,
  GridCol,
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
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { classes, institutions, sites, students } from "@/db/schema";
import { addPerformanceRecord } from "@/app/evaluations/actions";
import { AppPage } from "@/components/app-page";
import { NextMantineAnchor } from "@/components/next-mantine-links";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { fetchPerformanceForReport } from "@/lib/evaluation-report";
import { canManageInstitution, getViewableInstitutionIds } from "@/lib/school-access";
import { studentIsActive } from "@/lib/students-active";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Evaluations — Youth programme",
};

const fieldInputStyle: CSSProperties = {
  marginTop: 4,
  borderRadius: "var(--mantine-radius-md)",
  border: "1px solid var(--mantine-color-gray-4)",
  padding: "6px 8px",
  fontSize: "var(--mantine-font-size-sm)",
  width: "100%",
};

function parseClassIds(sp: Record<string, string | string[] | undefined>): string[] {
  const raw = sp.classId;
  if (raw === undefined) return [];
  return Array.isArray(raw) ? raw : [raw];
}

export default async function EvaluationsPage({
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
  const fromStr = typeof sp.from === "string" ? sp.from : "";
  const toStr = typeof sp.to === "string" ? sp.to : "";
  const classIds = parseClassIds(sp);

  const viewableIds = await getViewableInstitutionIds(userId, isSuperAdmin);
  const db = getDb();

  const institutionOptions =
    viewableIds.length === 0
      ? []
      : await db
          .select({
            id: institutions.id,
            name: institutions.name,
            siteName: sites.name,
          })
          .from(institutions)
          .innerJoin(sites, eq(sites.id, institutions.siteId))
          .where(inArray(institutions.id, viewableIds))
          .orderBy(asc(institutions.name));

  const now = new Date();
  const toDate = toStr ? endOfDay(new Date(`${toStr}T12:00:00`)) : endOfDay(now);
  const fromDate = fromStr
    ? startOfDay(new Date(`${fromStr}T12:00:00`))
    : startOfDay(subMonths(toDate, 3));

  let report: Awaited<ReturnType<typeof fetchPerformanceForReport>> | null = null;
  let classRows: { id: string; name: string; code: string | null }[] = [];
  let studentOptions: { id: string; label: string }[] = [];
  const canManage =
    institutionId && (await canManageInstitution(userId, isSuperAdmin, institutionId));

  if (institutionId && viewableIds.includes(institutionId)) {
    report = await fetchPerformanceForReport({
      institutionId,
      classIds,
      from: fromDate,
      to: toDate,
    });
    classRows = await db
      .select()
      .from(classes)
      .where(eq(classes.institutionId, institutionId))
      .orderBy(asc(classes.name));
    const studs = await db
      .select()
      .from(students)
      .where(and(eq(students.institutionId, institutionId), studentIsActive))
      .orderBy(asc(students.lastName), asc(students.firstName));
    studentOptions = studs.map((s) => ({
      id: s.id,
      label: `${s.lastName}, ${s.firstName}`,
    }));
  }

  const fromInput = format(fromDate, "yyyy-MM-dd");
  const toInput = format(toDate, "yyyy-MM-dd");

  return (
    <AppPage>
      <Stack gap="xl">
        <Stack gap="xs">
          <NextMantineAnchor href="/students" size="sm" fw={500}>
            ← Student information
          </NextMantineAnchor>
          <Title order={1}>Evaluation reports</Title>
          <Text c="dimmed" size="sm" maw={560}>
            Filter by school and optionally by one or more classes. Scores are averaged as a percentage
            of the maximum. Staff assigned to a school can enter results; programme site access allows
            read-only visibility where configured.
          </Text>
        </Stack>

        {viewableIds.length === 0 ? (
          <Alert color="yellow" title="No schools available yet">
            <Text size="sm">
              Super admins can add schools under{" "}
              <NextMantineAnchor href="/admin/institutions" fw={600}>
                Admin → Schools
              </NextMantineAnchor>{" "}
              and assign staff.
            </Text>
          </Alert>
        ) : null}

        <Paper component="form" method="get" withBorder shadow="sm" radius="lg" p="lg">
          <Stack gap="lg">
            <Group wrap="wrap" align="flex-end" gap="md">
              <Box>
                <Text component="label" size="xs" fw={500} htmlFor="eval-institution" display="block">
                  School
                </Text>
                <select
                  id="eval-institution"
                  name="institutionId"
                  required
                  defaultValue={institutionId || undefined}
                  style={{
                    ...fieldInputStyle,
                    marginTop: 4,
                    minWidth: "14rem",
                    width: "auto",
                  }}
                >
                  <option value="">Select…</option>
                  {institutionOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} — {o.siteName}
                    </option>
                  ))}
                </select>
              </Box>
              <Box>
                <Text component="label" size="xs" fw={500} htmlFor="eval-from" display="block">
                  From
                </Text>
                <input
                  id="eval-from"
                  type="date"
                  name="from"
                  defaultValue={fromInput}
                  style={{ ...fieldInputStyle, width: "auto" }}
                />
              </Box>
              <Box>
                <Text component="label" size="xs" fw={500} htmlFor="eval-to" display="block">
                  To
                </Text>
                <input
                  id="eval-to"
                  type="date"
                  name="to"
                  defaultValue={toInput}
                  style={{ ...fieldInputStyle, width: "auto" }}
                />
              </Box>
              <Button type="submit" color="dark">
                Apply
              </Button>
            </Group>

            {institutionId && classRows.length > 0 ? (
              <Box>
                <Text size="xs" fw={500} display="block" mb={6}>
                  Classes (optional)
                </Text>
                <Box
                  style={{
                    maxHeight: "7rem",
                    overflowY: "auto",
                    borderRadius: "var(--mantine-radius-md)",
                    border: "1px solid var(--mantine-color-gray-3)",
                    backgroundColor: "var(--mantine-color-gray-0)",
                    padding: "var(--mantine-spacing-xs) var(--mantine-spacing-sm)",
                  }}
                >
                  <Stack gap={6}>
                    {classRows.map((c) => (
                      <label
                        key={c.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--mantine-spacing-xs)",
                          cursor: "pointer",
                          fontSize: "var(--mantine-font-size-sm)",
                        }}
                      >
                        <input
                          type="checkbox"
                          name="classId"
                          value={c.id}
                          defaultChecked={classIds.includes(c.id)}
                        />
                        <span>{c.name}</span>
                      </label>
                    ))}
                  </Stack>
                </Box>
              </Box>
            ) : null}
          </Stack>
        </Paper>

        {institutionId && viewableIds.includes(institutionId) ? (
          <Text size="sm" c="dimmed">
            <NextMantineAnchor href={`/evaluations/syllabuses/${institutionId}`} fw={600}>
              View syllabuses for this school
            </NextMantineAnchor>
          </Text>
        ) : null}

        {institutionId && report && viewableIds.includes(institutionId) ? (
          <Stack gap="xl">
            <Grid gap="md">
              <GridCol span={{ base: 12, sm: 4 }}>
                <Paper withBorder shadow="sm" radius="lg" p="md" h="100%">
                  <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                    School average
                  </Text>
                  <Text size="xl" fw={600} mt="sm">
                    {report.schoolAvgPct === null
                      ? "—"
                      : `${Math.round(report.schoolAvgPct * 10) / 10}%`}
                  </Text>
                </Paper>
              </GridCol>
              <GridCol span={{ base: 12, sm: 8 }}>
                <Paper withBorder shadow="sm" radius="lg" p="md" h="100%">
                  <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                    By class
                  </Text>
                  <Stack gap={4} mt="sm">
                    {report.byClass.map((c) => (
                      <Text key={c.classId || c.className} size="sm">
                        <Text component="span" fw={600}>
                          {c.className}
                        </Text>
                        {`: ${Math.round(c.avgPct * 10) / 10}% (${c.recordCount} scores)`}
                      </Text>
                    ))}
                  </Stack>
                </Paper>
              </GridCol>
            </Grid>

            <Paper withBorder shadow="sm" radius="lg" style={{ overflow: "hidden" }}>
              <Box p="md" style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}>
                <Title order={2} size="h5">
                  By student
                </Title>
              </Box>
              <div style={{ overflowX: "auto" }}>
                <Table striped highlightOnHover>
                  <TableThead>
                    <TableTr>
                      <TableTh>Student</TableTh>
                      <TableTh>Avg %</TableTh>
                      <TableTh>Scores</TableTh>
                    </TableTr>
                  </TableThead>
                  <TableTbody>
                    {report.byStudent.map((s) => (
                      <TableTr key={s.studentId}>
                        <TableTd>
                          {s.lastName}, {s.firstName}
                        </TableTd>
                        <TableTd>{Math.round(s.avgPct * 10) / 10}%</TableTd>
                        <TableTd c="dimmed">{s.recordCount}</TableTd>
                      </TableTr>
                    ))}
                  </TableTbody>
                </Table>
              </div>
              {report.byStudent.length === 0 ? (
                <Box p="lg">
                  <Text size="sm" c="dimmed">
                    No scores in this period.
                  </Text>
                </Box>
              ) : null}
            </Paper>

            <Paper withBorder shadow="sm" radius="lg" style={{ overflow: "hidden" }}>
              <Box p="md" style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}>
                <Title order={2} size="h5">
                  Score lines
                </Title>
              </Box>
              <Box style={{ overflow: "auto", maxHeight: "24rem" }}>
                <Table striped highlightOnHover>
                  <TableThead>
                    <TableTr>
                      <TableTh>Date</TableTh>
                      <TableTh>Student</TableTh>
                      <TableTh>Class</TableTh>
                      <TableTh>Category</TableTh>
                      <TableTh>Score</TableTh>
                      <TableTh>%</TableTh>
                    </TableTr>
                  </TableThead>
                  <TableTbody>
                    {report.rows.map((r) => (
                      <TableTr key={r.id}>
                        <TableTd style={{ whiteSpace: "nowrap" }} c="dimmed">
                          {format(r.recordedAt, "yyyy-MM-dd")}
                        </TableTd>
                        <TableTd>
                          {r.lastName}, {r.firstName}
                        </TableTd>
                        <TableTd c="dimmed">{r.className ?? "—"}</TableTd>
                        <TableTd>{r.category}</TableTd>
                        <TableTd>
                          {r.score} / {r.maxScore}
                        </TableTd>
                        <TableTd>{Math.round(r.pct * 10) / 10}%</TableTd>
                      </TableTr>
                    ))}
                  </TableTbody>
                </Table>
              </Box>
            </Paper>
          </Stack>
        ) : null}

        {institutionId && canManage ? (
          <Paper withBorder shadow="sm" radius="lg" p="xl">
            <Stack gap="md">
              <Title order={2} size="h5">
                Add score
              </Title>
              <Box component="form" action={addPerformanceRecord}>
                <input type="hidden" name="institutionId" value={institutionId} />
                <Stack gap="md">
                  <Box>
                    <Text component="label" size="xs" fw={500} htmlFor="eval-student" display="block">
                      Student
                    </Text>
                    <select
                      id="eval-student"
                      name="studentId"
                      required
                      style={fieldInputStyle}
                      defaultValue=""
                    >
                      <option value="">Select…</option>
                      {studentOptions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </Box>
                  <Box>
                    <Text component="label" size="xs" fw={500} htmlFor="eval-class" display="block">
                      Class (optional — leave blank for school-wide)
                    </Text>
                    <select id="eval-class" name="classId" style={fieldInputStyle} defaultValue="">
                      <option value="">—</option>
                      {classRows.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </Box>
                  <Grid gap="md">
                    <GridCol span={{ base: 12, sm: 6 }}>
                      <Text component="label" size="xs" fw={500} htmlFor="eval-category" display="block">
                        Category
                      </Text>
                      <input
                        id="eval-category"
                        name="category"
                        required
                        placeholder="e.g. Term 1 project"
                        style={fieldInputStyle}
                      />
                    </GridCol>
                    <GridCol span={{ base: 12, sm: 6 }}>
                      <Text size="xs" fw={500} display="block" mb={4}>
                        Score / max
                      </Text>
                      <Group gap="sm" wrap="nowrap">
                        <input
                          name="score"
                          type="number"
                          required
                          style={{ ...fieldInputStyle, maxWidth: "6rem" }}
                        />
                        <input
                          name="maxScore"
                          type="number"
                          defaultValue={100}
                          style={{ ...fieldInputStyle, maxWidth: "6rem" }}
                        />
                      </Group>
                    </GridCol>
                  </Grid>
                  <Box>
                    <Text component="label" size="xs" fw={500} htmlFor="eval-recorded" display="block">
                      Recorded date
                    </Text>
                    <input
                      id="eval-recorded"
                      type="datetime-local"
                      name="recordedAt"
                      defaultValue={format(now, "yyyy-MM-dd'T'HH:mm")}
                      style={{ ...fieldInputStyle, maxWidth: "22rem" }}
                    />
                  </Box>
                  <Box>
                    <Text component="label" size="xs" fw={500} htmlFor="eval-notes" display="block">
                      Notes
                    </Text>
                    <input id="eval-notes" name="notes" style={fieldInputStyle} />
                  </Box>
                  <Button type="submit" color="teal">
                    Save score
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Paper>
        ) : null}

        {institutionId && canManage ? (
          <Text size="sm" c="dimmed">
            <NextMantineAnchor href={`/evaluations/students/${institutionId}`} fw={600}>
              Manage students & class enrollments
            </NextMantineAnchor>
          </Text>
        ) : null}
      </Stack>
    </AppPage>
  );
}
