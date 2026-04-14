import { Badge, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { AppPage } from "@/components/app-page";
import { HubLinkCard } from "@/components/hub-link-card";
import { PARENT_PANEL_GROUPS } from "@/lib/parent-panel";
import { authOptions } from "@/lib/auth-options";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Parents panel — Youth programme",
};

export default async function ParentsPanelPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  return (
    <AppPage>
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={1}>Parents panel</Title>
          <Text c="dimmed" size="sm" maw={600}>
            For guardians linked to a student by their school. Use{" "}
            <Text span fw={600} c="dark.7">
              Available
            </Text>{" "}
            to open live tools;{" "}
            <Text span fw={600} c="dark.7">
              Coming soon
            </Text>{" "}
            shows features that need your school’s billing, timetable, or messaging setup in a future
            release.
          </Text>
        </Stack>

        <Stack gap="xl" mt="md">
          {PARENT_PANEL_GROUPS.map((group) => (
            <Stack key={group.id} component="section" gap="md" aria-labelledby={`pp-${group.id}`}>
              <Title order={2} id={`pp-${group.id}`} size="h3">
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
                    <HubLinkCard key={item.key} href={`/parents/feature/${item.key}`} variant="planned">
                      {inner}
                    </HubLinkCard>
                  );
                })}
              </SimpleGrid>
            </Stack>
          ))}
        </Stack>

        <Text size="sm" c="dimmed" mt="xl" pt="lg" style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}>
          Not linked to a child yet? Ask your school to add your account under{" "}
          <Text span fw={600}>Admin → Schools → Attendance setup → Guardian links</Text>.
        </Text>
      </Stack>
    </AppPage>
  );
}
