import { Badge, Divider, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { redirect } from "next/navigation";
import { AppPage } from "@/components/app-page";
import { HubLinkCard } from "@/components/hub-link-card";
import { NextMantineAnchor } from "@/components/next-mantine-links";
import { STUDENT_ATTENDANCE_PANEL_GROUPS } from "@/lib/student-attendance-panel";
import { getServerSessionWithBypass } from "@/lib/auth-options";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Student attendance — Youth programme",
};

export default async function StudentAttendanceHubPage() {
  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) redirect("/login");

  return (
    <AppPage>
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={1}>Student attendance</Title>
          <Text c="dimmed" size="sm" maw={600}>
            Daily roll for staff, plus read-only views for learners and families — the same information
            architecture as typical{" "}
            <Text span fw={600} c="dark.7">
              student attendance
            </Text>{" "}
            screens in school systems. Cards marked{" "}
            <Text span fw={600} c="dark.7">
              Available
            </Text>{" "}
            are live in this app.
          </Text>
        </Stack>

        <Stack gap="xl" mt="md">
          {STUDENT_ATTENDANCE_PANEL_GROUPS.map((group) => (
            <Stack key={group.id} component="section" gap="md" aria-labelledby={`sa-${group.id}`}>
              <Title order={2} id={`sa-${group.id}`} size="h3">
                {group.title}
              </Title>
              {group.description ? (
                <Text c="dimmed" size="sm" maw={600}>
                  {group.description}
                </Text>
              ) : null}
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                {group.items.map((item) => {
                  const badge = (
                    <Badge size="xs" variant="light" color="teal" tt="uppercase">
                      Available
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
                        Open →
                      </Text>
                    </>
                  );

                  if (item.href) {
                    return (
                      <HubLinkCard key={item.key} href={item.href} variant="live">
                        {inner}
                      </HubLinkCard>
                    );
                  }

                  return (
                    <Text key={item.key} size="sm" c="dimmed">
                      {item.title} (no link)
                    </Text>
                  );
                })}
              </SimpleGrid>
            </Stack>
          ))}
        </Stack>

        <Divider my="lg" />

        <Stack component="section" gap="md">
          <Title order={2} size="h3">
            Related
          </Title>
          <Group gap="lg">
            <NextMantineAnchor href="/students" size="sm" fw={600}>
              Student information
            </NextMantineAnchor>
            <NextMantineAnchor href="/dashboard" size="sm" fw={600}>
              Dashboard
            </NextMantineAnchor>
            <NextMantineAnchor href="/evaluations" size="sm" fw={600}>
              Evaluations
            </NextMantineAnchor>
          </Group>
        </Stack>

        <Text size="sm" c="dimmed" mt="md">
          Assign staff under <NextMantineAnchor href="/admin/institutions">Admin → Schools</NextMantineAnchor> so
          they can record attendance; link guardians there for family visibility.
        </Text>
      </Stack>
    </AppPage>
  );
}
