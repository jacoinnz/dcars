import Link from "next/link";
import { endOfMonth, format, startOfMonth } from "date-fns";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const now = new Date();
  const from = sp.from
    ? new Date(`${sp.from}T00:00:00.000Z`)
    : startOfMonth(now);
  const to = sp.to ? new Date(`${sp.to}T23:59:59.999Z`) : endOfMonth(now);

  const fromStr = format(from, "yyyy-MM-dd");
  const toStr = format(to, "yyyy-MM-dd");
  const pdfHref = `/api/report/pdf?from=${encodeURIComponent(fromStr)}&to=${encodeURIComponent(toStr)}`;

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold text-stone-900">Reports</h1>
      <p className="mt-2 max-w-2xl text-sm text-stone-600">
        Download a PDF summary for funders or internal reviews. The dashboard stays live; PDFs are
        point-in-time exports for the selected date range.
      </p>

      <form className="mt-8 flex flex-wrap items-end gap-2 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm" method="get">
        <label className="text-xs font-medium text-stone-700">
          From
          <input
            name="from"
            type="date"
            defaultValue={fromStr}
            className="ml-1 rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="text-xs font-medium text-stone-700">
          To
          <input
            name="to"
            type="date"
            defaultValue={toStr}
            className="ml-1 rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-semibold text-white hover:bg-stone-800"
        >
          Update range
        </button>
      </form>

      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-stone-900">PDF export</p>
        <p className="mt-1 text-sm text-stone-600">
          Range: <span className="font-medium text-stone-800">{fromStr}</span> →{" "}
          <span className="font-medium text-stone-800">{toStr}</span>
        </p>
        <a
          href={pdfHref}
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
        >
          Download PDF
        </a>
        <p className="mt-3 text-xs text-stone-500">
          Tip: bookmark the dashboard for day-to-day monitoring; use PDFs for formal reporting
          cycles.
        </p>
      </div>

      <p className="mt-8 text-sm text-stone-600">
        <Link className="font-semibold text-teal-800 underline" href="/dashboard">
          Back to dashboard
        </Link>
      </p>
    </div>
  );
}
