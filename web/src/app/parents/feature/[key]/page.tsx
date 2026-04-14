import Link from "next/link";
import { notFound } from "next/navigation";
import { getParentFeatureByKey, isParentFeatureKey } from "@/lib/parent-panel";

type Props = { params: Promise<{ key: string }> };

export default async function ParentFeaturePage({ params }: Props) {
  const { key } = await params;
  if (!isParentFeatureKey(key)) notFound();

  const item = getParentFeatureByKey(key);
  if (!item) notFound();

  const isLive = item.status === "live" && item.href;

  const extraCopy: Record<string, string> = {
    invoices:
      "Fee invoices and online payments will connect to your school’s finance rules and payment provider.",
    "class-routine":
      "When class periods and rooms are stored per school, your child’s timetable will appear here.",
    messaging:
      "In-app messaging will require staff to use the same system and appropriate safeguarding settings.",
  };

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <Link href="/parents" className="text-sm font-medium text-teal-800 underline">
        ← Parents panel
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
      {extraCopy[key] ? <p className="mt-3 text-sm text-stone-600">{extraCopy[key]}</p> : null}

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
          <p className="font-semibold">This feature is not available in the app yet</p>
          <p className="mt-2 text-amber-950/90">
            Your school may share invoices, timetables, or contact channels outside this system for
            now. Marks and attendance are available from the parents panel where your account is
            linked to a student.
          </p>
        </div>
      )}

      <p className="mt-10 text-sm text-stone-600">
        <Link href="/parents" className="font-semibold text-teal-800 underline">
          Back to parents panel
        </Link>
      </p>
    </div>
  );
}
