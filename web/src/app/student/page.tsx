import { Alert, Badge, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { redirect } from "next/navigation";
import { AppPage } from "@/components/app-page";
import { HubLinkCard } from "@/components/hub-link-card";
import { NextMantineAnchor } from "@/components/next-mantine-links";
import { STUDENT_PANEL_GROUPS } from "@/lib/student-panel";
import { getPortalStudentIdForUser } from "@/lib/student-portal-access";
import { getServerSessionWithBypass } from "@/lib/auth-options";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Student panel — Youth programme",
};

export default async function StudentPanelPage() {
  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) redirect("/login");

  const portalStudentId = await getPortalStudentIdForUser(session.user.id);

  return (
    <AppPage>
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={1}>Student panel</Title>
          <Text c="dimmed" size="sm" maw={600}>
            Signed-in view for learners. Your school must link your account to your student profile (Admin
            → Schools → Student portal login). Then you can open marks, attendance, and study files for{" "}
            <Text span fw={600} c="dark.7">
              your
            </Text>{" "}
            record only.
          </Text>
        </Stack>

        {!portalStudentId ? (
          <Alert color="yellow" title="Your login is not linked to a student profile yet">
            Ask your school administrator to connect this account under{" "}
            <Text span fw={600}>
              Admin → Schools → your school → Student portal login
            </Text>
            . Parents can use the{" "}
            <NextMantineAnchor href="/parents" fw={600} inherit>
              Parents panel
            </NextMantineAnchor>{" "}
            if they are linked as guardians instead.
          </Alert>
        ) : null}

        <Stack gap="xl" mt="md">
          {STUDENT_PANEL_GROUPS.map((group) => (
            <Stack key={group.id} component="section" gap="md" aria-labelledby={`sp-${group.id}`}>
              <Title order={2} id={`sp-${group.id}`} size="h3">
                {group.title}
              </Title>
              {group.description ? (
                <Text c="dimmed" size="sm" maw={600}>
                  {group.description}
                </Text>
              ) : null}
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                {group.items.map((item) => {
                  const disabled = !portalStudentId && item.status === "live";
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

                  if (item.status === "live" && item.href && !disabled) {
                    return (
                      <HubLinkCard key={item.key} href={item.href} variant="live">
                        {inner}
                      </HubLinkCard>
                    );
                  }

                  if (item.status === "live" && item.href && disabled) {
                    return (
                      <Paper key={item.key} withBorder p="lg" radius="lg" bg="gray.0" style={{ opacity: 0.85 }}>
                        {inner}
                        <Text size="xs" c="dimmed" mt="xs">
                          Link your student account first.
                        </Text>
                      </Paper>
                    );
                  }

                  return (
                    <HubLinkCard key={item.key} href={`/student/feature/${item.key}`} variant="planned">
                      {inner}
                    </HubLinkCard>
                  );
                })}
              </SimpleGrid>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </AppPage>
  );
}
