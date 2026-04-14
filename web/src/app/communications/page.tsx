import { Alert, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { asc, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AppPage } from "@/components/app-page";
import { HubLinkCard } from "@/components/hub-link-card";
import { NextMantineAnchor } from "@/components/next-mantine-links";
import { getDb } from "@/db";
import { institutions, sites } from "@/db/schema";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { getViewableInstitutionIds } from "@/lib/school-access";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Communications — Youth programme",
};

export default async function CommunicationsHubPage() {
  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const isSuperAdmin = Boolean(session.user.isSuperAdmin);
  const viewableIds = await getViewableInstitutionIds(userId, isSuperAdmin);
  const db = getDb();

  const schoolRows =
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

  return (
    <AppPage>
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={1}>Communications</Title>
          <Text c="dimmed" size="sm" maw={520}>
            Notice manager for each school: holidays and closures, events, and out-of-class activities —
            with optional date ranges so families and staff see what is coming up.
          </Text>
        </Stack>

        {schoolRows.length === 0 ? (
          <Alert color="yellow" title="No schools visible">
            No schools are visible to your account yet. Super admins can add schools under{" "}
            <NextMantineAnchor href="/admin/institutions" fw={600}>
              Admin → Schools
            </NextMantineAnchor>
            .
          </Alert>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {schoolRows.map((s) => (
              <HubLinkCard key={s.id} href={`/communications/${s.id}`} variant="live">
                <Text fw={600} size="sm">
                  {s.name}
                </Text>
                <Text size="sm" c="dimmed" mt={4}>
                  {s.siteName}
                </Text>
                <Text size="sm" fw={600} c="teal.8" mt="md" td="underline">
                  Open notice manager →
                </Text>
              </HubLinkCard>
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </AppPage>
  );
}
