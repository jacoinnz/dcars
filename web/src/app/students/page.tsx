import { Alert, Stack, Text, Title } from "@mantine/core";
import { asc, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AppPage } from "@/components/app-page";
import { StudentsInfoTabs } from "@/components/students-info-tabs";
import { NextMantineAnchor } from "@/components/next-mantine-links";
import { getDb } from "@/db";
import { institutions, sites } from "@/db/schema";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { getViewableInstitutionIds } from "@/lib/school-access";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Students Info — Youth programme",
};

export default async function StudentsHubPage() {
  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const isSuperAdmin = Boolean(session.user.isSuperAdmin);

  type SchoolRow = { id: string; name: string; siteName: string };
  let schoolRows: SchoolRow[] = [];
  let loadError: string | null = null;

  try {
    const viewableIds = await getViewableInstitutionIds(userId, isSuperAdmin);
    const db = getDb();
    schoolRows =
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
  } catch (err) {
    const digest =
      typeof err === "object" && err !== null && "digest" in err
        ? String((err as { digest?: unknown }).digest)
        : "";
    console.error("[students]", digest ? `${digest} ` : "", err);
    loadError =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error";
  }

  if (loadError) {
    const devDetail = process.env.NODE_ENV === "development" ? loadError : null;
    return (
      <AppPage>
        <Stack gap="md">
          <Title order={1}>Students Info</Title>
          <Alert color="red" title="This page couldn’t load">
            <Text size="sm">
              {devDetail ??
                "Could not load the school list. Participant registration and other flows use different queries—your database URL can still be correct while this request fails (e.g. Neon timeout or a schema mismatch)."}
            </Text>
            <Text size="sm" mt="sm" c="dimmed">
              Check the deployment <strong>Functions</strong> / runtime logs on Vercel for lines starting with{" "}
              <code>[students]</code>. If you recently changed schema, run <code>npm run db:push</code> against the same
              database.
            </Text>
          </Alert>
        </Stack>
      </AppPage>
    );
  }

  return (
    <AppPage maxWidth="wide">
      <Stack gap="lg">
        <Stack gap="xs">
          <Title order={1}>Students Info</Title>
          <Text c="dimmed" size="sm" maw={900}>
            New-student registration: complete the admission form below.
          </Text>
        </Stack>

        <StudentsInfoTabs schoolRows={schoolRows} />

        <Text size="sm" c="dimmed" mt="md">
          <NextMantineAnchor href="/admin/institutions" fw={600}>
            Admin → Schools
          </NextMantineAnchor>{" "}
          for staff assignment, guardian links, and attendance messages to families.
        </Text>
      </Stack>
    </AppPage>
  );
}
