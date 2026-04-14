import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { siteUserPermissions } from "@/db/schema";

export type SiteAction = "view" | "create" | "update" | "delete";

export async function getAccessibleSiteIds(
  userId: string,
  isSuperAdmin: boolean,
): Promise<string[] | "all"> {
  if (isSuperAdmin) return "all";
  const db = getDb();
  const rows = await db
    .select({ siteId: siteUserPermissions.siteId })
    .from(siteUserPermissions)
    .where(
      and(eq(siteUserPermissions.userId, userId), eq(siteUserPermissions.canView, true)),
    );
  return rows.map((r) => r.siteId);
}

export async function canOnSite(
  userId: string,
  isSuperAdmin: boolean,
  siteId: string,
  action: SiteAction,
): Promise<boolean> {
  if (isSuperAdmin) return true;
  const db = getDb();
  const rows = await db
    .select()
    .from(siteUserPermissions)
    .where(
      and(eq(siteUserPermissions.userId, userId), eq(siteUserPermissions.siteId, siteId)),
    )
    .limit(1);
  const p = rows[0];
  if (!p) return false;
  switch (action) {
    case "view":
      return p.canView;
    case "create":
      return p.canCreate;
    case "update":
      return p.canUpdate;
    case "delete":
      return p.canDelete;
    default:
      return false;
  }
}
