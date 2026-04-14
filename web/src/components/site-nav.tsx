import { Suspense } from "react";
import { Box } from "@mantine/core";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { SiteNavClient } from "@/components/site-nav-client";

function SiteNavSidebarFallback() {
  return (
    <Box
      component="aside"
      bg="gray.0"
      style={{
        flexShrink: 0,
        width: "15rem",
        minHeight: "100vh",
        borderRight: "1px solid var(--mantine-color-gray-3)",
      }}
    />
  );
}

export async function SiteNav() {
  const session = await getServerSessionWithBypass();
  const isSuperAdmin = Boolean(session?.user?.isSuperAdmin);

  return (
    <Suspense fallback={<SiteNavSidebarFallback />}>
      <SiteNavClient email={session?.user?.email ?? null} isSuperAdmin={isSuperAdmin} />
    </Suspense>
  );
}
