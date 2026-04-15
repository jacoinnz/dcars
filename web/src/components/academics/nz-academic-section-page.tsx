import { Anchor, Badge, Stack, Text, Title } from "@mantine/core";
import { AppPage } from "@/components/app-page";
import { NzAcademicSectionView } from "@/components/academics/nz-academic-section-view";
import { NextMantineAnchor } from "@/components/next-mantine-links";

export function NzAcademicSectionPage() {
  return (
    <AppPage maxWidth="wide">
      <NextMantineAnchor href="/dashboard" size="sm" c="blue.7" fw={500} underline="hover">
        ← Dashboard
      </NextMantineAnchor>

      <Stack gap="xs" mt="md">
        <Stack gap="xs" align="flex-start">
          <Title order={1} size="h2">
            Section
          </Title>
          <Badge size="lg" variant="light" color="blue" tt="uppercase">
            NZ reference — phases & divisions
          </Badge>
        </Stack>

        <Text size="sm" c="dimmed" maw={900} lh={1.65}>
          In this app, a <strong>section</strong> is an organisational band: school phase, division, whānau community, or
          campus — not an individual subject class (see{" "}
          <NextMantineAnchor href="/academics/module/school-classes" fw={600}>
            Class
          </NextMantineAnchor>
          ) or subject line (see{" "}
          <NextMantineAnchor href="/academics/module/subjects-catalog" fw={600}>
            Subjects
          </NextMantineAnchor>
          ). Labels below follow common practice in Aotearoa alongside{" "}
          <Anchor
            href="https://newzealandcurriculum.tahurangi.education.govt.nz/"
            target="_blank"
            rel="noreferrer"
            fw={600}
          >
            The New Zealand Curriculum
          </Anchor>{" "}
          year-level progression; your board or kāhui may use different terms.
        </Text>
      </Stack>

      <NzAcademicSectionView />

      <Text size="sm" c="dimmed" mt="xl">
        <NextMantineAnchor href="/dashboard" fw={600} c="blue.7" underline="always">
          Back to dashboard
        </NextMantineAnchor>
      </Text>
    </AppPage>
  );
}
