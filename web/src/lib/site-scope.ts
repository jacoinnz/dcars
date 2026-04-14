import { getServerSessionWithBypass } from "@/lib/auth-options";
import { getAccessibleSiteIds } from "@/lib/permissions";

/** Resolved scope for aggregate queries: all sites, or explicit id list (may be empty). */
export type SiteScope = "all" | string[];

export async function getSessionSiteScope(): Promise<{
  userId: string;
  isSuperAdmin: boolean;
  siteScope: SiteScope;
} | null> {
  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) return null;
  const userId = session.user.id;
  const isSuperAdmin = Boolean(session.user.isSuperAdmin);
  const access = await getAccessibleSiteIds(userId, isSuperAdmin);
  const siteScope: SiteScope = access === "all" ? "all" : access;
  return { userId, isSuperAdmin, siteScope };
}
