import { Anchor, Badge, Stack, Text, Title } from "@mantine/core";
import { AppPage } from "@/components/app-page";
import { NzSchoolClassesView } from "@/components/academics/nz-school-classes-view";
import { NextMantineAnchor } from "@/components/next-mantine-links";

export function NzSchoolClassesPage() {
  return (
    <AppPage maxWidth="wide">
      <NextMantineAnchor href="/dashboard" size="sm" c="blue.7" fw={500} underline="hover">
        ← Dashboard
      </NextMantineAnchor>

      <Stack gap="xs" mt="md">
        <Stack gap="xs" align="flex-start">
          <Title order={1} size="h2">
            Class
          </Title>
          <Badge size="lg" variant="light" color="blue" tt="uppercase">
            NZ reference — groups & codes
          </Badge>
        </Stack>

        <Text size="sm" c="dimmed" maw={900} lh={1.65}>
          Use this page to align <strong>class codes</strong>, <strong>rolls</strong>, and <strong>year levels</strong> with common practice in Aotearoa New Zealand schools. A “class” may be a{" "}
          <strong>form / whānau</strong> group, a <strong>subject teaching line</strong>, or a <strong>composite</strong> group — your student management system (SMS) and timetable usually hold the
          authoritative records; this module is a naming and structure baseline ahead of deeper tooling.
        </Text>
      </Stack>

      <NzSchoolClassesView />

      <Text size="sm" c="dimmed" mt="xl">
        <NextMantineAnchor href="/dashboard" fw={600} c="blue.7" underline="always">
          Back to dashboard
        </NextMantineAnchor>
      </Text>
    </AppPage>
  );
}
