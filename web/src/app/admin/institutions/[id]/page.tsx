import Link from "next/link";
import { notFound } from "next/navigation";
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
    <div>
      <Link href="/admin/institutions" className="text-sm font-medium text-teal-800 underline">
        ← Schools
      </Link>
      <h1 className="pe-app-h1 pe-app-h1-mt4">{inst.name}</h1>
      <p className="text-sm text-stone-600">
        Programme site: {inst.siteName} ({inst.siteCode})
      </p>

      <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-900">Classes</h2>
        <p className="mt-1 text-xs text-stone-600">
          Students can belong to several classes; staff filter reports by class.
        </p>
        <form action={adminCreateClass.bind(null, id)} className="mt-4 flex flex-wrap items-end gap-2">
          <label className="text-xs font-medium text-stone-700">
            Class name
            <input name="name" required className="ml-1 rounded border border-stone-300 px-2 py-1 text-sm" />
          </label>
          <label className="text-xs font-medium text-stone-700">
            Code <span className="text-stone-500">(optional)</span>
            <input name="code" className="ml-1 rounded border border-stone-300 px-2 py-1 text-sm" />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-semibold text-white"
          >
            Add class
          </button>
        </form>
        <ul className="mt-4 space-y-2">
          {classRows.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2 text-sm"
            >
              <span>
                <span className="font-medium text-stone-900">{c.name}</span>
                {c.code ? <span className="text-stone-500"> ({c.code})</span> : null}
              </span>
              <form action={adminDeleteClass.bind(null, c.id, id)}>
                <button type="submit" className="text-xs text-red-700 underline">
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
        {classRows.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">No classes yet.</p>
        ) : null}
      </section>

      <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-900">Staff & teachers</h2>
        <p className="mt-1 text-xs text-stone-600">
          Assigned users can enter scores and manage students for this school.
        </p>
        <form action={adminAssignStaff} className="mt-4 flex flex-wrap items-end gap-2">
          <input type="hidden" name="institutionId" value={id} />
          <label className="text-xs font-medium text-stone-700">
            User
            <select
              name="userId"
              required
              className="ml-1 mt-1 block max-w-xs rounded border border-stone-300 px-2 py-1 text-sm"
            >
              <option value="">Select…</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email} — {u.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-stone-700">
            Role
            <select name="role" className="ml-1 mt-1 block rounded border border-stone-300 px-2 py-1 text-sm">
              <option value="teacher">Teacher</option>
              <option value="management">Management</option>
            </select>
          </label>
          <button
            type="submit"
            className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-semibold text-white"
          >
            Assign
          </button>
        </form>
        <ul className="mt-4 space-y-2 text-sm">
          {staffRows.map((s) => (
            <li
              key={s.rowId}
              className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2"
            >
              <span>
                <span className="font-medium">{s.name}</span>{" "}
                <span className="text-stone-600">{s.email}</span>{" "}
                <span className="rounded bg-stone-100 px-1.5 py-0.5 text-xs uppercase text-stone-700">
                  {s.role}
                </span>
              </span>
              <form action={adminRemoveStaff.bind(null, s.rowId, id)}>
                <button type="submit" className="text-xs text-red-700 underline">
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-900">Attendance setup</h2>
        <p className="mt-1 text-xs text-stone-600">
          Message shown to families above their child&apos;s attendance (bell times, expectations,
          how to report absences). Staff record marks on{" "}
          <Link href="/attendance" className="font-semibold text-teal-800 underline">
            Attendance
          </Link>
          .
        </p>
        <form action={adminSaveAttendanceFamilyMessage.bind(null, id)} className="mt-4 space-y-3">
          <label className="block text-xs font-medium text-stone-700">
            Family-facing notes
            <textarea
              name="familyInstructions"
              rows={4}
              defaultValue={attendanceSettings?.familyInstructions ?? ""}
              placeholder="e.g. School day 8:30–15:00. Report absences before 9:00."
              className="mt-1 w-full rounded border border-stone-300 px-2 py-1.5 text-sm"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-semibold text-white"
          >
            Save attendance message
          </button>
        </form>

        <h3 className="mt-8 text-xs font-semibold uppercase tracking-wide text-stone-600">
          Family accounts (guardians)
        </h3>
        <p className="mt-1 text-xs text-stone-600">
          Link a parent or guardian&apos;s login to a student so they can view attendance on{" "}
          <strong className="font-medium text-stone-800">Family</strong> in the main menu. The
          guardian must already have a user account.
        </p>
        <form action={adminLinkGuardianToStudent} className="mt-4 flex flex-wrap items-end gap-2">
          <input type="hidden" name="institutionId" value={id} />
          <label className="text-xs font-medium text-stone-700">
            Student
            <select
              name="studentId"
              required
              className="ml-1 mt-1 block max-w-[14rem] rounded border border-stone-300 px-2 py-1 text-sm"
            >
              <option value="">Select…</option>
              {studentRows.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.lastName}, {s.firstName}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-stone-700">
            Guardian account
            <select
              name="guardianUserId"
              required
              className="ml-1 mt-1 block max-w-[16rem] rounded border border-stone-300 px-2 py-1 text-sm"
            >
              <option value="">Select…</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email} — {u.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-stone-700">
            Relationship <span className="text-stone-500">(optional)</span>
            <input
              name="relationshipLabel"
              placeholder="Mother, father…"
              className="ml-1 mt-1 block w-32 rounded border border-stone-300 px-2 py-1 text-sm"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white"
          >
            Link guardian
          </button>
        </form>
        <ul className="mt-4 space-y-2 text-sm">
          {guardianRows.map((g) => (
            <li
              key={g.linkId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-100 px-3 py-2"
            >
              <span>
                <span className="font-medium text-stone-900">
                  {g.studentFirst} {g.studentLast}
                </span>
                <span className="text-stone-600"> ← </span>
                <span className="text-stone-800">{g.guardianName}</span>{" "}
                <span className="text-stone-500">({g.guardianEmail})</span>
                {g.relationshipLabel ? (
                  <span className="ml-2 text-xs text-stone-500">{g.relationshipLabel}</span>
                ) : null}
              </span>
              <form action={adminUnlinkGuardian.bind(null, g.linkId, id)}>
                <button type="submit" className="text-xs text-red-700 underline">
                  Unlink
                </button>
              </form>
            </li>
          ))}
        </ul>
        {guardianRows.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">No guardian links yet.</p>
        ) : null}

        <h3 className="mt-8 text-xs font-semibold uppercase tracking-wide text-stone-600">
          Student portal (learner login)
        </h3>
        <p className="mt-1 text-xs text-stone-600">
          Link a student&apos;s <strong className="font-medium text-stone-800">own</strong> user
          account so they can use <strong className="font-medium text-stone-800">Student</strong> in
          the main menu (marks, attendance, downloads). One login can only be linked to one student.
        </p>
        <form action={adminLinkStudentPortal} className="mt-4 flex flex-wrap items-end gap-2">
          <input type="hidden" name="institutionId" value={id} />
          <label className="text-xs font-medium text-stone-700">
            Student
            <select
              name="studentId"
              required
              className="ml-1 mt-1 block max-w-[14rem] rounded border border-stone-300 px-2 py-1 text-sm"
            >
              <option value="">Select…</option>
              {studentRows.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.lastName}, {s.firstName}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-stone-700">
            Student login account
            <select
              name="portalUserId"
              required
              className="ml-1 mt-1 block max-w-[16rem] rounded border border-stone-300 px-2 py-1 text-sm"
            >
              <option value="">Select…</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email} — {u.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-semibold text-white"
          >
            Link portal login
          </button>
        </form>
        <ul className="mt-4 space-y-2 text-sm">
          {studentRows.map((s) => {
            const portal = s.portalUserId
              ? allUsers.find((u) => u.id === s.portalUserId)
              : null;
            return (
              <li
                key={`portal-${s.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-100 px-3 py-2"
              >
                <span>
                  <span className="font-medium text-stone-900">
                    {s.lastName}, {s.firstName}
                  </span>
                  {portal ? (
                    <span className="text-stone-600">
                      {" "}
                      → <span className="text-stone-800">{portal.email}</span>
                    </span>
                  ) : (
                    <span className="text-stone-500"> — no portal login</span>
                  )}
                </span>
                {s.portalUserId ? (
                  <form action={adminUnlinkStudentPortal.bind(null, s.id, id)}>
                    <button type="submit" className="text-xs text-red-700 underline">
                      Unlink portal
                    </button>
                  </form>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-900">Syllabuses</h2>
        <p className="mt-1 text-xs text-stone-600">
          Each school keeps its own syllabus entries (topics, outcomes, terms). Staff see them under
          Evaluations → syllabuses.
        </p>
        <form action={adminCreateSyllabus.bind(null, id)} className="mt-4 space-y-3">
          <label className="block text-xs font-medium text-stone-700">
            Title
            <input
              name="title"
              required
              placeholder="e.g. Year 9 English"
              className="mt-1 w-full rounded border border-stone-300 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="block text-xs font-medium text-stone-700">
            Short summary <span className="font-normal text-stone-500">(optional)</span>
            <input name="summary" className="mt-1 w-full rounded border border-stone-300 px-2 py-1.5 text-sm" />
          </label>
          <label className="block text-xs font-medium text-stone-700">
            Content
            <textarea
              name="body"
              required
              rows={6}
              placeholder="Outline units, learning outcomes, assessment weightings…"
              className="mt-1 w-full rounded border border-stone-300 px-2 py-1.5 font-mono text-sm"
            />
          </label>
          <label className="block text-xs font-medium text-stone-700">
            Sort order
            <input
              name="sortOrder"
              type="number"
              defaultValue={0}
              className="mt-1 w-24 rounded border border-stone-300 px-2 py-1.5 text-sm"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-semibold text-white"
          >
            Add syllabus
          </button>
        </form>

        <ul className="mt-8 space-y-6 border-t border-stone-100 pt-6">
          {syllabusRows.map((sy) => (
            <li key={sy.id} className="rounded-lg border border-stone-100 bg-stone-50/80 p-4">
              <form action={adminUpdateSyllabus.bind(null, sy.id, id)} className="space-y-3">
                <label className="block text-xs font-medium text-stone-700">
                  Title
                  <input
                    name="title"
                    required
                    defaultValue={sy.title}
                    className="mt-1 w-full rounded border border-stone-300 bg-white px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="block text-xs font-medium text-stone-700">
                  Summary
                  <input
                    name="summary"
                    defaultValue={sy.summary ?? ""}
                    className="mt-1 w-full rounded border border-stone-300 bg-white px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="block text-xs font-medium text-stone-700">
                  Content
                  <textarea
                    name="body"
                    required
                    rows={5}
                    defaultValue={sy.body}
                    className="mt-1 w-full rounded border border-stone-300 bg-white px-2 py-1.5 font-mono text-sm"
                  />
                </label>
                <label className="block text-xs font-medium text-stone-700">
                  Sort order
                  <input
                    name="sortOrder"
                    type="number"
                    defaultValue={sy.sortOrder}
                    className="mt-1 w-24 rounded border border-stone-300 bg-white px-2 py-1.5 text-sm"
                  />
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium"
                  >
                    Save
                  </button>
                </div>
              </form>
              <form action={adminDeleteSyllabus.bind(null, sy.id, id)} className="mt-2">
                <button type="submit" className="text-xs text-red-700 underline">
                  Delete syllabus
                </button>
              </form>
            </li>
          ))}
        </ul>
        {syllabusRows.length === 0 ? (
          <p className="mt-4 text-sm text-stone-500">No syllabuses yet — add one above.</p>
        ) : null}
      </section>

      <p className="mt-8 text-sm text-stone-600">
        <Link href={`/evaluations/syllabuses/${id}`} className="font-semibold text-teal-800 underline">
          View syllabuses (staff)
        </Link>
        {" · "}
        <Link href={`/evaluations/students/${id}`} className="font-semibold text-teal-800 underline">
          Manage students & enrollments
        </Link>{" "}
        (staff) ·{" "}
        <Link href="/students" className="font-semibold text-teal-800 underline">
          Student information
        </Link>
        {" · "}
        <Link href="/evaluations" className="font-semibold text-teal-800 underline">
          Evaluation reports
        </Link>
      </p>
    </div>
  );
}
