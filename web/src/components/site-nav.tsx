import { getServerSessionWithBypass } from "@/lib/auth-options";
import { SiteNavClient } from "@/components/site-nav-client";

export async function SiteNav() {
  const session = await getServerSessionWithBypass();
  const isSuperAdmin = Boolean(session?.user?.isSuperAdmin);

  return (
    <SiteNavClient email={session?.user?.email ?? null} isSuperAdmin={isSuperAdmin} />
  );
}
