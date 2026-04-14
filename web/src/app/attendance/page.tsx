import Link from "next/link";
import { format } from "date-fns";
import { and, asc, eq, inArray } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { attendanceRecords, institutions, sites, students } from "@/db/schema";
import { ATTENDANCE_STATUSES } from "@/app/attendance/constants";
import { saveAttendanceForDate } from "@/app/attendance/actions";
import { authOptions } from "@/lib/auth-options";
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
  const session = await getServerSession(authOptions);
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
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold text-stone-900">Student attendance</h1>
      <p className="mt-2 max-w-2xl text-sm text-stone-600">
        Staff register: one mark per student per school day (present, absent, late, excused). Clear a
        row to remove a mark for that day.
      </p>

      {manageable.length === 0 ? (
        <p className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          You are not assigned as staff for any school. Ask an administrator to add you under Admin
          → Schools → Staff.
        </p>
      ) : (
        <form className="mt-8 flex flex-wrap items-end gap-3" method="get">
          <label className="text-xs font-medium text-stone-700">
            School
            <select
              name="institutionId"
              defaultValue={activeInstitutionId}
              className="ml-1 mt-1 block min-w-[14rem] rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
            >
              {institutionOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} — {o.siteName}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-stone-700">
            Date
            <input
              type="date"
              name="date"
              defaultValue={dateStr}
              className="ml-1 mt-1 block rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-semibold text-white"
          >
            Load
          </button>
        </form>
      )}

      {activeInstitutionId && studRows.length > 0 ? (
        <form
          action={saveAttendanceForDate.bind(null, activeInstitutionId, dateStr)}
          className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
        >
          <div className="border-b border-stone-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-stone-900">
              {format(new Date(`${dateStr}T12:00:00`), "EEEE d MMM yyyy")}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-stone-600">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Note</th>
                </tr>
              </thead>
              <tbody>
                {studRows.map((s) => {
                  const ex = existing.get(s.id);
                  return (
                    <tr key={s.id} className="border-t border-stone-100">
                      <td className="px-4 py-3 font-medium text-stone-900">
                        {s.lastName}, {s.firstName}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          name={`s_${s.id}`}
                          defaultValue={ex?.status ?? ""}
                          className="rounded border border-stone-300 bg-white px-2 py-1 text-sm"
                        >
                          <option value="">— no mark / clear —</option>
                          {ATTENDANCE_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="max-w-xs px-4 py-3">
                        <input
                          name={`n_${s.id}`}
                          defaultValue={ex?.notes ?? ""}
                          placeholder="Optional"
                          className="w-full rounded border border-stone-300 px-2 py-1 text-sm"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-stone-200 px-4 py-4">
            <button
              type="submit"
              className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Save attendance
            </button>
          </div>
        </form>
      ) : null}

      {activeInstitutionId && studRows.length === 0 ? (
        <p className="mt-8 text-sm text-stone-600">
          No students in this school yet. Add them under{" "}
          <Link
            href={`/evaluations/students/${activeInstitutionId}`}
            className="font-semibold text-teal-800 underline"
          >
            Evaluations → students
          </Link>
          .
        </p>
      ) : null}

      <p className="mt-10 text-sm text-stone-600">
        <Link href="/students/attendance" className="font-semibold text-teal-800 underline">
          Student attendance hub
        </Link>
        {" · "}
        <Link href="/students" className="font-semibold text-teal-800 underline">
          Student information
        </Link>
      </p>
    </div>
  );
}
