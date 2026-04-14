import { gte, inArray, sql } from "drizzle-orm";
import { subDays } from "date-fns";
import { getDb } from "@/db";
import { sessionReports, sites } from "@/db/schema";
import type { SiteScope } from "@/lib/site-scope";

export type MissingDataAlert = {
  siteId: string;
  siteName: string;
  siteCode: string;
  daysSinceLastReport: number | null;
};

/**
 * Sites with no session report on or after `since` (inclusive).
 */
export async function getSitesWithMissingReportsSince(
  since: Date,
  siteScope: SiteScope = "all",
): Promise<MissingDataAlert[]> {
  if (Array.isArray(siteScope) && siteScope.length === 0) {
    return [];
  }

  const db = getDb();
  const sinceStr = since.toISOString().slice(0, 10);
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const reportedSiteIds = await db
    .selectDistinct({ siteId: sessionReports.siteId })
    .from(sessionReports)
    .where(gte(sessionReports.sessionDate, sinceStr));

  const reported = new Set(reportedSiteIds.map((r) => r.siteId));

  const allSites =
    siteScope === "all"
      ? await db.select().from(sites)
      : await db.select().from(sites).where(inArray(sites.id, siteScope));

  const missing = allSites.filter((s) => !reported.has(s.id));

  const lastDates = await db
    .select({
      siteId: sessionReports.siteId,
      lastDate: sql<string>`max(${sessionReports.sessionDate})`,
    })
    .from(sessionReports)
    .groupBy(sessionReports.siteId);

  const lastBySite = new Map(lastDates.map((r) => [r.siteId, r.lastDate]));

  return missing.map((s) => {
    const last = lastBySite.get(s.id);
    const daysSince = last
      ? Math.max(
          0,
          Math.floor(
            (Date.parse(todayStr) - Date.parse(last)) / (1000 * 60 * 60 * 24),
          ),
        )
      : null;
    return {
      siteId: s.id,
      siteName: s.name,
      siteCode: s.code,
      daysSinceLastReport: daysSince,
    };
  });
}

export async function getDefaultMissingReportAlerts(siteScope: SiteScope = "all") {
  const since = subDays(new Date(), 7);
  return getSitesWithMissingReportsSince(since, siteScope);
}
