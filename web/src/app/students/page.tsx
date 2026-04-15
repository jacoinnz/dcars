import type { Metadata } from "next";
import { Alert, Paper, Stack, Text, Title } from "@mantine/core";
import { asc, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AppPage } from "@/components/app-page";
import { StudentDeleteRecordPanel } from "@/components/student-delete-record-panel";
import { StudentListTable } from "@/components/student-list-table";
import { StudentsInfoTabs } from "@/components/students-info-tabs";
import { NextMantineAnchor } from "@/components/next-mantine-links";
import { getDb } from "@/db";
import { institutions, sites } from "@/db/schema";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { parseStudentsTab } from "@/lib/students-page-tab";
import { getRecoverableDeletedStudents, getStudentRosterForInstitutions } from "@/lib/students-roster";
import { getViewableInstitutionIds } from "@/lib/school-access";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}): Promise<Metadata> {
  const tab = parseStudentsTab((await searchParams).tab);
  if (tab === "add-student") {
    return { title: "New student registration — Youth programme" };
  }
  if (tab === "delete-record") {
    return { title: "Delete student record — Youth programme" };
  }
  return { title: "Student list — Youth programme" };
}

export default async function StudentsHubPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const tab = parseStudentsTab((await searchParams).tab);

  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const isSuperAdmin = Boolean(session.user.isSuperAdmin);

  type SchoolRow = { id: string; name: string; siteName: string };
  let schoolRows: SchoolRow[] = [];
  let loadError: string | null = null;

  try {
    const viewableIds = await getViewableInstitutionIds(userId, isSuperAdmin);
    const db = getDb();
    schoolRows =
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
  } catch (err) {
    const digest =
      typeof err === "object" && err !== null && "digest" in err
        ? String((err as { digest?: unknown }).digest)
        : "";
    console.error("[students]", digest ? `${digest} ` : "", err);
    loadError =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error";
  }

  if (loadError) {
    const devDetail = process.env.NODE_ENV === "development" ? loadError : null;
    return (
      <AppPage>
        <Stack gap="md">
          <Title order={1}>Students Info</Title>
          <Alert color="red" title="This page couldn’t load">
            <Text size="sm">
              {devDetail ??
                "Could not load the school list. Participant registration and other flows use different queries—your database URL can still be correct while this request fails (e.g. Neon timeout or a schema mismatch)."}
            </Text>
            <Text size="sm" mt="sm" c="dimmed">
              Check the deployment <strong>Functions</strong> / runtime logs on Vercel for lines starting with{" "}
              <code>[students]</code>. If you recently changed schema, run <code>npm run db:push</code> against the same
              database.
            </Text>
          </Alert>
        </Stack>
      </AppPage>
    );
  }

  const institutionIds = schoolRows.map((s) => s.id);

  if (tab === "delete-record") {
    const [rosterData, recData] = await Promise.all([
      getStudentRosterForInstitutions(institutionIds),
      getRecoverableDeletedStudents(institutionIds),
    ]);
    const allSchoolNames = new Set([
      ...rosterData.students.map((r) => r.schoolName),
      ...recData.students.map((r) => r.schoolName),
    ]);
    const classNamesMerged = { ...rosterData.classNamesByStudentId, ...recData.classNamesByStudentId };
    const recoverableSerialized = recData.students.map((r) => ({
      id: r.id,
      firstName: r.firstName,
      middleName: r.middleName,
      lastName: r.lastName,
      admissionNumber: r.admissionNumber,
      gender: r.gender,
      phone: r.phone,
      email: r.email,
      admissionDate: r.admissionDate,
      schoolName: r.schoolName,
      deletedAtIso: r.deletedAt.toISOString(),
    }));

    return (
      <AppPage maxWidth="wide">
        <Stack gap="lg">
          <Stack gap="xs">
            <Title order={1}>Delete student record</Title>
            <Text c="dimmed" size="sm" maw={900}>
              Select students to remove from the active roster, or restore learners deleted within the last{" "}
              <strong>7 days</strong>. You need staff permission for each school.{" "}
              <NextMantineAnchor href="/students" fw={600}>
                Student list
              </NextMantineAnchor>{" "}
              shows everyone currently on file.
            </Text>
          </Stack>

          <StudentDeleteRecordPanel
            roster={rosterData.students}
            recoverable={recoverableSerialized}
            classNamesByStudentId={classNamesMerged}
            showSchoolColumn={allSchoolNames.size > 1}
          />

          <Text size="sm" c="dimmed">
            <NextMantineAnchor href="/students?tab=add-student" fw={600}>
              New student registration
            </NextMantineAnchor>
          </Text>
        </Stack>
      </AppPage>
    );
  }

  if (tab === "add-student") {
    return (
      <AppPage maxWidth="wide">
        <Stack gap="lg">
          <Stack gap="xs">
            <Title order={1}>New student registration</Title>
          </Stack>

          <StudentsInfoTabs schoolRows={schoolRows} />

          <Text size="sm" c="dimmed" mt="md">
            <NextMantineAnchor href="/students" fw={600}>
              ← Student list
            </NextMantineAnchor>{" "}
            ·{" "}
            <NextMantineAnchor href="/admin/institutions" fw={600}>
              Admin → Schools
            </NextMantineAnchor>{" "}
            for staff assignment, guardian links, and attendance messages to families.
          </Text>
        </Stack>
      </AppPage>
    );
  }

  const { students: roster, classNamesByStudentId } = await getStudentRosterForInstitutions(institutionIds);
  const distinctSchools = new Set(roster.map((r) => r.schoolName));

  if (tab === "student-list") {
    return (
      <AppPage maxWidth="wide">
        <Paper withBorder shadow="sm" p={{ base: "md", lg: "xl" }} radius="lg">
          <StudentListTable
            students={roster}
            classNamesByStudentId={classNamesByStudentId}
            showSchoolColumn={distinctSchools.size > 1}
            emptyHintNoStudents="No students recorded yet."
            emptyHintNoMatch="No students match your search."
          />
        </Paper>
      </AppPage>
    );
  }

  return (
    <AppPage maxWidth="wide">
      <Stack gap="lg">
        <Stack gap="xs">
          <Title order={1}>Student list</Title>
          <Text c="dimmed" size="sm" maw={900}>
            All students on file for schools you can access (including when you open <strong>/students</strong>{" "}
            without a tab). Use{" "}
            <NextMantineAnchor href="/students?tab=add-student" fw={600}>
              new student registration
            </NextMantineAnchor>{" "}
            only to admit a new learner, or a school workspace for class membership.
          </Text>
        </Stack>

        <Paper withBorder shadow="sm" p={{ base: "md", lg: "xl" }} radius="lg">
          <StudentListTable
            students={roster}
            classNamesByStudentId={classNamesByStudentId}
            showSchoolColumn={distinctSchools.size > 1}
            emptyHintNoStudents="No students recorded yet. Use new student registration to add a learner."
            emptyHintNoMatch="No students match your search."
          />
        </Paper>

        <Text size="sm" c="dimmed">
          <NextMantineAnchor href="/students?tab=add-student" fw={600}>
            New student registration
          </NextMantineAnchor>{" "}
          ·{" "}
          <NextMantineAnchor href="/admin/institutions" fw={600}>
            Admin → Schools
          </NextMantineAnchor>{" "}
          for staff assignment and guardian links.
        </Text>
      </Stack>
    </AppPage>
  );
}
