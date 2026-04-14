import Link from "next/link";
import { Anchor, Stack, Text, Title } from "@mantine/core";
import { asc, eq, inArray } from "drizzle-orm";
import { AppPage } from "@/components/app-page";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { appUsers, institutionStaff, institutions, sites } from "@/db/schema";
import { authOptions } from "@/lib/auth-options";
import { getViewableInstitutionIds } from "@/lib/school-access";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Staff directory — Youth programme",
};

function roleLabel(role: string) {
  if (role === "teacher") return "Teacher";
  if (role === "management") return "Management";
  return role;
}

export default async function StaffDirectoryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const isSuperAdmin = Boolean(session.user.isSuperAdmin);
  const viewableIds = await getViewableInstitutionIds(userId, isSuperAdmin);
  const db = getDb();

  const rows =
    viewableIds.length === 0
      ? []
      : await db
          .select({
            institutionId: institutions.id,
            institutionName: institutions.name,
            siteName: sites.name,
            email: appUsers.email,
            name: appUsers.name,
            role: institutionStaff.role,
          })
          .from(institutionStaff)
          .innerJoin(institutions, eq(institutions.id, institutionStaff.institutionId))
          .innerJoin(sites, eq(sites.id, institutions.siteId))
          .innerJoin(appUsers, eq(appUsers.id, institutionStaff.userId))
          .where(inArray(institutionStaff.institutionId, viewableIds))
          .orderBy(asc(institutions.name), asc(appUsers.email));

  return (
    <AppPage>
      <Stack gap="lg">
      <Anchor component={Link} href="/hr" size="sm" fw={500}>
        ← Human resources
      </Anchor>
      <Title order={1} mt="md">
        Staff directory
      </Title>
      <Text c="dimmed" size="sm" maw={520}>
        School staff and teachers linked in the system. Assignments are managed by administrators per
        school.
      </Text>

      {viewableIds.length === 0 ? (
        <p className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          No schools are visible to your account yet. Super admins can add schools under{" "}
          <Link href="/admin/institutions" className="font-semibold underline">
            Admin → Schools
          </Link>
          .
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-8 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
          No staff assignments yet for schools you can see. Ask an administrator to assign users
          under{" "}
          <Link href="/admin/institutions" className="font-semibold text-teal-800 underline">
            Admin → Schools
          </Link>
          .
        </p>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-stone-600">
                <tr>
                  <th className="px-4 py-3">School</th>
                  <th className="px-4 py-3">Site</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={`${r.institutionId}-${r.email}`} className="border-t border-stone-100">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/institutions/${r.institutionId}`}
                        className="font-medium text-teal-800 underline decoration-teal-200 underline-offset-2 hover:text-teal-950"
                      >
                        {r.institutionName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-stone-700">{r.siteName}</td>
                    <td className="px-4 py-3 text-stone-900">{r.name}</td>
                    <td className="px-4 py-3 text-stone-700">{r.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-stone-100 px-2 py-0.5 text-xs font-medium uppercase text-stone-800">
                        {roleLabel(r.role)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="mt-8 text-sm text-stone-600">
        <Link href="/hr" className="font-semibold text-teal-800 underline">
          Human resources hub
        </Link>
        {" · "}
        <Link href="/attendance" className="font-semibold text-teal-800 underline">
          Attendance
        </Link>
        {" · "}
        <Link href="/reports" className="font-semibold text-teal-800 underline">
          Reports
        </Link>
      </p>
      </Stack>
    </AppPage>
  );
}
