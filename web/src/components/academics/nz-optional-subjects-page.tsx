import Link from "next/link";
import { Anchor, Badge, Stack, Text, Title } from "@mantine/core";
import { AppPage } from "@/components/app-page";
import { NzOptionalSubjectsView } from "@/components/academics/nz-optional-subjects-view";

export function NzOptionalSubjectsPage() {
  return (
    <AppPage maxWidth="wide">
      <Anchor component={Link} href="/dashboard" size="sm" c="blue.7" fw={500} underline="hover">
        ← Dashboard
      </Anchor>

      <Stack gap="xs" mt="md">
        <Stack gap="xs" align="flex-start">
          <Title order={1} size="h2">
            Optional subjects
          </Title>
          <Badge size="lg" variant="light" color="blue" tt="uppercase">
            NZ reference — electives & option lines
          </Badge>
        </Stack>

        <Text size="sm" c="dimmed" maw={900} lh={1.65}>
          Use this page to plan how <strong>elective</strong> and <strong>optional</strong> subjects are named and grouped
          beside your core catalog. Senior optional lines usually map to{" "}
          <Anchor href="https://www.nzqa.govt.nz/" target="_blank" rel="noreferrer" fw={600}>
            NCEA
          </Anchor>{" "}
          courses; junior options often use rotations or semester blocks. Start from the baseline subject list in{" "}
          <Anchor component={Link} href="/academics/module/subjects-catalog" fw={600}>
            Subjects
          </Anchor>{" "}
          and extend codes with <code>OPT</code>, <code>ELEC</code>, or year/semester tags as your school agrees.
        </Text>
      </Stack>

      <NzOptionalSubjectsView />

      <Text size="sm" c="dimmed" mt="xl">
        <Anchor component={Link} href="/dashboard" fw={600} c="blue.7" underline="always">
          Back to dashboard
        </Anchor>
      </Text>
    </AppPage>
  );
}
