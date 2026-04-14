import { endOfMonth, startOfMonth } from "date-fns";
import { getProgramTotals } from "@/lib/aggregates";
import { getDefaultMissingReportAlerts } from "@/lib/alerts";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { getAudienceTabCounts } from "@/lib/audience-tab-counts";
import { getActiveNoticeBoardItems } from "@/lib/notice-board";
import { getSessionSiteScope } from "@/lib/site-scope";
import { HomePageContent } from "./home-page-content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSessionWithBypass();
  const welcomeName = session?.user?.name?.trim() || session?.user?.email?.trim() || null;
  const isSuperAdmin = Boolean(session?.user?.isSuperAdmin);
  const todoStorageKey = session?.user?.id ?? "guest";

  const scopeCtx = await getSessionSiteScope();
  const siteScope = scopeCtx?.siteScope ?? "all";

  const now = new Date();
  const from = startOfMonth(now);
  const to = endOfMonth(now);
  const [totals, alerts, notices, tabCounts] = await Promise.all([
    getProgramTotals({ from, to, siteScope }),
    getDefaultMissingReportAlerts(siteScope),
    getActiveNoticeBoardItems(),
    getAudienceTabCounts(siteScope),
  ]);

  return (
    <HomePageContent
      welcomeName={welcomeName}
      isSuperAdmin={isSuperAdmin}
      tabCounts={tabCounts}
      notices={notices}
      todoStorageKey={todoStorageKey}
      totals={totals}
      alerts={alerts}
    />
  );
}
