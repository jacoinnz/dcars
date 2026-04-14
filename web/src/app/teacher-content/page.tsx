import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { deleteTeacherContent, getTeacherUploadsForSession } from "@/app/teacher-actions";
import { TeacherContentUploadForm } from "@/components/teacher-content-upload-form";
import { authOptions } from "@/lib/auth-options";
import { getInstitutionNamesBySiteIds } from "@/lib/institution-names";
import { canOnSite } from "@/lib/permissions";
import { getSitesForParticipantEntry } from "@/lib/sites-for-user";

export const metadata = {
  title: "Teacher resources — Youth programme",
};

export const dynamic = "force-dynamic";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function TeacherContentPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const isSuperAdmin = Boolean(session.user.isSuperAdmin);

  const [uploads, uploadSites] = await Promise.all([
    getTeacherUploadsForSession(),
    getSitesForParticipantEntry(userId, isSuperAdmin),
  ]);

  const siteIds = uploadSites.map((s) => s.id);
  const institutionsBySite = await getInstitutionNamesBySiteIds(siteIds);
  const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  const rows = await Promise.all(
    uploads.map(async (u) => ({
      ...u,
      canDelete:
        isSuperAdmin ||
        (await canOnSite(userId, isSuperAdmin, u.siteId, "delete")) ||
        (u.uploadedByUserId === userId &&
          (await canOnSite(userId, isSuperAdmin, u.siteId, "create"))),
    })),
  );

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <Link href="/teachers" className="text-sm font-medium text-teal-800 underline">
        ← Teachers
      </Link>
      <div className="mb-8 mt-4 max-w-2xl">
        <h1 className="text-2xl font-semibold text-stone-900">Teacher resources</h1>
        <p className="mt-2 text-sm text-stone-600">
          Upload documents or resources for a specific school or institution within a programme site.
          Colleagues who can view that site will see them here; only people with create access can add
          files.
        </p>
      </div>

      <section className="mb-12 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-stone-900">Uploaded files</h2>
          <p className="text-xs text-stone-600">Scoped by programme site and school / institution name.</p>
        </div>
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-sm text-stone-600">No uploads yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-600">
                <tr>
                  <th className="px-4 py-3">Site</th>
                  <th className="px-4 py-3">Institution</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">File</th>
                  <th className="px-4 py-3">Uploaded</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-stone-100">
                    <td className="px-4 py-3 text-stone-800">
                      <span className="font-medium text-stone-900">{r.siteName}</span>{" "}
                      <span className="text-stone-500">({r.siteCode})</span>
                    </td>
                    <td className="max-w-[12rem] px-4 py-3 text-stone-800">{r.institutionName}</td>
                    <td className="max-w-[10rem] px-4 py-3 text-stone-800">
                      {r.title ?? <span className="text-stone-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-stone-800">
                      <span className="break-all">{r.fileName}</span>
                      <span className="block text-xs text-stone-500">{formatBytes(r.fileSize)}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-stone-600">
                      {r.uploadedAt.toLocaleDateString()}
                      <span className="block text-stone-500">{r.uploadedByEmail}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <a
                        href={`/api/teacher-content/${r.id}/download`}
                        className="font-semibold text-teal-800 underline"
                      >
                        Download
                      </a>
                      {r.canDelete ? (
                        <form action={deleteTeacherContent.bind(null, r.id)} className="mt-2">
                          <button
                            type="submit"
                            className="text-xs font-medium text-red-700 underline hover:text-red-900"
                          >
                            Remove
                          </button>
                        </form>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {uploadSites.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
          <p className="font-semibold">Cannot upload yet</p>
          <p className="mt-2 text-amber-950/90">
            Your account needs <strong className="font-medium">create</strong> permission on at least
            one programme site. Ask an administrator to update your access.
          </p>
        </div>
      ) : (
        <TeacherContentUploadForm
          sites={uploadSites.map((s) => ({ id: s.id, name: s.name, code: s.code }))}
          institutionsBySite={institutionsBySite}
          hasBlobToken={hasBlobToken}
        />
      )}

      <p className="mt-10 text-sm text-stone-600">
        <Link href="/entry" className="font-semibold text-teal-800 underline">
          Participant registration
        </Link>
      </p>
    </div>
  );
}
