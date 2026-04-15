import { Anchor, Badge, Stack, Text, Title } from "@mantine/core";
import { AppPage } from "@/components/app-page";
import { NzSubjectsCatalogView } from "@/components/academics/nz-subjects-catalog-view";
import { NextMantineAnchor } from "@/components/next-mantine-links";

export function NzSubjectsCatalogPage() {
  return (
    <AppPage maxWidth="wide">
      <NextMantineAnchor href="/dashboard" size="sm" c="blue.7" fw={500} underline="hover">
        ← Dashboard
      </NextMantineAnchor>

      <Stack gap="xs" mt="md">
        <Stack gap="xs" align="flex-start">
          <Title order={1} size="h2">
            Subjects
          </Title>
          <Badge size="lg" variant="light" color="blue" tt="uppercase">
            NZ Curriculum reference
          </Badge>
        </Stack>

        <Text size="sm" c="dimmed" maw={900} lh={1.65}>
          This catalog lists subjects under the{" "}
          <strong>eight learning areas</strong> of{" "}
          <Anchor
            href="https://newzealandcurriculum.tahurangi.education.govt.nz/"
            target="_blank"
            rel="noreferrer"
            fw={600}
          >
            The New Zealand Curriculum
          </Anchor>{" "}
          (NZC). Suggested codes help keep timetabling and reporting consistent; your kura or school may use different
          labels. NCEA subject packages are published by NZQA — use this list as a naming baseline, then map to your
          provider’s course codes where required.
        </Text>
      </Stack>

      <NzSubjectsCatalogView />

      <Text size="sm" c="dimmed" mt="xl">
        <NextMantineAnchor href="/dashboard" fw={600} c="blue.7" underline="always">
          Back to dashboard
        </NextMantineAnchor>
      </Text>
    </AppPage>
  );
}
