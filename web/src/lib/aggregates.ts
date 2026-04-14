import { and, count, eq, gte, inArray, lte, sql, sum } from "drizzle-orm";
import { getDb } from "@/db";
import { participantEntries, sessionReports, sites } from "@/db/schema";

export type SiteSummary = {
  siteId: string;
  siteName: string;
  siteCode: string;
  reportCount: number;
  totalYouthPresent: number;
  totalYouthRegistered: number;
  avgAttendanceRate: number | null;
  participantRegistrations: number;
};

/** `siteScope`: `"all"` or a list of site IDs the user may view. Empty list → no rows. */
export async function getSiteSummaries(params: {
  from: Date;
  to: Date;
  siteScope?: "all" | string[];
}): Promise<SiteSummary[]> {
  const db = getDb();
  const fromStr = params.from.toISOString().slice(0, 10);
  const toStr = params.to.toISOString().slice(0, 10);
  const scope = params.siteScope ?? "all";

  if (Array.isArray(scope) && scope.length === 0) {
    return [];
  }

  const siteFilter =
    scope === "all" ? sql`true` : inArray(sites.id, scope);

  const participantWhere = [
    gte(participantEntries.dateOfEntry, fromStr),
    lte(participantEntries.dateOfEntry, toStr),
    ...(scope === "all" ? [] : [inArray(participantEntries.siteId, scope)]),
  ];

  const [rows, participantRows] = await Promise.all([
    db
      .select({
        siteId: sites.id,
        siteName: sites.name,
        siteCode: sites.code,
        reportCount: count(sessionReports.id),
        totalYouthPresent: sum(sessionReports.youthPresent),
        totalYouthRegistered: sum(sessionReports.youthRegistered),
      })
      .from(sites)
      .leftJoin(
        sessionReports,
        and(
          eq(sessionReports.siteId, sites.id),
          gte(sessionReports.sessionDate, fromStr),
          lte(sessionReports.sessionDate, toStr),
        ),
      )
      .where(siteFilter)
      .groupBy(sites.id, sites.name, sites.code),
    db
      .select({
        siteId: participantEntries.siteId,
        c: count(participantEntries.id),
      })
      .from(participantEntries)
      .where(and(...participantWhere))
      .groupBy(participantEntries.siteId),
  ]);

  const pMap = new Map(participantRows.map((r) => [r.siteId, Number(r.c ?? 0)]));

  return rows.map((r) => {
    const present = Number(r.totalYouthPresent ?? 0);
    const registered = Number(r.totalYouthRegistered ?? 0);
    const rate = registered > 0 ? present / registered : null;
    return {
      siteId: r.siteId,
      siteName: r.siteName,
      siteCode: r.siteCode,
      reportCount: Number(r.reportCount ?? 0),
      totalYouthPresent: present,
      totalYouthRegistered: registered,
      avgAttendanceRate: rate,
      participantRegistrations: pMap.get(r.siteId) ?? 0,
    };
  });
}

export async function getProgramTotals(params: {
  from: Date;
  to: Date;
  siteScope?: "all" | string[];
}) {
  const summaries = await getSiteSummaries(params);
  return {
    sites: summaries.length,
    reports: summaries.reduce((a, s) => a + s.reportCount, 0),
    youthPresent: summaries.reduce((a, s) => a + s.totalYouthPresent, 0),
    youthRegistered: summaries.reduce((a, s) => a + s.totalYouthRegistered, 0),
    participantRegistrations: summaries.reduce((a, s) => a + s.participantRegistrations, 0),
  };
}
