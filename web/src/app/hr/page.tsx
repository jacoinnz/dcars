import Link from "next/link";
import { Anchor, Badge, Divider, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { redirect } from "next/navigation";
import { AppPage } from "@/components/app-page";
import { HubLinkCard } from "@/components/hub-link-card";
import { HR_PANEL_GROUPS } from "@/lib/hr-panel";
import { getServerSessionWithBypass } from "@/lib/auth-options";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Human resources — Youth programme",
};

export default async function HumanResourcesHubPage() {
  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) redirect("/login");

  return (
    <AppPage>
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={1}>Human resources</Title>
          <Text c="dimmed" maw={600} size="sm">
            Staff directory, future staff attendance and payroll modules, and links to programme
            reporting.
            <Text span fw={600} c="dark.7">
              {" "}
              Available
            </Text>{" "}
            opens live tools;{" "}
            <Text span fw={600} c="dark.7">
              Coming soon
            </Text>{" "}
            marks features that need HR and finance build-out.
          </Text>
        </Stack>

        <Stack gap="xl" mt="md">
          {HR_PANEL_GROUPS.map((group) => (
            <Stack key={group.id} component="section" gap="md" aria-labelledby={`hr-${group.id}`}>
              <Title order={2} id={`hr-${group.id}`} size="h3">
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
                    <HubLinkCard key={item.key} href={`/hr/feature/${item.key}`} variant="planned">
                      {inner}
                    </HubLinkCard>
                  );
                })}
              </SimpleGrid>
            </Stack>
          ))}
        </Stack>

        <Divider my="lg" />

        <Stack component="section" gap="md">
          <Title order={2} size="h3">
            Related (operational)
          </Title>
          <Text c="dimmed" size="sm">
            Student-facing roll marks are not staff HR attendance — use the links below for programme
            delivery metrics and pupil attendance.
          </Text>
          <Group gap="lg">
            <Anchor component={Link} href="/attendance" size="sm" fw={600}>
              Student attendance (roll)
            </Anchor>
            <Anchor component={Link} href="/dashboard" size="sm" fw={600}>
              Dashboard
            </Anchor>
            <Anchor component={Link} href="/reports" size="sm" fw={600}>
              PDF programme reports
            </Anchor>
          </Group>
        </Stack>

        <Text size="sm" c="dimmed" mt="md">
          Assign staff under{" "}
          <Anchor component={Link} href="/admin/institutions" fw={600}>
            Admin → Schools
          </Anchor>{" "}
          → <Text span fw={600}>Staff &amp; teachers</Text>.
        </Text>
      </Stack>
    </AppPage>
  );
}
