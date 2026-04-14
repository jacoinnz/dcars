import Link from "next/link";
import { format } from "date-fns";
import { desc, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import {
  classes,
  examMarks,
  institutionExamSeries,
  institutions,
  performanceRecords,
  sites,
  students,
} from "@/db/schema";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { getGuardianStudentIds } from "@/lib/guardian-access";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Children’s marks — Youth programme",
};

export default async function ParentMarksPage() {
  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const guardianIds = await getGuardianStudentIds(userId);
  const db = getDb();

  if (guardianIds.length === 0) {
    return (
      <div className="pe-app-page">
        <Link href="/parents" className="text-sm font-medium text-teal-800 underline">
          ← Parents panel
        </Link>
        <h1 className="pe-app-h1 pe-app-h1-mt4">Children’s marks</h1>
        <div className="mt-8 rounded-lg border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-700">
          <p className="font-medium text-stone-900">No linked students</p>
          <p className="mt-2">
            When your school connects your login to your child’s record, coursework and exam marks
            recorded here will show up. Ask the school to add a guardian link under Admin → Schools →
            Attendance setup.
          </p>
        </div>
      </div>
    );
  }

  const studRows = await db
    .select({
      student: students,
      institutionName: institutions.name,
      siteName: sites.name,
    })
    .from(students)
    .innerJoin(institutions, eq(students.institutionId, institutions.id))
    .innerJoin(sites, eq(institutions.siteId, sites.id))
    .where(inArray(students.id, guardianIds));

  const studById = new Map(studRows.map((r) => [r.student.id, r]));

  const perfRows =
    guardianIds.length === 0
      ? []
      : await db
          .select({
            pr: performanceRecords,
            className: classes.name,
          })
          .from(performanceRecords)
          .innerJoin(students, eq(performanceRecords.studentId, students.id))
          .leftJoin(classes, eq(performanceRecords.classId, classes.id))
          .where(inArray(performanceRecords.studentId, guardianIds))
          .orderBy(desc(performanceRecords.recordedAt));

  const examRows =
    guardianIds.length === 0
      ? []
      : await db
          .select({
            em: examMarks,
            seriesTitle: institutionExamSeries.title,
          })
          .from(examMarks)
          .innerJoin(institutionExamSeries, eq(examMarks.examSeriesId, institutionExamSeries.id))
          .where(inArray(examMarks.studentId, guardianIds))
          .orderBy(desc(examMarks.updatedAt));

  return (
    <div className="pe-app-page">
      <Link href="/parents" className="text-sm font-medium text-teal-800 underline">
        ← Parents panel
      </Link>
      <h1 className="pe-app-h1 pe-app-h1-mt4">Children’s marks</h1>
      <p className="pe-app-lead">
        Read-only summary of scores staff have entered. If something is missing, contact the school —
        not all assessments may be recorded in this system yet.
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900">Coursework &amp; evaluations</h2>
        {perfRows.length === 0 ? (
          <p className="mt-3 text-sm text-stone-600">No evaluation scores recorded yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-stone-600">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">School</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Recorded</th>
                </tr>
              </thead>
              <tbody>
                {perfRows.map(({ pr, className }) => {
                  const info = studById.get(pr.studentId);
                  const name = info
                    ? `${info.student.firstName} ${info.student.lastName}`
                    : "Student";
                  return (
                    <tr key={pr.id} className="border-t border-stone-100">
                      <td className="px-4 py-3 font-medium text-stone-900">{name}</td>
                      <td className="px-4 py-3 text-stone-700">{info?.institutionName ?? "—"}</td>
                      <td className="px-4 py-3 text-stone-800">
                        {pr.category}
                        {className ? (
                          <span className="block text-xs text-stone-500">{className}</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {pr.score} / {pr.maxScore}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-stone-600">
                        {format(pr.recordedAt, "d MMM yyyy HH:mm")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900">Formal exam marks</h2>
        {examRows.length === 0 ? (
          <p className="mt-3 text-sm text-stone-600">No exam marks recorded yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-stone-600">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">School</th>
                  <th className="px-4 py-3">Exam period</th>
                  <th className="px-4 py-3">Paper</th>
                  <th className="px-4 py-3">Mark</th>
                </tr>
              </thead>
              <tbody>
                {examRows.map(({ em, seriesTitle }) => {
                  const info = studById.get(em.studentId);
                  const name = info
                    ? `${info.student.firstName} ${info.student.lastName}`
                    : "Student";
                  const pct =
                    em.maxScore > 0 ? Math.round((em.score / em.maxScore) * 1000) / 10 : null;
                  return (
                    <tr key={em.id} className="border-t border-stone-100">
                      <td className="px-4 py-3 font-medium text-stone-900">{name}</td>
                      <td className="px-4 py-3 text-stone-700">{info?.institutionName ?? "—"}</td>
                      <td className="px-4 py-3 text-stone-800">{seriesTitle}</td>
                      <td className="px-4 py-3 text-stone-800">{em.paperName}</td>
                      <td className="px-4 py-3 tabular-nums text-stone-900">
                        {em.score} / {em.maxScore}
                        {pct !== null ? (
                          <span className="ml-1 text-xs text-stone-500">({pct}%)</span>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-10 text-sm text-stone-600">
        <Link href="/family" className="font-semibold text-teal-800 underline">
          Family attendance
        </Link>
        {" · "}
        <Link href="/parents" className="font-semibold text-teal-800 underline">
          Parents panel
        </Link>
      </p>
    </div>
  );
}
