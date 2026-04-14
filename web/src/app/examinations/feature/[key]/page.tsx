import Link from "next/link";
import { notFound } from "next/navigation";
import {
  EXAMINATION_FEATURE_EMBEDDED_HELP,
  getExaminationFeatureByKey,
  isExaminationFeatureKey,
} from "@/lib/examination-panel";

type Props = { params: Promise<{ key: string }> };

export default async function ExaminationFeaturePage({ params }: Props) {
  const { key } = await params;
  if (!isExaminationFeatureKey(key)) notFound();

  const item = getExaminationFeatureByKey(key);
  if (!item) notFound();

  const isLiveWithHref = item.status === "live" && Boolean(item.href);
  const isLiveEmbedded = item.status === "live" && !item.href;
  const embeddedHelp = EXAMINATION_FEATURE_EMBEDDED_HELP[key];

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <Link href="/examinations" className="text-sm font-medium text-teal-800 underline">
        ← Examinations
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
      {embeddedHelp && isLiveEmbedded ? (
        <p className="mt-3 text-sm text-stone-600">{embeddedHelp}</p>
      ) : null}

      {isLiveWithHref ? (
        <p className="mt-8">
          <Link
            href={item.href!}
            className="inline-flex rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Open examinations
          </Link>
        </p>
      ) : null}

      {isLiveEmbedded ? (
        <p className="mt-8">
          <Link
            href="/examinations"
            className="inline-flex rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-900 shadow-sm hover:bg-stone-50"
          >
            Go to examination centre
          </Link>
        </p>
      ) : null}

      {item.status === "planned" ? (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
          <p className="font-semibold">Not available in this deployment</p>
          <p className="mt-2 text-amber-950/90">
            This examination capability is on the roadmap. The examination centre already supports
            periods, timetables, notices, seat plans, routines, and mark sheets per school.
          </p>
        </div>
      ) : null}

      <p className="mt-10 text-sm text-stone-600">
        <Link href="/examinations" className="font-semibold text-teal-800 underline">
          Back to examinations hub
        </Link>
      </p>
    </div>
  );
}
