import Link from "next/link";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { and, asc, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import {
  attendanceRecords,
  institutionAttendanceSettings,
  institutions,
  sites,
  studentGuardians,
  students,
} from "@/db/schema";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { studentIsActive } from "@/lib/students-active";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Family attendance — Youth programme",
};

function labelStatus(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export default async function FamilyAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const sp = await searchParams;

  const now = new Date();
  const fromStr =
    typeof sp.from === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.from)
      ? sp.from
      : format(startOfMonth(now), "yyyy-MM-dd");
  const toStr =
    typeof sp.to === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.to)
      ? sp.to
      : format(endOfMonth(now), "yyyy-MM-dd");

  const db = getDb();

  const links = await db
    .select({
      studentId: studentGuardians.studentId,
      relationshipLabel: studentGuardians.relationshipLabel,
    })
    .from(studentGuardians)
    .where(eq(studentGuardians.guardianUserId, userId));

  const guardianIds = links.map((l) => l.studentId);

  const relByStudent = new Map<string, string | null>();
  for (const l of links) {
    relByStudent.set(l.studentId, l.relationshipLabel);
  }

  const studRows =
    guardianIds.length === 0
      ? []
      : await db
          .select({
            student: students,
            institutionName: institutions.name,
            siteName: sites.name,
          })
          .from(students)
          .innerJoin(institutions, eq(students.institutionId, institutions.id))
          .innerJoin(sites, eq(institutions.siteId, sites.id))
          .where(and(inArray(students.id, guardianIds), studentIsActive))
          .orderBy(asc(students.lastName), asc(students.firstName));

  const instIds = [...new Set(studRows.map((r) => r.student.institutionId))];
  const settingsRows =
    instIds.length === 0
      ? []
      : await db
          .select()
          .from(institutionAttendanceSettings)
          .where(inArray(institutionAttendanceSettings.institutionId, instIds));

  const instructionsByInst = new Map<string, string | null>();
  for (const s of settingsRows) {
    instructionsByInst.set(s.institutionId, s.familyInstructions);
  }

  const attByStudent = new Map<
    string,
    { sessionDate: string; status: string; notes: string | null }[]
  >();

  if (guardianIds.length) {
    const attRows = await db
      .select({
        studentId: attendanceRecords.studentId,
        sessionDate: attendanceRecords.sessionDate,
        status: attendanceRecords.status,
        notes: attendanceRecords.notes,
      })
      .from(attendanceRecords)
      .where(
        and(
          inArray(attendanceRecords.studentId, guardianIds),
          gte(attendanceRecords.sessionDate, fromStr),
          lte(attendanceRecords.sessionDate, toStr),
        ),
      )
      .orderBy(desc(attendanceRecords.sessionDate));

    for (const a of attRows) {
      const list = attByStudent.get(a.studentId) ?? [];
      list.push({
        sessionDate: a.sessionDate,
        status: a.status,
        notes: a.notes,
      });
      attByStudent.set(a.studentId, list);
    }
  }

  const shownInstNotes = new Set<string>();

  return (
    <div className="pe-app-page">
      <Link href="/parents" className="text-sm font-medium text-teal-800 underline">
        ← Parents panel
      </Link>
      <h1 className="pe-app-h1 pe-app-h1-mt4">Family attendance</h1>
      <p className="pe-app-lead">
        See attendance recorded for your linked children. Your school shares notes here when they
        set them up under Admin → Schools → Attendance setup.
      </p>

      <form className="mt-8 flex flex-wrap items-end gap-2" method="get">
        <label className="text-xs font-medium text-stone-700">
          From
          <input
            name="from"
            type="date"
            defaultValue={fromStr}
            className="ml-1 mt-1 block rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="text-xs font-medium text-stone-700">
          To
          <input
            name="to"
            type="date"
            defaultValue={toStr}
            className="ml-1 mt-1 block rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-semibold text-white hover:bg-stone-800"
        >
          Apply
        </button>
      </form>

      {studRows.length === 0 ? (
        <div className="mt-8 rounded-lg border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-700">
          <p className="font-medium text-stone-900">No linked students yet</p>
          <p className="mt-2">
            Ask your school administrator to connect your account to your child&apos;s student
            record (Admin → Schools → Attendance setup → Guardian links). You will then see marks
            here after staff record attendance.
          </p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-8">
          {studRows.map(({ student: s, institutionName, siteName }) => {
            const rel = relByStudent.get(s.id);
            const rows = attByStudent.get(s.id) ?? [];
            const note = instructionsByInst.get(s.institutionId);
            const showSchoolNote = note && !shownInstNotes.has(s.institutionId);
            if (showSchoolNote) shownInstNotes.add(s.institutionId);

            return (
              <section
                key={s.id}
                className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
              >
                <div className="border-b border-stone-200 px-4 py-4">
                  <h2 className="text-lg font-semibold text-stone-900">
                    {s.firstName} {s.lastName}
                  </h2>
                  <p className="mt-1 text-sm text-stone-600">
                    {institutionName} — {siteName}
                    {rel ? (
                      <>
                        {" "}
                        · <span className="text-stone-700">{rel}</span>
                      </>
                    ) : null}
                  </p>
                  {showSchoolNote ? (
                    <div className="mt-3 rounded-lg border border-teal-100 bg-teal-50/80 px-3 py-2 text-sm text-teal-950">
                      <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
                        From your school
                      </p>
                      <p className="mt-1 whitespace-pre-wrap">{note}</p>
                    </div>
                  ) : null}
                </div>

                {rows.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-stone-600">
                    No attendance recorded in this date range.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-stone-50 text-xs uppercase text-stone-600">
                        <tr>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r) => (
                          <tr key={r.sessionDate} className="border-t border-stone-100">
                            <td className="whitespace-nowrap px-4 py-3 text-stone-900">
                              {format(new Date(`${r.sessionDate}T12:00:00`), "EEE d MMM yyyy")}
                            </td>
                            <td className="px-4 py-3 font-medium text-stone-900">
                              {labelStatus(r.status)}
                            </td>
                            <td className="max-w-md px-4 py-3 text-stone-700">
                              {r.notes ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      <p className="mt-10 text-sm text-stone-600">
        <Link href="/students" className="font-semibold text-teal-800 underline">
          Student information
        </Link>
      </p>
    </div>
  );
}
