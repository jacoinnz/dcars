import Link from "next/link";
import { format } from "date-fns";
import { desc, eq } from "drizzle-orm";
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
import { getPortalStudentIdForUser } from "@/lib/student-portal-access";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your marks — Youth programme",
};

export default async function StudentMarksPage() {
  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) redirect("/login");

  const studentId = await getPortalStudentIdForUser(session.user.id);
  const db = getDb();

  if (!studentId) {
    return (
      <div className="pe-app-page">
        <Link href="/student" className="text-sm font-medium text-teal-800 underline">
          ← Student panel
        </Link>
        <h1 className="pe-app-h1 pe-app-h1-mt4">Your marks</h1>
        <p className="mt-8 text-sm text-stone-600">
          Your account is not linked to a student profile. See{" "}
          <Link href="/student" className="font-semibold text-teal-800 underline">
            Student panel
          </Link>{" "}
          for next steps.
        </p>
      </div>
    );
  }

  const [ctx] = await db
    .select({
      student: students,
      institutionName: institutions.name,
      siteName: sites.name,
    })
    .from(students)
    .innerJoin(institutions, eq(students.institutionId, institutions.id))
    .innerJoin(sites, eq(institutions.siteId, sites.id))
    .where(eq(students.id, studentId))
    .limit(1);

  const perfRows = await db
    .select({
      pr: performanceRecords,
      className: classes.name,
    })
    .from(performanceRecords)
    .leftJoin(classes, eq(performanceRecords.classId, classes.id))
    .where(eq(performanceRecords.studentId, studentId))
    .orderBy(desc(performanceRecords.recordedAt));

  const examRows = await db
    .select({
      em: examMarks,
      seriesTitle: institutionExamSeries.title,
    })
    .from(examMarks)
    .innerJoin(institutionExamSeries, eq(examMarks.examSeriesId, institutionExamSeries.id))
    .where(eq(examMarks.studentId, studentId))
    .orderBy(desc(examMarks.updatedAt));

  return (
    <div className="pe-app-page">
      <Link href="/student" className="text-sm font-medium text-teal-800 underline">
        ← Student panel
      </Link>
      <h1 className="pe-app-h1 pe-app-h1-mt4">Your marks</h1>
      {ctx ? (
        <p className="mt-2 text-sm text-stone-600">
          {ctx.student.firstName} {ctx.student.lastName} · {ctx.institutionName} ({ctx.siteName})
        </p>
      ) : null}

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900">Coursework &amp; evaluations</h2>
        {perfRows.length === 0 ? (
          <p className="mt-3 text-sm text-stone-600">No scores recorded yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-stone-600">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Recorded</th>
                </tr>
              </thead>
              <tbody>
                {perfRows.map(({ pr, className }) => (
                  <tr key={pr.id} className="border-t border-stone-100">
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
                ))}
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
                  <th className="px-4 py-3">Exam period</th>
                  <th className="px-4 py-3">Paper</th>
                  <th className="px-4 py-3">Mark</th>
                </tr>
              </thead>
              <tbody>
                {examRows.map(({ em, seriesTitle }) => {
                  const pct = em.maxScore > 0 ? Math.round((em.score / em.maxScore) * 1000) / 10 : null;
                  return (
                    <tr key={em.id} className="border-t border-stone-100">
                      <td className="px-4 py-3 text-stone-800">{seriesTitle}</td>
                      <td className="px-4 py-3">{em.paperName}</td>
                      <td className="px-4 py-3 tabular-nums">
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
    </div>
  );
}
