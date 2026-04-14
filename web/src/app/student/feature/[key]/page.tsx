import Link from "next/link";
import { notFound } from "next/navigation";
import { getStudentFeatureByKey, isStudentFeatureKey } from "@/lib/student-panel";

type Props = { params: Promise<{ key: string }> };

const EXTRA: Record<string, string> = {
  "class-routine":
    "Your timetable will appear here once the school defines periods and rooms in this system.",
  invoices: "Invoices and balances require a fees module and your school’s billing rules.",
  "pay-online": "Online payments need a card or bank provider integrated by your school.",
  messaging: "Messaging will let you reach staff who use this app, with appropriate safeguards.",
};

export default async function StudentFeaturePage({ params }: Props) {
  const { key } = await params;
  if (!isStudentFeatureKey(key)) notFound();

  const item = getStudentFeatureByKey(key);
  if (!item) notFound();

  const isLive = item.status === "live" && item.href;

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <Link href="/student" className="text-sm font-medium text-teal-800 underline">
        ← Student panel
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
          <p className="font-semibold">Not available yet</p>
          <p className="mt-2 text-amber-950/90">
            Your school may share timetables, bills, or contact details through other channels for now.
            Marks, attendance, and study files are available from the student panel when your login is
            linked.
          </p>
        </div>
      )}

      <p className="mt-10 text-sm text-stone-600">
        <Link href="/student" className="font-semibold text-teal-800 underline">
          Back to student panel
        </Link>
      </p>
    </div>
  );
}
