import Link from "next/link";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { getSiteSummaries, getProgramTotals } from "@/lib/aggregates";

export default async function DashboardPage({
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

  const [rows, totals] = await Promise.all([
    getSiteSummaries({ from, to }),
    getProgramTotals({ from, to }),
  ]);

  const fromStr = format(from, "yyyy-MM-dd");
  const toStr = format(to, "yyyy-MM-dd");

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Dashboard</h1>
          <p className="text-sm text-stone-600">
            Session metrics and participant registrations by site ({fromStr} → {toStr}).
          </p>
        </div>
        <form className="flex flex-wrap items-end gap-2" method="get">
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
            Apply
          </button>
        </form>
      </div>

      <section className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Registrations</p>
          <p className="mt-1 text-2xl font-semibold text-stone-900">
            {totals.participantRegistrations}
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Reports</p>
          <p className="mt-1 text-2xl font-semibold text-stone-900">{totals.reports}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Youth present (sum)
          </p>
          <p className="mt-1 text-2xl font-semibold text-stone-900">{totals.youthPresent}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Youth registered (sum)
          </p>
          <p className="mt-1 text-2xl font-semibold text-stone-900">{totals.youthRegistered}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Sites</p>
          <p className="mt-1 text-2xl font-semibold text-stone-900">{totals.sites}</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-stone-900">By site</h2>
          <p className="text-xs text-stone-600">
            Attendance rate is present ÷ registered for the selected window (session-level sums).
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-600">
              <tr>
                <th className="px-4 py-3">Site</th>
                <th className="px-4 py-3">Participants</th>
                <th className="px-4 py-3">Reports</th>
                <th className="px-4 py-3">Present</th>
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3">Avg attendance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.siteId} className="border-t border-stone-100">
                  <td className="px-4 py-3 font-medium text-stone-900">
                    {r.siteName}{" "}
                    <span className="text-stone-500">({r.siteCode})</span>
                  </td>
                  <td className="px-4 py-3 text-stone-800">{r.participantRegistrations}</td>
                  <td className="px-4 py-3 text-stone-800">{r.reportCount}</td>
                  <td className="px-4 py-3 text-stone-800">{r.totalYouthPresent}</td>
                  <td className="px-4 py-3 text-stone-800">{r.totalYouthRegistered}</td>
                  <td className="px-4 py-3 text-stone-800">
                    {r.avgAttendanceRate === null
                      ? "—"
                      : `${Math.round(r.avgAttendanceRate * 1000) / 10}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-sm text-stone-600">
        Need a printable file?{" "}
        <Link className="font-semibold text-teal-800 underline" href="/reports">
          Open reports
        </Link>
        .
      </p>
    </div>
  );
}
