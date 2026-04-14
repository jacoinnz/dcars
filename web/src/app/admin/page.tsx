import Link from "next/link";
import { ADMIN_MODULE_GROUPS } from "@/lib/admin-control-center";

export const metadata = {
  title: "Admin — Control center",
};

export default function AdminHomePage() {
  return (
    <div id="overview">
      <h1 className="text-2xl font-semibold text-stone-900">Admin control center</h1>
      <p className="mt-2 max-w-3xl text-sm text-stone-600">
        Super-admin entry point for this youth programme app. Use{" "}
        <strong className="font-medium text-stone-800">Available</strong> items to configure sites,
        schools, users, and to jump into live tools for students, attendance, exams, and notices.{" "}
        <strong className="font-medium text-stone-800">Planned</strong> entries describe modules that
        are not implemented here yet (front office, finance, library, messaging, certificates, and
        more) but are tracked for a full school MIS roadmap.
      </p>

      <div className="mt-10 flex flex-col gap-12">
        {ADMIN_MODULE_GROUPS.map((group) => (
          <section key={group.id} aria-labelledby={`grp-${group.id}`}>
            <h2 id={`grp-${group.id}`} className="text-lg font-semibold text-stone-900">
              {group.title}
            </h2>
            {group.description ? (
              <p className="mt-1 max-w-3xl text-sm text-stone-600">{group.description}</p>
            ) : null}
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {group.items.map((item) => {
                const CardInner = (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-stone-900">{item.title}</p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          item.status === "live"
                            ? "bg-teal-100 text-teal-900"
                            : "bg-stone-200 text-stone-700"
                        }`}
                      >
                        {item.status === "live" ? "Available" : "Planned"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-stone-600">{item.description}</p>
                    <p className="mt-3 text-sm font-medium text-teal-800">
                      {item.status === "live" && item.href ? "Open →" : "Details →"}
                    </p>
                  </>
                );

                if (item.status === "live" && item.href) {
                  return (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        className="block h-full rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/50"
                      >
                        {CardInner}
                      </Link>
                    </li>
                  );
                }

                return (
                  <li key={item.key}>
                    <Link
                      href={`/admin/module/${item.key}`}
                      className="block h-full rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-stone-300 hover:bg-stone-50"
                    >
                      {CardInner}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-12 border-t border-stone-200 pt-8 text-sm text-stone-600">
        Public app areas:{" "}
        <Link href="/students" className="font-semibold text-teal-800 underline">
          Students
        </Link>
        ,{" "}
        <Link href="/hr" className="font-semibold text-teal-800 underline">
          HR
        </Link>
        ,{" "}
        <Link href="/teachers" className="font-semibold text-teal-800 underline">
          Teachers
        </Link>
        ,{" "}
        <Link href="/examinations" className="font-semibold text-teal-800 underline">
          Exams
        </Link>
        ,{" "}
        <Link href="/communications" className="font-semibold text-teal-800 underline">
          Communications
        </Link>
        .
      </p>
    </div>
  );
}
