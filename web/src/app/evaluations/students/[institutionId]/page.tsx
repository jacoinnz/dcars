import { format } from "date-fns";
import { notFound, redirect } from "next/navigation";
import { and, asc, eq, inArray } from "drizzle-orm";
import { Paper, Stack, Text, Title } from "@mantine/core";
import { getDb } from "@/db";
import { classes, institutions, studentClasses, students } from "@/db/schema";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { canManageInstitution, getViewableInstitutionIds } from "@/lib/school-access";
import { studentIsActive } from "@/lib/students-active";
import { AppPage } from "@/components/app-page";
import { NextMantineAnchor } from "@/components/next-mantine-links";
import { StudentAdmissionForm } from "@/components/student-admission-form";
import { StudentClassMatrix } from "@/components/student-class-matrix";
import { StudentListTable } from "@/components/student-list-table";

export const dynamic = "force-dynamic";

/** April–March style label, e.g. `2025–2026` for mid-April 2026. */
function formatAcademicYearLabel(d = new Date()): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const start = m >= 4 ? y : y - 1;
  return `${start}–${start + 1}`;
}

type Props = { params: Promise<{ institutionId: string }> };

export default async function EvaluationStudentsPage({ params }: Props) {
  const { institutionId } = await params;
  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const isSuperAdmin = Boolean(session.user.isSuperAdmin);

  const viewable = await getViewableInstitutionIds(userId, isSuperAdmin);
  if (!viewable.includes(institutionId)) {
    redirect("/students");
  }

  const canManage = await canManageInstitution(userId, isSuperAdmin, institutionId);
  if (!canManage) {
    return (
      <AppPage>
        <Stack gap="md" maw={560}>
          <Text size="sm" c="dark.6">
            You can view reports for this school, but only assigned staff can manage students. Ask an administrator to
            add you under Admin → Schools → this school.
          </Text>
          <NextMantineAnchor href="/students" size="sm" fw={600}>
            ← Back to student information
          </NextMantineAnchor>
        </Stack>
      </AppPage>
    );
  }

  const db = getDb();
  const [school] = await db
    .select({ name: institutions.name })
    .from(institutions)
    .where(eq(institutions.id, institutionId))
    .limit(1);
  if (!school) notFound();

  const studRows = await db
    .select()
    .from(students)
    .where(and(eq(students.institutionId, institutionId), studentIsActive))
    .orderBy(asc(students.lastName), asc(students.firstName));

  const classRows = await db
    .select()
    .from(classes)
    .where(eq(classes.institutionId, institutionId))
    .orderBy(asc(classes.name));

  const sidList = studRows.map((s) => s.id);
  const enrolled =
    sidList.length === 0
      ? []
      : await db
          .select({
            studentId: studentClasses.studentId,
            classId: studentClasses.classId,
          })
          .from(studentClasses)
          .where(inArray(studentClasses.studentId, sidList));

  const classNameById = new Map(classRows.map((c) => [c.id, c.name]));
  const classNamesByStudentId: Record<string, string[]> = {};
  for (const s of studRows) {
    classNamesByStudentId[s.id] = [];
  }
  for (const e of enrolled) {
    const nm = classNameById.get(e.classId);
    if (!nm) continue;
    const arr = classNamesByStudentId[e.studentId] ?? [];
    arr.push(nm);
    classNamesByStudentId[e.studentId] = arr;
  }

  const listRows = studRows.map((s) => ({
    id: s.id,
    firstName: s.firstName,
    middleName: s.middleName,
    lastName: s.lastName,
    admissionNumber: s.admissionNumber,
    gender: s.gender,
    phone: s.phone,
    email: s.email,
    admissionDate: s.admissionDate,
  }));

  return (
    <AppPage>
      <Stack gap="xl">
        <Stack gap="xs">
          <NextMantineAnchor href="/students" size="sm" fw={600}>
            ← Student information
          </NextMantineAnchor>
          <Title order={1} size="h2" fw={700}>
            Manage students — {school.name}
          </Title>
          <Text size="sm" c="dimmed" maw={640} lh={1.65}>
            View the student roster, admit new learners, and set class membership. Students can belong to multiple
            classes.
          </Text>
        </Stack>

        <Paper withBorder shadow="sm" p={{ base: "md", lg: "xl" }} radius="lg">
          <Stack gap="md">
            <div>
              <Title order={2} size="h5" fw={600}>
                Student list
              </Title>
              <Text size="xs" c="dimmed" mt={6}>
                Search and review everyone on file: name, roll number, contact, classes, and admission date.
              </Text>
            </div>
            <StudentListTable students={listRows} classNamesByStudentId={classNamesByStudentId} />
          </Stack>
        </Paper>

        <Stack gap="md">
          <div>
            <Title order={2} size="h5" fw={600}>
              Admit new student
            </Title>
            <Text size="xs" c="dimmed" mt={6}>
              Full admission form — profile, contacts, documents, and previous school.
            </Text>
          </div>
          <StudentAdmissionForm
            institutionId={institutionId}
            schoolName={school.name}
            defaultAdmissionDate={format(new Date(), "yyyy-MM-dd")}
            defaultAcademicYear={formatAcademicYearLabel(new Date())}
            classNames={classRows.map((c) => c.name)}
          />
        </Stack>

        <Paper withBorder shadow="sm" p={{ base: "md", lg: "xl" }} radius="lg">
          <Stack gap="md">
            <div>
              <Title order={2} size="h5" fw={600}>
                Class membership
              </Title>
              <Text size="xs" c="dimmed" mt={6}>
                Set which classes each student attends. This drives evaluation filters.
              </Text>
            </div>
            <StudentClassMatrix
              students={studRows.map((s) => ({
                id: s.id,
                firstName: s.firstName,
                lastName: s.lastName,
              }))}
              classes={classRows.map((c) => ({ id: c.id, name: c.name }))}
              enrolled={enrolled.map((e) => ({
                studentId: e.studentId,
                classId: e.classId,
              }))}
            />
          </Stack>
        </Paper>
      </Stack>
    </AppPage>
  );
}
