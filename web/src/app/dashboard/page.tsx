import { endOfMonth, format, startOfMonth } from "date-fns";
import { getSiteSummaries, getProgramTotals } from "@/lib/aggregates";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { getAudienceTabCounts } from "@/lib/audience-tab-counts";
import { getActiveNoticeBoardItems } from "@/lib/notice-board";
import { getSessionSiteScope } from "@/lib/site-scope";
import { DashboardPageContent } from "./dashboard-page-content";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard — Youth programme",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const session = await getServerSessionWithBypass();
  const isSuperAdmin = Boolean(session?.user?.isSuperAdmin);
  const welcomeName = session?.user?.name?.trim() || session?.user?.email?.trim() || null;
  const todoStorageKey = session?.user?.id ?? "guest";
  const scopeCtx = await getSessionSiteScope();
  const siteScope = scopeCtx?.siteScope ?? "all";

  const now = new Date();
  const from = sp.from
    ? new Date(`${sp.from}T00:00:00.000Z`)
    : startOfMonth(now);
  const to = sp.to ? new Date(`${sp.to}T23:59:59.999Z`) : endOfMonth(now);

  const [rows, totals, notices, tabCounts] = await Promise.all([
    getSiteSummaries({ from, to, siteScope }),
    getProgramTotals({ from, to, siteScope }),
    getActiveNoticeBoardItems(),
    getAudienceTabCounts(siteScope),
  ]);

  const fromStr = format(from, "yyyy-MM-dd");
  const toStr = format(to, "yyyy-MM-dd");
  const fromDisplay = format(from, "dd/MM/yyyy");
  const toDisplay = format(to, "dd/MM/yyyy");

  return (
    <DashboardPageContent
      welcomeName={welcomeName}
      isSuperAdmin={isSuperAdmin}
      tabCounts={tabCounts}
      notices={notices}
      todoStorageKey={todoStorageKey}
      rows={rows}
      totals={totals}
      fromStr={fromStr}
      toStr={toStr}
      fromDisplay={fromDisplay}
      toDisplay={toDisplay}
    />
  );
}
