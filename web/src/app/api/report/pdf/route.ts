import { NextResponse } from "next/server";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { getServerSession } from "next-auth/next";
import { getProgramTotals, getSiteSummaries } from "@/lib/aggregates";
import { authOptions } from "@/lib/auth-options";
import { buildSummaryPdf } from "@/lib/pdf-report";
import { getAccessibleSiteIds } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const siteScope = await getAccessibleSiteIds(
    session.user.id,
    Boolean(session.user.isSuperAdmin),
  );

  const { searchParams } = new URL(request.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const now = new Date();
  const from = fromParam ? new Date(`${fromParam}T00:00:00.000Z`) : startOfMonth(now);
  const to = toParam ? new Date(`${toParam}T23:59:59.999Z`) : endOfMonth(now);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return NextResponse.json({ error: "Invalid from/to date" }, { status: 400 });
  }

  const scopeArg = siteScope === "all" ? "all" : siteScope;
  const [rows, totals] = await Promise.all([
    getSiteSummaries({ from, to, siteScope: scopeArg }),
    getProgramTotals({ from, to, siteScope: scopeArg }),
  ]);

  const pdfBytes = await buildSummaryPdf({
    title: "Youth programme — summary",
    periodLabel: `${format(from, "yyyy-MM-dd")} → ${format(to, "yyyy-MM-dd")}`,
    generatedAt: new Date(),
    totals,
    rows,
  });

  const filename = `youth-programme-report-${format(from, "yyyyMMdd")}-${format(to, "yyyyMMdd")}.pdf`;

  return new NextResponse(new Uint8Array(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
