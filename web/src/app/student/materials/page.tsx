import Link from "next/link";
import { desc, eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { institutions, students, teacherContentUploads } from "@/db/schema";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { getPortalStudentIdForUser } from "@/lib/student-portal-access";
import { studentIsActive } from "@/lib/students-active";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Study materials — Youth programme",
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function StudentMaterialsPage() {
  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) redirect("/login");

  const studentId = await getPortalStudentIdForUser(session.user.id);
  if (!studentId) redirect("/student");

  const db = getDb();
  const [ctx] = await db
    .select({
      institutionName: institutions.name,
      siteId: institutions.siteId,
      firstName: students.firstName,
      lastName: students.lastName,
    })
    .from(students)
    .innerJoin(institutions, eq(students.institutionId, institutions.id))
    .where(and(eq(students.id, studentId), studentIsActive))
    .limit(1);

  if (!ctx) redirect("/student");

  const rows = await db
    .select()
    .from(teacherContentUploads)
    .where(
      and(
        eq(teacherContentUploads.siteId, ctx.siteId),
        eq(teacherContentUploads.institutionName, ctx.institutionName),
      ),
    )
    .orderBy(desc(teacherContentUploads.createdAt));

  return (
    <div className="pe-app-page">
      <Link href="/student" className="text-sm font-medium text-teal-800 underline">
        ← Student panel
      </Link>
      <h1 className="pe-app-h1 pe-app-h1-mt4">Study materials &amp; files</h1>
      <p className="mt-2 text-sm text-stone-600">
        {ctx.firstName} {ctx.lastName} · Files uploaded for{" "}
        <span className="font-medium text-stone-800">{ctx.institutionName}</span> (same library staff
        use under Teacher resources).
      </p>

      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-stone-600">No files published for your school yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase text-stone-600">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Uploaded</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-stone-100">
                  <td className="px-4 py-3 font-medium text-stone-900">{r.title ?? "—"}</td>
                  <td className="px-4 py-3 text-stone-800">
                    <span className="break-all">{r.fileName}</span>
                    <span className="block text-xs text-stone-500">{formatBytes(r.fileSize)}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-stone-600">
                    {r.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`/api/teacher-content/${r.id}/download`}
                      className="font-semibold text-teal-800 underline"
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
