import Link from "next/link";
import { notFound } from "next/navigation";
import { getHrFeatureByKey, isHrFeatureKey } from "@/lib/hr-panel";

type Props = { params: Promise<{ key: string }> };

const EXTRA: Record<string, string> = {
  "staff-attendance":
    "This will track employee attendance (not the same as student roll under Attendance in the main menu).",
  "staff-attendance-report": "Exports will align with your HR rules and reporting calendar once attendance is live.",
  payroll: "Pay amounts, tax, and benefits depend on jurisdiction and your payroll provider.",
  "payroll-report": "Typical outputs: cost by department, GL mapping, and payment register.",
};

export default async function HrFeaturePage({ params }: Props) {
  const { key } = await params;
  if (!isHrFeatureKey(key)) notFound();

  const item = getHrFeatureByKey(key);
  if (!item) notFound();

  const isLive = item.status === "live" && item.href;

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <Link href="/hr" className="text-sm font-medium text-teal-800 underline">
        ← Human resources
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-stone-900">{item.title}</h1>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
            item.status === "live" ? "bg-teal-100 text-teal-900" : "bg-amber-100 text-amber-950"
          }`}
        >
          {item.status === "live" ? "Available" : "Coming soon"}
        </span>
      </div>
      <p className="mt-3 text-sm text-stone-600">{item.description}</p>
      {EXTRA[key] ? <p className="mt-3 text-sm text-stone-600">{EXTRA[key]}</p> : null}

      {isLive ? (
        <p className="mt-8">
          <Link
            href={item.href!}
            className="inline-flex rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Open
          </Link>
        </p>
      ) : (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
          <p className="font-semibold">Not available in this deployment</p>
          <p className="mt-2 text-amber-950/90">
            Staff time tracking and payroll are on the roadmap. The staff directory and student
            attendance tools are available today; programme dashboards and PDF reports cover broader
            operational reporting.
          </p>
        </div>
      )}

      <p className="mt-10 text-sm text-stone-600">
        <Link href="/hr" className="font-semibold text-teal-800 underline">
          Back to HR hub
        </Link>
      </p>
    </div>
  );
}
