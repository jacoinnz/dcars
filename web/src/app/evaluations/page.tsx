import Link from "next/link";
import { endOfDay, format, startOfDay, subMonths } from "date-fns";
import { asc, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { classes, institutions, sites, students } from "@/db/schema";
import { addPerformanceRecord } from "@/app/evaluations/actions";
import { NextMantineAnchor } from "@/components/next-mantine-links";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { fetchPerformanceForReport } from "@/lib/evaluation-report";
import { canManageInstitution, getViewableInstitutionIds } from "@/lib/school-access";
import { AppPage } from "@/components/app-page";
import { Stack, Text, Title } from "@mantine/core";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Evaluations — Youth programme",
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
      .where(eq(students.institutionId, institutionId))
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
      <Stack gap="lg">
      <NextMantineAnchor href="/students" size="sm" fw={500}>
        ← Student information
      </NextMantineAnchor>
      <Title order={1}>Evaluation reports</Title>
      <Text c="dimmed" size="sm" maw={520}>
        Filter by school and optionally by one or more classes. Scores are averaged as a percentage
        of the maximum. Staff assigned to a school can enter results; programme site access allows
        read-only visibility where configured.
      </Text>

      {viewableIds.length === 0 ? (
        <p className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          No schools are available yet. Super admins can add schools under{" "}
          <Link href="/admin/institutions" className="font-semibold underline">
            Admin → Schools
          </Link>{" "}
          and assign staff.
        </p>
      ) : null}

      <form
        className="mt-8 flex flex-wrap items-end gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
        method="get"
      >
        <label className="text-xs font-medium text-stone-700">
          School
          <select
            name="institutionId"
            required
            defaultValue={institutionId || undefined}
            className="ml-1 mt-1 block min-w-[14rem] rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
          >
            <option value="">Select…</option>
            {institutionOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} — {o.siteName}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-stone-700">
          From
          <input
            type="date"
            name="from"
            defaultValue={fromInput}
            className="ml-1 mt-1 block rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="text-xs font-medium text-stone-700">
          To
          <input
            type="date"
            name="to"
            defaultValue={toInput}
            className="ml-1 mt-1 block rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
          />
        </label>
        {institutionId && classRows.length > 0 ? (
          <fieldset className="min-w-[12rem]">
            <legend className="text-xs font-medium text-stone-700">Classes (optional)</legend>
            <div className="mt-1 max-h-28 space-y-1 overflow-y-auto rounded border border-stone-200 bg-stone-50 px-2 py-2 text-sm">
              {classRows.map((c) => (
                <label key={c.id} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    name="classId"
                    value={c.id}
                    defaultChecked={classIds.includes(c.id)}
                  />
                  <span>{c.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}
        <button
          type="submit"
          className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-semibold text-white hover:bg-stone-800"
        >
          Apply
        </button>
      </form>

      {institutionId && viewableIds.includes(institutionId) ? (
        <p className="mt-4 text-sm text-stone-600">
          <Link
            href={`/evaluations/syllabuses/${institutionId}`}
            className="font-semibold text-teal-800 underline"
          >
            View syllabuses for this school
          </Link>
        </p>
      ) : null}

      {institutionId && report && viewableIds.includes(institutionId) ? (
        <div className="mt-10 space-y-8">
          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase text-stone-500">School average</p>
              <Text size="xl" fw={600} mt={4}>
                {report.schoolAvgPct === null
                  ? "—"
                  : `${Math.round(report.schoolAvgPct * 10) / 10}%`}
              </Text>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:col-span-2">
              <p className="text-xs font-semibold uppercase text-stone-500">By class</p>
              <ul className="mt-2 space-y-1 text-sm text-stone-800">
                {report.byClass.map((c) => (
                  <li key={c.classId || c.className}>
                    <span className="font-medium">{c.className}</span>:{" "}
                    {Math.round(c.avgPct * 10) / 10}% ({c.recordCount} scores)
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-stone-900">By student</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase text-stone-600">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Avg %</th>
                    <th className="px-4 py-3">Scores</th>
                  </tr>
                </thead>
                <tbody>
                  {report.byStudent.map((s) => (
                    <tr key={s.studentId} className="border-t border-stone-100">
                      <td className="px-4 py-3">
                        {s.lastName}, {s.firstName}
                      </td>
                      <td className="px-4 py-3">{Math.round(s.avgPct * 10) / 10}%</td>
                      <td className="px-4 py-3 text-stone-600">{s.recordCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {report.byStudent.length === 0 ? (
              <p className="px-4 py-6 text-sm text-stone-600">No scores in this period.</p>
            ) : null}
          </section>

          <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-stone-900">Score lines</h2>
            </div>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="sticky top-0 bg-stone-50 text-xs uppercase text-stone-600">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">%</th>
                  </tr>
                </thead>
                <tbody>
                  {report.rows.map((r) => (
                    <tr key={r.id} className="border-t border-stone-100">
                      <td className="whitespace-nowrap px-4 py-2 text-stone-700">
                        {format(r.recordedAt, "yyyy-MM-dd")}
                      </td>
                      <td className="px-4 py-2">
                        {r.lastName}, {r.firstName}
                      </td>
                      <td className="px-4 py-2 text-stone-600">{r.className ?? "—"}</td>
                      <td className="px-4 py-2">{r.category}</td>
                      <td className="px-4 py-2">
                        {r.score} / {r.maxScore}
                      </td>
                      <td className="px-4 py-2">{Math.round(r.pct * 10) / 10}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}

      {institutionId && canManage ? (
        <section className="mt-12 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-stone-900">Add score</h2>
          <form action={addPerformanceRecord} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="institutionId" value={institutionId} />
            <label className="text-xs font-medium text-stone-700 sm:col-span-2">
              Student
              <select
                name="studentId"
                required
                className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
              >
                <option value="">Select…</option>
                {studentOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-stone-700 sm:col-span-2">
              Class (optional — leave blank for school-wide)
              <select
                name="classId"
                className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
              >
                <option value="">—</option>
                {classRows.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-stone-700">
              Category
              <input
                name="category"
                required
                placeholder="e.g. Term 1 project"
                className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs font-medium text-stone-700">
              Score / max
              <div className="mt-1 flex gap-2">
                <input
                  name="score"
                  type="number"
                  required
                  className="w-24 rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
                />
                <input
                  name="maxScore"
                  type="number"
                  defaultValue={100}
                  className="w-24 rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
                />
              </div>
            </label>
            <label className="text-xs font-medium text-stone-700 sm:col-span-2">
              Recorded date
              <input
                type="datetime-local"
                name="recordedAt"
                defaultValue={format(now, "yyyy-MM-dd'T'HH:mm")}
                className="mt-1 w-full max-w-xs rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs font-medium text-stone-700 sm:col-span-2">
              Notes
              <input name="notes" className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm" />
            </label>
            <button
              type="submit"
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white sm:col-span-2"
            >
              Save score
            </button>
          </form>
        </section>
      ) : null}

      {institutionId && canManage ? (
        <p className="mt-8 text-sm text-stone-600">
          <Link
            href={`/evaluations/students/${institutionId}`}
            className="font-semibold text-teal-800 underline"
          >
            Manage students & class enrollments
          </Link>
        </p>
      ) : null}
      </Stack>
    </AppPage>
  );
}
