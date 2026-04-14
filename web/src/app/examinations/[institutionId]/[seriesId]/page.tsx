import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { getDb } from "@/db";
import {
  examMarks,
  examScheduleSlots,
  institutionExamSeries,
  institutions,
  sites,
  students,
} from "@/db/schema";
import {
  addExamScheduleSlot,
  deleteExamScheduleSlot,
  deleteExamSeries,
  saveExamMarksGrid,
  updateExamMarkSheetColumns,
  updateExamRoutineBody,
  updateExamScheduleNotice,
  updateExamSeatPlanBody,
} from "@/app/examinations/actions";
import { PrintPageButton } from "@/components/print-page-button";
import { authOptions } from "@/lib/auth-options";
import { canManageInstitution, getViewableInstitutionIds } from "@/lib/school-access";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ institutionId: string; seriesId: string }> };

function papersForSeries(
  series: typeof institutionExamSeries.$inferSelect,
  slots: { paperName: string }[],
): string[] {
  const override = series.markSheetColumns
    ? series.markSheetColumns
        .split("\t")
        .map((p) => p.trim())
        .filter(Boolean)
    : [];
  if (override.length) return override;
  const fromSlots = [...new Set(slots.map((s) => s.paperName))].sort();
  if (fromSlots.length) return fromSlots;
  return ["Paper 1"];
}

export default async function ExaminationSeriesPage({ params }: Props) {
  const { institutionId, seriesId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const isSuperAdmin = Boolean(session.user.isSuperAdmin);
  const viewable = await getViewableInstitutionIds(userId, isSuperAdmin);
  if (!viewable.includes(institutionId)) redirect("/examinations");

  const canManage = await canManageInstitution(userId, isSuperAdmin, institutionId);
  const db = getDb();

  const [school] = await db
    .select({
      id: institutions.id,
      name: institutions.name,
      siteName: sites.name,
    })
    .from(institutions)
    .innerJoin(sites, eq(sites.id, institutions.siteId))
    .where(eq(institutions.id, institutionId))
    .limit(1);
  if (!school) notFound();

  const [series] = await db
    .select()
    .from(institutionExamSeries)
    .where(eq(institutionExamSeries.id, seriesId))
    .limit(1);
  if (!series || series.institutionId !== institutionId) notFound();

  const slots = await db
    .select()
    .from(examScheduleSlots)
    .where(eq(examScheduleSlots.examSeriesId, seriesId))
    .orderBy(asc(examScheduleSlots.examDate), asc(examScheduleSlots.startTime));

  const studRows = await db
    .select()
    .from(students)
    .where(eq(students.institutionId, institutionId))
    .orderBy(asc(students.lastName), asc(students.firstName));

  const markRows = await db.select().from(examMarks).where(eq(examMarks.examSeriesId, seriesId));

  const markMap = new Map<string, { score: number; maxScore: number }>();
  for (const m of markRows) {
    markMap.set(`${m.studentId}\t${m.paperName}`, { score: m.score, maxScore: m.maxScore });
  }

  const papers = papersForSeries(series, slots);
  const papersJoined = papers.join("\t");

  return (
    <div className="pe-app-page">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href={`/examinations/${institutionId}`} className="text-sm font-medium text-teal-800 underline">
            ← {school.name}
          </Link>
          <h1 className="pe-app-h1 pe-app-h1-mt3">{series.title}</h1>
          <p className="text-sm text-stone-600">
            {school.name} · {school.siteName}
          </p>
        </div>
        <PrintPageButton />
      </div>

      <nav className="mt-8 flex flex-wrap gap-3 border-b border-stone-200 pb-3 text-sm">
        <a href="#routine" className="font-medium text-teal-800 underline">
          Routine
        </a>
        <a href="#schedule" className="font-medium text-teal-800 underline">
          Schedule
        </a>
        <a href="#seat" className="font-medium text-teal-800 underline">
          Seat plan
        </a>
        <a href="#marks" className="font-medium text-teal-800 underline">
          Mark sheet
        </a>
        <a href="#report" className="font-medium text-teal-800 underline">
          Report
        </a>
      </nav>

      {/* Routine */}
      <section id="routine" className="mt-10 scroll-mt-24">
        <h2 className="text-lg font-semibold text-stone-900">Exam routine</h2>
        <p className="mt-1 text-sm text-stone-600">Rules, dress code, equipment, and general instructions.</p>
        {canManage ? (
          <form action={updateExamRoutineBody.bind(null, institutionId, seriesId)} className="mt-4 space-y-3">
            <textarea
              name="routineBody"
              rows={8}
              defaultValue={series.routineBody ?? ""}
              placeholder="Enter the exam routine…"
              className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white">
              Save routine
            </button>
          </form>
        ) : (
          <div className="mt-4 whitespace-pre-wrap rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-800 shadow-sm">
            {series.routineBody?.trim() ? series.routineBody : <span className="text-stone-500">Not published.</span>}
          </div>
        )}
      </section>

      {/* Schedule */}
      <section id="schedule" className="mt-12 scroll-mt-24">
        <h2 className="text-lg font-semibold text-stone-900">Date &amp; time schedule</h2>
        <p className="mt-1 text-sm text-stone-600">Notice shown to students and invigilators.</p>
        {canManage ? (
          <form action={updateExamScheduleNotice.bind(null, institutionId, seriesId)} className="mt-4 space-y-3">
            <textarea
              name="scheduleNoticeBody"
              rows={4}
              defaultValue={series.scheduleNoticeBody ?? ""}
              placeholder="e.g. Arrive 15 minutes early. Bring ID."
              className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white">
              Save notice
            </button>
          </form>
        ) : (
          <div className="mt-4 whitespace-pre-wrap rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-800 shadow-sm">
            {series.scheduleNoticeBody?.trim() ? (
              series.scheduleNoticeBody
            ) : (
              <span className="text-stone-500">No notice text.</span>
            )}
          </div>
        )}

        <h3 className="mt-8 text-sm font-semibold text-stone-800">Timetable</h3>
        {slots.length === 0 ? (
          <p className="mt-2 text-sm text-stone-600">No sessions scheduled yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-stone-600">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Paper</th>
                  <th className="px-4 py-3">Start</th>
                  <th className="px-4 py-3">End</th>
                  <th className="px-4 py-3">Venue</th>
                  {canManage ? <th className="px-4 py-3"></th> : null}
                </tr>
              </thead>
              <tbody>
                {slots.map((sl) => (
                  <tr key={sl.id} className="border-t border-stone-100">
                    <td className="whitespace-nowrap px-4 py-3">{sl.examDate}</td>
                    <td className="px-4 py-3 font-medium text-stone-900">{sl.paperName}</td>
                    <td className="px-4 py-3">{sl.startTime}</td>
                    <td className="px-4 py-3">{sl.endTime}</td>
                    <td className="px-4 py-3 text-stone-700">{sl.venue ?? "—"}</td>
                    {canManage ? (
                      <td className="px-4 py-3 text-right">
                        <form action={deleteExamScheduleSlot.bind(null, institutionId, seriesId, sl.id)}>
                          <button type="submit" className="text-xs text-red-700 underline">
                            Remove
                          </button>
                        </form>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {canManage ? (
          <form
            action={addExamScheduleSlot.bind(null, institutionId, seriesId)}
            className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-stone-300 bg-stone-50/50 p-4"
          >
            <label className="text-xs font-medium text-stone-700">
              Paper
              <input name="paperName" required className="ml-1 mt-1 block rounded border border-stone-300 px-2 py-1 text-sm" />
            </label>
            <label className="text-xs font-medium text-stone-700">
              Date
              <input name="examDate" type="date" required className="ml-1 mt-1 block rounded border border-stone-300 px-2 py-1 text-sm" />
            </label>
            <label className="text-xs font-medium text-stone-700">
              Start
              <input name="startTime" type="time" required className="ml-1 mt-1 block rounded border border-stone-300 px-2 py-1 text-sm" />
            </label>
            <label className="text-xs font-medium text-stone-700">
              End
              <input name="endTime" type="time" required className="ml-1 mt-1 block rounded border border-stone-300 px-2 py-1 text-sm" />
            </label>
            <label className="text-xs font-medium text-stone-700">
              Venue
              <input name="venue" className="ml-1 mt-1 block rounded border border-stone-300 px-2 py-1 text-sm" />
            </label>
            <button type="submit" className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-semibold text-white">
              Add slot
            </button>
          </form>
        ) : null}
      </section>

      {/* Seat plan */}
      <section id="seat" className="mt-12 scroll-mt-24">
        <h2 className="text-lg font-semibold text-stone-900">Seat plan</h2>
        <p className="mt-1 text-sm text-stone-600">Room layout, rows, or seat numbers.</p>
        {canManage ? (
          <form action={updateExamSeatPlanBody.bind(null, institutionId, seriesId)} className="mt-4 space-y-3">
            <textarea
              name="seatPlanBody"
              rows={8}
              defaultValue={series.seatPlanBody ?? ""}
              placeholder="Describe seating…"
              className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white">
              Save seat plan
            </button>
          </form>
        ) : (
          <div className="mt-4 whitespace-pre-wrap rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-800 shadow-sm">
            {series.seatPlanBody?.trim() ? series.seatPlanBody : <span className="text-stone-500">Not published.</span>}
          </div>
        )}
      </section>

      {/* Mark sheet */}
      <section id="marks" className="mt-12 scroll-mt-24">
        <h2 className="text-lg font-semibold text-stone-900">Mark sheet</h2>
        <p className="mt-1 text-sm text-stone-600">
          Columns follow the timetable papers unless you override below (tab-separated titles).
        </p>
        {canManage ? (
          <form action={updateExamMarkSheetColumns.bind(null, institutionId, seriesId)} className="mt-4 space-y-2">
            <label className="block text-xs font-medium text-stone-700">
              Paper columns override (optional, tab-separated)
              <input
                name="markSheetColumns"
                defaultValue={series.markSheetColumns ?? ""}
                placeholder="Math	English	Science"
                className="mt-1 w-full max-w-xl rounded border border-stone-300 px-2 py-1.5 font-mono text-sm"
              />
            </label>
            <button type="submit" className="rounded-lg bg-stone-800 px-3 py-2 text-sm font-semibold text-white">
              Save columns
            </button>
          </form>
        ) : null}

        {studRows.length === 0 ? (
          <p className="mt-6 text-sm text-stone-600">Add students under Student information → student list to enter marks.</p>
        ) : canManage ? (
          <form action={saveExamMarksGrid.bind(null, institutionId, seriesId)} className="mt-6 overflow-x-auto">
            <input type="hidden" name="papers" value={papersJoined} />
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50">
                  <th className="sticky left-0 bg-stone-50 px-3 py-2 text-left text-xs font-semibold uppercase text-stone-600">
                    Student
                  </th>
                  {papers.map((p, i) => (
                    <th key={`${p}-${i}`} className="min-w-[5rem] px-2 py-2 text-center text-xs font-semibold text-stone-700">
                      {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {studRows.map((st) => (
                  <tr key={st.id} className="border-b border-stone-100">
                    <td className="sticky left-0 bg-white px-3 py-2 font-medium text-stone-900">
                      {st.lastName}, {st.firstName}
                    </td>
                    {papers.map((p, i) => {
                      const key = `${st.id}\t${p}`;
                      const ex = markMap.get(key);
                      return (
                        <td key={key} className="px-1 py-1">
                          <input
                            name={`sc_${st.id}_${i}`}
                            defaultValue={ex?.score ?? ""}
                            placeholder="—"
                            className="w-16 rounded border border-stone-300 px-1 py-1 text-center text-sm"
                          />
                          <input type="hidden" name={`max_${st.id}_${i}`} value={ex?.maxScore ?? 100} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="submit" className="mt-4 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white">
              Save marks
            </button>
          </form>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-stone-600">
                <tr>
                  <th className="px-4 py-3 text-left">Student</th>
                  {papers.map((p, i) => (
                    <th key={i} className="px-4 py-3 text-center">
                      {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {studRows.map((st) => (
                  <tr key={st.id} className="border-t border-stone-100">
                    <td className="px-4 py-3">
                      {st.lastName}, {st.firstName}
                    </td>
                    {papers.map((p) => {
                      const ex = markMap.get(`${st.id}\t${p}`);
                      return (
                        <td key={p} className="px-4 py-3 text-center text-stone-800">
                          {ex ? `${ex.score} / ${ex.maxScore}` : "—"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Report */}
      <section id="report" className="mt-12 scroll-mt-24">
        <h2 className="text-lg font-semibold text-stone-900">Exam report</h2>
        <p className="mt-1 text-sm text-stone-600">
          Summary from saved marks. Use print above for a PDF snapshot.
        </p>
        {studRows.length === 0 || papers.length === 0 ? (
          <p className="mt-4 text-sm text-stone-600">No data yet.</p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-stone-600">
                <tr>
                  <th className="px-4 py-3 text-left">Student</th>
                  {papers.map((p) => (
                    <th key={p} className="px-4 py-3 text-center">
                      {p} %
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center">Average %</th>
                </tr>
              </thead>
              <tbody>
                {studRows.map((st) => {
                  let sum = 0;
                  let n = 0;
                  return (
                    <tr key={st.id} className="border-t border-stone-100">
                      <td className="px-4 py-3 font-medium text-stone-900">
                        {st.lastName}, {st.firstName}
                      </td>
                      {papers.map((p) => {
                        const ex = markMap.get(`${st.id}\t${p}`);
                        const pct = ex && ex.maxScore > 0 ? Math.round((ex.score / ex.maxScore) * 1000) / 10 : null;
                        if (pct !== null) {
                          sum += pct;
                          n += 1;
                        }
                        return (
                          <td key={p} className="px-4 py-3 text-center tabular-nums text-stone-800">
                            {pct !== null ? `${pct}%` : "—"}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center font-semibold tabular-nums text-stone-900">
                        {n > 0 ? `${Math.round((sum / n) * 10) / 10}%` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <ul className="mt-8 flex flex-wrap gap-4 text-sm text-stone-600">
          <li>
            <Link href="/evaluations" className="font-semibold text-teal-800 underline">
              Evaluation scores (coursework)
            </Link>
          </li>
          <li>
            <Link href="/reports" className="font-semibold text-teal-800 underline">
              Programme PDF reports
            </Link>
          </li>
        </ul>
      </section>

      {canManage ? (
        <div className="mt-12 border-t border-stone-200 pt-8">
          <form action={deleteExamSeries.bind(null, institutionId, seriesId)}>
            <button type="submit" className="text-sm font-medium text-red-700 underline">
              Delete this exam period
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
