import { Alert, Badge, Divider, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { asc, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AppPage } from "@/components/app-page";
import { HubLinkCard } from "@/components/hub-link-card";
import { NextMantineAnchor } from "@/components/next-mantine-links";
import { getDb } from "@/db";
import { institutions, sites } from "@/db/schema";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { TEACHER_PANEL_GROUPS } from "@/lib/teacher-panel";
import { getViewableInstitutionIds } from "@/lib/school-access";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Teacher panel — Youth programme",
};

export default async function TeachersHubPage() {
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
          <Title order={1}>Teacher panel</Title>
          <Text c="dimmed" size="sm" maw={600}>
            One place for homework (coming soon), materials, syllabuses, evaluation reports, class
            assignments, student administration, exam marks, and attendance. Items marked{" "}
            <Text span fw={600} c="dark.7">
              Available
            </Text>{" "}
            open tools that exist today;
            <Text span fw={600} c="dark.7">
              {" "}
              Coming soon
            </Text>{" "}
            shows what is on the roadmap.
          </Text>
        </Stack>

        <Stack gap="xl" mt="md">
          {TEACHER_PANEL_GROUPS.map((group) => (
            <Stack key={group.id} component="section" gap="md" aria-labelledby={`tp-${group.id}`}>
              <Title order={2} id={`tp-${group.id}`} size="h3">
                {group.title}
              </Title>
              {group.description ? (
                <Text c="dimmed" size="sm" maw={600}>
                  {group.description}
                </Text>
              ) : null}
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                {group.items.map((item) => {
                  const badge =
                    item.status === "live" ? (
                      <Badge size="xs" variant="light" color="teal" tt="uppercase">
                        Available
                      </Badge>
                    ) : (
                      <Badge size="xs" variant="light" color="gray" tt="uppercase">
                        Coming soon
                      </Badge>
                    );

                  const inner = (
                    <>
                      <Group justify="space-between" align="flex-start" gap="xs" wrap="nowrap">
                        <Text fw={600} size="sm">
                          {item.title}
                        </Text>
                        {badge}
                      </Group>
                      <Text size="sm" c="dimmed" mt="xs">
                        {item.description}
                      </Text>
                      <Text size="sm" fw={600} c="teal.8" mt="sm">
                        {item.status === "live" && item.href?.startsWith("/") ? "Open →" : "Details →"}
                      </Text>
                    </>
                  );

                  if (item.status === "live" && item.href?.startsWith("/")) {
                    return (
                      <HubLinkCard key={item.key} href={item.href} variant="live">
                        {inner}
                      </HubLinkCard>
                    );
                  }

                  return (
                    <HubLinkCard key={item.key} href={`/teachers/feature/${item.key}`} variant="planned">
                      {inner}
                    </HubLinkCard>
                  );
                })}
              </SimpleGrid>
            </Stack>
          ))}
        </Stack>

        <Divider my="lg" />

        <Stack component="section" id="syllabus-by-school" gap="md" style={{ scrollMarginTop: "6rem" }}>
          <Title order={2} size="h3">
            Syllabus by school
          </Title>
          <Text c="dimmed" size="sm" maw={520}>
            Published syllabus content is read-only; super admins edit entries under{" "}
            <NextMantineAnchor href="/admin/institutions" fw={600}>
              Admin → Schools
            </NextMantineAnchor>
            .
          </Text>
          {schoolRows.length === 0 ? (
            <Alert color="yellow" title="No schools visible">
              No schools are visible yet. Ask for site access or school staff assignment.
            </Alert>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              {schoolRows.map((s) => (
                <Paper key={s.id} withBorder shadow="sm" p="lg" radius="lg">
                  <Text fw={600} size="sm">
                    {s.name}
                    <Text span fw={400} c="dimmed">
                      {" "}
                      — {s.siteName}
                    </Text>
                  </Text>
                  <NextMantineAnchor href={`/evaluations/syllabuses/${s.id}`} size="sm" fw={600} mt="md" display="block">
                    Open syllabus &amp; download
                  </NextMantineAnchor>
                </Paper>
              ))}
            </SimpleGrid>
          )}
        </Stack>

        <Text size="sm" c="dimmed" mt="md" pt="lg" style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}>
          Also see:{" "}
          <NextMantineAnchor href="/communications" fw={600}>
            Communications
          </NextMantineAnchor>{" "}
          (school notices and events),{" "}
          <NextMantineAnchor href="/students" fw={600}>
            Student information
          </NextMantineAnchor>
          .
        </Text>
      </Stack>
    </AppPage>
  );
}
