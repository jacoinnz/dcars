import Link from "next/link";
import { endOfMonth, startOfMonth } from "date-fns";
import { getProgramTotals } from "@/lib/aggregates";
import { getDefaultMissingReportAlerts } from "@/lib/alerts";

export const dynamic = "force-dynamic";

export default async function Home() {
  const now = new Date();
  const from = startOfMonth(now);
  const to = endOfMonth(now);
  const [totals, alerts] = await Promise.all([
    getProgramTotals({ from, to }),
    getDefaultMissingReportAlerts(),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
          Youth development programme
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
          Less spreadsheet work, clearer visibility across sites
        </h1>
        <p className="mt-3 text-base leading-relaxed text-stone-600">
          Facilitators submit session numbers from any device; the system aggregates totals, flags
          gaps, and supports PDF exports for reporting.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            This month — reports
          </p>
          <p className="mt-2 text-3xl font-semibold text-stone-900">{totals.reports}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Youth present (sum)
          </p>
          <p className="mt-2 text-3xl font-semibold text-stone-900">{totals.youthPresent}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Sites</p>
          <p className="mt-2 text-3xl font-semibold text-stone-900">{totals.sites}</p>
        </div>
      </div>

      <section className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-sm font-semibold text-amber-950">Missing data (last 7 days)</h2>
        <p className="mt-1 text-sm text-amber-950/90">
          Sites with no session report dated within the last week (rolling from today).
        </p>
        {alerts.length === 0 ? (
          <p className="mt-4 text-sm font-medium text-emerald-900">
            All sites have at least one recent report. Nice work.
          </p>
        ) : (
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-amber-950">
            {alerts.map((a) => (
              <li key={a.siteId}>
                <span className="font-medium">{a.siteName}</span> ({a.siteCode})
                {a.daysSinceLastReport === null
                  ? " — no submissions yet"
                  : ` — last report ${a.daysSinceLastReport} day(s) ago`}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/entry"
          className="inline-flex items-center justify-center rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
        >
          Enter session data
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-900 shadow-sm transition hover:border-teal-300 hover:bg-teal-50"
        >
          Open dashboard
        </Link>
        <Link
          href="/reports"
          className="inline-flex items-center justify-center rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-900 shadow-sm transition hover:border-teal-300 hover:bg-teal-50"
        >
          Export PDF
        </Link>
      </div>
    </div>
  );
}
