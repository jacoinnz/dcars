import Link from "next/link";
import { Alert, Anchor, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { asc, eq, inArray } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { AppPage } from "@/components/app-page";
import { HubLinkCard } from "@/components/hub-link-card";
import { getDb } from "@/db";
import { institutions, sites } from "@/db/schema";
import { authOptions } from "@/lib/auth-options";
import { getViewableInstitutionIds } from "@/lib/school-access";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Student information — Youth programme",
};

export default async function StudentsHubPage() {
  const session = await getServerSession(authOptions);
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
    const digest = typeof err === "object" && err !== null && "digest" in err ? String((err as { digest?: unknown }).digest) : "";
    console.error("[students]", digest ? `${digest} ` : "", err);
    loadError =
      err instanceof Error
        ? err.message
        : typeof err === "string"
          ? err
          : "Unknown error";
  }

  if (loadError) {
    const devDetail = process.env.NODE_ENV === "development" ? loadError : null;
    return (
      <AppPage>
        <Stack gap="md">
          <Title order={1}>Student information</Title>
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
    <AppPage>
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={1}>Student information</Title>
          <Text c="dimmed" size="sm" maw={520}>
            Registration, rosters, attendance, and academic reporting — start here for anything tied to
            young people in schools on the programme.
          </Text>
        </Stack>

        <Stack component="section" gap="md">
          <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts={3}>
            Data entry &amp; daily records
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <HubLinkCard href="/entry" variant="live">
              <Text fw={600} size="sm">
                Participant registration
              </Text>
              <Text size="sm" c="dimmed" mt="xs">
                Submit a new youth registration; records can later be linked to a school student
                profile.
              </Text>
            </HubLinkCard>
            <HubLinkCard href="/students/attendance" variant="live">
              <Text fw={600} size="sm">
                Student attendance
              </Text>
              <Text size="sm" c="dimmed" mt="xs">
                Staff daily roll, student portal, and family views — open the hub to choose where to
                go.
              </Text>
            </HubLinkCard>
          </SimpleGrid>
        </Stack>

        <Stack component="section" gap="md">
          <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts={3}>
            Student admission, rosters &amp; classes
          </Text>
          {schoolRows.length === 0 ? (
            <Alert color="yellow" title="No schools visible">
              No schools are visible to your account yet. Super admins can add schools under{" "}
              <Anchor component={Link} href="/admin/institutions" fw={600}>
                Admin → Schools
              </Anchor>
              .
            </Alert>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              {schoolRows.map((s) => (
                <Paper key={s.id} withBorder shadow="sm" p="lg" radius="lg">
                  <Text fw={600} size="sm">
                    {s.name}{" "}
                    <Text component="span" fw={400} c="dimmed">
                      — {s.siteName}
                    </Text>
                  </Text>
                  <Stack gap={6} mt="sm">
                    <Anchor component={Link} href={`/evaluations/students/${s.id}`} size="sm" fw={500}>
                      Manage students — list, admission &amp; classes
                    </Anchor>
                    <Anchor component={Link} href={`/evaluations/syllabuses/${s.id}`} size="sm" fw={500}>
                      Syllabuses
                    </Anchor>
                  </Stack>
                </Paper>
              ))}
            </SimpleGrid>
          )}
        </Stack>

        <Stack component="section" gap="md">
          <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts={3}>
            Reports &amp; families
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <HubLinkCard href="/evaluations" variant="live">
              <Text fw={600} size="sm">
                Evaluation reports
              </Text>
              <Text size="sm" c="dimmed" mt="xs">
                Filter scores by school, class, and date range; enter performance where you have staff
                access.
              </Text>
            </HubLinkCard>
            <HubLinkCard href="/reports" variant="live">
              <Text fw={600} size="sm">
                Programme reports (PDF)
              </Text>
              <Text size="sm" c="dimmed" mt="xs">
                Export a dated PDF summary for funders or internal review.
              </Text>
            </HubLinkCard>
            <HubLinkCard href="/family" variant="live">
              <Text fw={600} size="sm">
                Family attendance
              </Text>
              <Text size="sm" c="dimmed" mt="xs">
                Guardian view: see linked children&apos;s attendance when your school has connected your
                account.
              </Text>
            </HubLinkCard>
          </SimpleGrid>
        </Stack>

        <Text size="sm" c="dimmed" mt="md">
          <Anchor component={Link} href="/admin/institutions" fw={600}>
            Admin → Schools
          </Anchor>{" "}
          for staff assignment, guardian links, and attendance messages to families.
        </Text>
      </Stack>
    </AppPage>
  );
}
