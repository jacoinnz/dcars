import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminModuleByKey } from "@/lib/admin-control-center";
import { isLessonPlanSidebarModuleKey } from "@/lib/lesson-plan-menu";

type Props = { params: Promise<{ key: string }> };

export default async function LessonPlanModulePage({ params }: Props) {
  const { key } = await params;
  if (!isLessonPlanSidebarModuleKey(key)) notFound();

  const mod = getAdminModuleByKey(key);
  if (!mod) notFound();

  const isLive = mod.status === "live" && mod.href;

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <Link href="/dashboard" className="text-sm font-medium text-teal-800 underline">
        ← Dashboard
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-stone-900">{mod.title}</h1>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
            mod.status === "live"
              ? "bg-teal-100 text-teal-900"
              : "bg-amber-100 text-amber-950"
          }`}
        >
          {mod.status === "live" ? "Available" : "Planned"}
        </span>
      </div>
      <p className="mt-3 max-w-2xl text-sm text-stone-600">{mod.description}</p>

      {isLive ? (
        <p className="mt-8">
          <Link
            href={mod.href!}
            className="inline-flex rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Open in app
          </Link>
        </p>
      ) : (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
          <p className="font-semibold">Not built in this deployment yet</p>
          <p className="mt-2 text-amber-950/90">
            This lesson planning module is on the roadmap. Curriculum documents today are available under school syllabuses in{" "}
            <Link href="/evaluations" className="font-semibold text-teal-800 underline">
              Evaluations
            </Link>
            .
          </p>
        </div>
      )}

      <p className="mt-10 text-sm text-stone-600">
        <Link href="/dashboard" className="font-semibold text-teal-800 underline">
          Back to dashboard
        </Link>
      </p>
    </div>
  );
}
