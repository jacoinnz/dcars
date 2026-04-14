import Link from "next/link";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import {
  attendanceRecords,
  institutionAttendanceSettings,
  institutions,
  sites,
  students,
} from "@/db/schema";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { getPortalStudentIdForUser } from "@/lib/student-portal-access";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your attendance — Youth programme",
};

function labelStatus(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export default async function StudentAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) redirect("/login");

  const studentId = await getPortalStudentIdForUser(session.user.id);
  if (!studentId) {
    redirect("/student");
  }

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

  const [ctx] = await db
    .select({
      student: students,
      institutionName: institutions.name,
      siteName: sites.name,
      institutionId: institutions.id,
    })
    .from(students)
    .innerJoin(institutions, eq(students.institutionId, institutions.id))
    .innerJoin(sites, eq(institutions.siteId, sites.id))
    .where(eq(students.id, studentId))
    .limit(1);

  const [settings] = await db
    .select()
    .from(institutionAttendanceSettings)
    .where(eq(institutionAttendanceSettings.institutionId, ctx!.institutionId))
    .limit(1);

  const attRows = await db
    .select()
    .from(attendanceRecords)
    .where(
      and(
        eq(attendanceRecords.studentId, studentId),
        gte(attendanceRecords.sessionDate, fromStr),
        lte(attendanceRecords.sessionDate, toStr),
      ),
    )
    .orderBy(desc(attendanceRecords.sessionDate));

  return (
    <div className="pe-app-page">
      <Link href="/student" className="text-sm font-medium text-teal-800 underline">
        ← Student panel
      </Link>
      <h1 className="pe-app-h1 pe-app-h1-mt4">Your attendance</h1>
      {ctx ? (
        <p className="mt-2 text-sm text-stone-600">
          {ctx.student.firstName} {ctx.student.lastName} · {ctx.institutionName}
        </p>
      ) : null}

      {settings?.familyInstructions ? (
        <div className="mt-6 rounded-xl border border-teal-100 bg-teal-50/80 px-4 py-3 text-sm text-teal-950">
          <p className="text-xs font-semibold uppercase text-teal-800">From your school</p>
          <p className="mt-1 whitespace-pre-wrap">{settings.familyInstructions}</p>
        </div>
      ) : null}

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

      {attRows.length === 0 ? (
        <p className="mt-8 text-sm text-stone-600">No attendance recorded in this date range.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase text-stone-600">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Note</th>
              </tr>
            </thead>
            <tbody>
              {attRows.map((r) => (
                <tr key={r.id} className="border-t border-stone-100">
                  <td className="whitespace-nowrap px-4 py-3">
                    {format(new Date(`${r.sessionDate}T12:00:00`), "EEE d MMM yyyy")}
                  </td>
                  <td className="px-4 py-3 font-medium text-stone-900">{labelStatus(r.status)}</td>
                  <td className="max-w-md px-4 py-3 text-stone-700">{r.notes ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
