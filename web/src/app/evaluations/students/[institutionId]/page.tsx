import Link from "next/link";
import { format } from "date-fns";
import { notFound, redirect } from "next/navigation";
import { asc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { classes, institutions, studentClasses, students } from "@/db/schema";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { canManageInstitution, getViewableInstitutionIds } from "@/lib/school-access";
import { StudentAdmissionForm } from "@/components/student-admission-form";
import { StudentClassMatrix } from "@/components/student-class-matrix";
import { StudentListTable } from "@/components/student-list-table";

export const dynamic = "force-dynamic";

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
      <div className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-sm text-stone-700">
          You can view reports for this school, but only assigned staff can manage students. Ask an
          administrator to add you under Admin → Schools → this school.
        </p>
        <Link href="/students" className="mt-4 inline-block text-teal-800 underline">
          Back to student information
        </Link>
      </div>
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
    .where(eq(students.institutionId, institutionId))
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
    <div className="pe-app-page">
      <Link href="/students" className="text-sm font-medium text-teal-800 underline">
        ← Student information
      </Link>
      <h1 className="pe-app-h1 pe-app-h1-mt4">Manage students — {school.name}</h1>
      <p className="mt-2 text-sm text-stone-600">
        View the student roster, admit new learners, and set class membership. Students can belong to
        multiple classes.
      </p>

      <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-900">Student list</h2>
        <p className="mt-1 text-xs text-stone-600">
          Search and review everyone on file: name, roll/admission number, contact, classes, and admission date.
        </p>
        <div className="mt-4">
          <StudentListTable students={listRows} classNamesByStudentId={classNamesByStudentId} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-stone-900">Admit new student</h2>
        <p className="mt-1 text-xs text-stone-600">Full admission form — profile, contacts, documents, and previous school.</p>
        <div className="mt-4">
        <StudentAdmissionForm
          institutionId={institutionId}
          schoolName={school.name}
          defaultAdmissionDate={format(new Date(), "yyyy-MM-dd")}
        />
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-900">Class membership</h2>
        <p className="mt-1 text-xs text-stone-600">
          Check every class each student attends. This drives evaluation filters.
        </p>
        <div className="mt-4">
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
        </div>
      </section>
    </div>
  );
}
