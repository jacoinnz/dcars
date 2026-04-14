import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminModuleByKey, isAdminModuleKey } from "@/lib/admin-control-center";

type Props = { params: Promise<{ key: string }> };

export default async function AdminModuleDetailPage({ params }: Props) {
  const { key } = await params;
  if (!isAdminModuleKey(key)) notFound();

  const mod = getAdminModuleByKey(key);
  if (!mod) notFound();

  const isLive = mod.status === "live" && mod.href;

  return (
    <div>
      <Link href="/admin" className="text-sm font-medium text-teal-800 underline">
        ← Admin control center
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
            This module is on the product roadmap. The control center groups it so you can align
            training and future procurement. Core data (sites, schools, users, students, attendance,
            exams, notices) is already modelled elsewhere in the app where marked &quot;Available&quot;.
          </p>
        </div>
      )}

      <p className="mt-10 text-sm text-stone-600">
        <Link href="/admin" className="font-semibold text-teal-800 underline">
          Back to control center
        </Link>
      </p>
    </div>
  );
}
