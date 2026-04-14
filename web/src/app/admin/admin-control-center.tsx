"use client";

import Link from "next/link";
import { Anchor, Badge, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { ADMIN_MODULE_GROUPS } from "@/lib/admin-control-center";

export function AdminControlCenter() {
  return (
    <Stack gap="xl" id="overview">
      <div>
        <Title order={1} size="h2">
          Admin control center
        </Title>
        <Text size="sm" c="dimmed" maw={960} mt="sm" lh={1.6}>
          Super-admin entry point for this youth programme app. Use{" "}
          <Text span fw={600} c="dark">
            Available
          </Text>{" "}
          items to configure sites, schools, users, and to jump into live tools for students, attendance,
          exams, and notices.{" "}
          <Text span fw={600} c="dark">
            Planned
          </Text>{" "}
          entries describe modules that are not implemented here yet (front office, finance, library,
          messaging, certificates, and more) but are tracked for a full school MIS roadmap.
        </Text>
      </div>

      <Stack gap="xl">
        {ADMIN_MODULE_GROUPS.map((group) => (
          <section key={group.id} aria-labelledby={`grp-${group.id}`}>
            <Title order={2} id={`grp-${group.id}`} size="h4">
              {group.title}
            </Title>
            {group.description ? (
              <Text size="sm" c="dimmed" maw={960} mt={4}>
                {group.description}
              </Text>
            ) : null}
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="md">
              {group.items.map((item) => {
                const href =
                  item.status === "live" && item.href ? item.href : `/admin/module/${item.key}`;
                const CardInner = (
                  <>
                    <Group justify="space-between" align="flex-start" wrap="nowrap" gap="xs">
                      <Text fw={600} size="sm" lineClamp={2}>
                        {item.title}
                      </Text>
                      <Badge
                        size="sm"
                        variant="light"
                        color={item.status === "live" ? "blue" : "gray"}
                        tt="uppercase"
                        style={{ flexShrink: 0 }}
                      >
                        {item.status === "live" ? "Available" : "Planned"}
                      </Badge>
                    </Group>
                    <Text size="sm" c="dimmed" mt="sm" lh={1.5}>
                      {item.description}
                    </Text>
                    <Text size="sm" fw={600} c="blue.7" mt="md">
                      {item.status === "live" && item.href ? "Open →" : "Details →"}
                    </Text>
                  </>
                );

                return (
                  <Paper
                    key={item.key}
                    component={Link}
                    href={href}
                    withBorder
                    radius="lg"
                    p="md"
                    shadow="sm"
                    styles={{
                      root: {
                        textDecoration: "none",
                        color: "inherit",
                        display: "block",
                        height: "100%",
                        transition: "border-color 120ms ease, box-shadow 120ms ease",
                        "&:hover": {
                          borderColor: "var(--mantine-color-blue-4)",
                          boxShadow: "var(--mantine-shadow-md)",
                        },
                      },
                    }}
                  >
                    {CardInner}
                  </Paper>
                );
              })}
            </SimpleGrid>
          </section>
        ))}
      </Stack>

      <Text size="sm" c="dimmed" pt="xl" style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}>
        Public app areas:{" "}
        <Anchor component={Link} href="/students" fw={600} c="blue.7" underline="always">
          Students
        </Anchor>
        ,{" "}
        <Anchor component={Link} href="/hr" fw={600} c="blue.7" underline="always">
          HR
        </Anchor>
        ,{" "}
        <Anchor component={Link} href="/teachers" fw={600} c="blue.7" underline="always">
          Teachers
        </Anchor>
        ,{" "}
        <Anchor component={Link} href="/examinations" fw={600} c="blue.7" underline="always">
          Exams
        </Anchor>
        ,{" "}
        <Anchor component={Link} href="/communications" fw={600} c="blue.7" underline="always">
          Communications
        </Anchor>
        .
      </Text>
    </Stack>
  );
}
