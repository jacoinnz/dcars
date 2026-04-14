import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeacherFeatureByKey, isTeacherFeatureKey } from "@/lib/teacher-panel";

type Props = { params: Promise<{ key: string }> };

export default async function TeacherFeaturePage({ params }: Props) {
  const { key } = await params;
  if (!isTeacherFeatureKey(key)) notFound();

  const item = getTeacherFeatureByKey(key);
  if (!item) notFound();

  const isLive = item.status === "live" && item.href;

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <Link href="/teachers" className="text-sm font-medium text-teal-800 underline">
        ← Teacher panel
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
          <p className="font-semibold">Not available in the app yet</p>
          <p className="mt-2 text-amber-950/90">
            Homework authoring with due dates and student hand-in will be added in a future update.
            For now, use communications and evaluation scores to keep families and records up to date.
          </p>
        </div>
      )}

      <p className="mt-10 text-sm text-stone-600">
        <Link href="/teachers" className="font-semibold text-teal-800 underline">
          Back to teacher panel
        </Link>
      </p>
    </div>
  );
}
