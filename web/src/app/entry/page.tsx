import { ParticipantEntryForm } from "@/components/participant-entry-form";
import { ParticipantExcelImport } from "@/components/participant-excel-import";
import { getSitesForParticipantEntry } from "@/lib/sites-for-user";
import { getSessionSiteScope } from "@/lib/site-scope";
import { Box, Container, Flex, Paper, Text } from "@mantine/core";
import { format } from "date-fns";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EntryPage() {
  const scopeCtx = await getSessionSiteScope();
  if (!scopeCtx) redirect("/login");
  const sites = await getSitesForParticipantEntry(scopeCtx.userId, scopeCtx.isSuperAdmin);
  const defaultDateOfEntry = format(new Date(), "yyyy-MM-dd");

  return (
    <Container size="xl" py="xl" px="md" style={{ flex: 1, width: "100%", maxWidth: "100%" }}>
      {sites.length === 0 ? (
        <Paper
          withBorder
          p="lg"
          radius="xl"
          style={{
            borderColor: "var(--mantine-color-yellow-3)",
            background: "var(--mantine-color-yellow-0)",
          }}
        >
          <Text fw={600} size="sm">
            No programme sites available
          </Text>
          <Text mt="sm" size="sm" c="yellow.9">
            Your account does not have access to register participants for any site. Ask a
            super-administrator to grant you create permission for the sites you support.
          </Text>
        </Paper>
      ) : (
        <Flex direction={{ base: "column", lg: "row" }} gap="xl" align="flex-start" wrap="nowrap">
          <Box style={{ flex: "2 1 0", minWidth: 0 }}>
            <ParticipantEntryForm sites={sites} defaultDateOfEntry={defaultDateOfEntry} />
          </Box>
          <Box style={{ flex: "1 1 0", minWidth: 0 }}>
            <ParticipantExcelImport />
          </Box>
        </Flex>
      )}
    </Container>
  );
}
