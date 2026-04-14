import Link from "next/link";
import { Alert, Anchor, Badge, Divider, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { asc, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AppPage } from "@/components/app-page";
import { HubLinkCard } from "@/components/hub-link-card";
import { getDb } from "@/db";
import { institutions, sites } from "@/db/schema";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { EXAMINATION_PANEL_GROUPS } from "@/lib/examination-panel";
import { getViewableInstitutionIds } from "@/lib/school-access";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Examinations — Youth programme",
};

export default async function ExaminationsHubPage() {
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
          <Title order={1}>Examinations</Title>
          <Text c="dimmed" size="sm" maw={600}>
            Formal exam periods per school: types, timetables, seating, routines, mark registers, and
            reports.
            <Text span fw={600} c="dark.7">
              {" "}
              Available
            </Text>{" "}
            opens live tools (or a detail page explaining where they live);{" "}
            <Text span fw={600} c="dark.7">
              Coming soon
            </Text>{" "}
            marks roadmap items such as online papers and grading schemes.
          </Text>
        </Stack>

        <Stack gap="xl" mt="md">
          {EXAMINATION_PANEL_GROUPS.map((group) => (
            <Stack key={group.id} component="section" gap="md" aria-labelledby={`ex-${group.id}`}>
              <Title order={2} id={`ex-${group.id}`} size="h3">
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
                        {item.status === "live" && item.href ? "Open →" : "Details →"}
                      </Text>
                    </>
                  );

                  if (item.status === "live" && item.href) {
                    return (
                      <HubLinkCard key={item.key} href={item.href} variant="live">
                        {inner}
                      </HubLinkCard>
                    );
                  }

                  return (
                    <HubLinkCard key={item.key} href={`/examinations/feature/${item.key}`} variant="planned">
                      {inner}
                    </HubLinkCard>
                  );
                })}
              </SimpleGrid>
            </Stack>
          ))}
        </Stack>

        <Divider my="lg" />

        <Stack gap="md">
          <Title order={2} size="h3">
            Open a school
          </Title>
          <Text c="dimmed" size="sm" maw={520}>
            Choose a school to create exam periods and edit schedules, seat plans, routines, and marks.
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
                <HubLinkCard key={s.id} href={`/examinations/${s.id}`} variant="live">
                  <Text fw={600} size="sm">
                    {s.name}
                  </Text>
                  <Text size="sm" c="dimmed" mt={4}>
                    {s.siteName}
                  </Text>
                  <Text size="sm" fw={600} c="teal.8" mt="md" td="underline">
                    Open examination centre →
                  </Text>
                </HubLinkCard>
              ))}
            </SimpleGrid>
          )}
        </Stack>

        <Paper withBorder p="md" radius="md" bg="gray.0">
          <Title order={3} size="sm">
            Programme reports
          </Title>
          <Text size="sm" c="dimmed" mt="xs">
            Broader session and PDF exports (not exam-specific) live under Reports and Evaluations.
          </Text>
          <Group gap="lg" mt="md">
            <Anchor component={Link} href="/reports" size="sm" fw={600}>
              PDF programme reports
            </Anchor>
            <Anchor component={Link} href="/evaluations" size="sm" fw={600}>
              Evaluation scores
            </Anchor>
            <Anchor component={Link} href="/attendance" size="sm" fw={600}>
              Student attendance (roll)
            </Anchor>
          </Group>
        </Paper>
      </Stack>
    </AppPage>
  );
}
