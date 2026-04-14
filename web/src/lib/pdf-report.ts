import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { SiteSummary } from "@/lib/aggregates";

/** Standard 14 fonts use WinAnsi; replace common punctuation and unknown chars so drawText never throws. */
function safePdfText(text: string): string {
  return text
    .replace(/\u2192/g, "->")
    .replace(/\u2014/g, "-")
    .replace(/\u2013/g, "-")
    .replace(/[^\x00-\xff]/g, "?");
}

export async function buildSummaryPdf(params: {
  title: string;
  periodLabel: string;
  generatedAt: Date;
  totals: {
    sites: number;
    reports: number;
    youthPresent: number;
    youthRegistered: number;
    participantRegistrations: number;
  };
  rows: SiteSummary[];
}) {
  const pdf = await PDFDocument.create();
  let page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  const left = 50;
  const line = 14;

  const draw = (text: string, size = 11, bold = false) => {
    const lineText = safePdfText(text);
    if (y < 72) {
      page = pdf.addPage([595.28, 841.89]);
      y = 800;
    }
    page.drawText(lineText, {
      x: left,
      y,
      size,
      font: bold ? fontBold : font,
      color: rgb(0.1, 0.1, 0.12),
    });
    y -= line * (size / 11);
  };

  draw(params.title, 16, true);
  draw(`Period: ${params.periodLabel}`);
  draw(`Generated: ${params.generatedAt.toISOString().slice(0, 16).replace("T", " ")} UTC`);
  y -= 8;

  draw(
    `Programme totals — participant registrations: ${params.totals.participantRegistrations}, reports: ${params.totals.reports}, youth present: ${params.totals.youthPresent}, youth registered (sum): ${params.totals.youthRegistered}, sites: ${params.totals.sites}`,
    10,
  );
  y -= 10;

  draw("By site", 12, true);
  y -= 4;

  for (const r of params.rows) {
    const rate =
      r.avgAttendanceRate === null
        ? "n/a"
        : `${Math.round(r.avgAttendanceRate * 1000) / 10}%`;
    draw(
      `${r.siteName} (${r.siteCode}) — participants: ${r.participantRegistrations}, reports: ${r.reportCount}, present: ${r.totalYouthPresent}, avg attendance: ${rate}`,
      10,
    );
  }

  return pdf.save();
}
