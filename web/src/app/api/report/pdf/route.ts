import { NextResponse } from "next/server";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { getProgramTotals, getSiteSummaries } from "@/lib/aggregates";
import { buildSummaryPdf } from "@/lib/pdf-report";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const now = new Date();
  const from = fromParam ? new Date(`${fromParam}T00:00:00.000Z`) : startOfMonth(now);
  const to = toParam ? new Date(`${toParam}T23:59:59.999Z`) : endOfMonth(now);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return NextResponse.json({ error: "Invalid from/to date" }, { status: 400 });
  }

  const [rows, totals] = await Promise.all([
    getSiteSummaries({ from, to }),
    getProgramTotals({ from, to }),
  ]);

  const pdfBytes = await buildSummaryPdf({
    title: "Youth programme — session summary",
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
