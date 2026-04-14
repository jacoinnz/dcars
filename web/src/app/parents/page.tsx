import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { PARENT_PANEL_GROUPS } from "@/lib/parent-panel";
import { authOptions } from "@/lib/auth-options";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Parents panel — Youth programme",
};

export default async function ParentsPanelPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold text-stone-900">Parents panel</h1>
      <p className="mt-2 max-w-3xl text-sm text-stone-600">
        For guardians linked to a student by their school. Use{" "}
        <span className="font-medium text-stone-800">Available</span> to open live tools;{" "}
        <span className="font-medium text-stone-800">Coming soon</span> shows features that need your
        school’s billing, timetable, or messaging setup in a future release.
      </p>

      <div className="mt-10 flex flex-col gap-10">
        {PARENT_PANEL_GROUPS.map((group) => (
          <section key={group.id} aria-labelledby={`pp-${group.id}`}>
            <h2 id={`pp-${group.id}`} className="text-lg font-semibold text-stone-900">
              {group.title}
            </h2>
            {group.description ? (
              <p className="mt-1 max-w-3xl text-sm text-stone-600">{group.description}</p>
            ) : null}
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {group.items.map((item) => {
                const badge =
                  item.status === "live" ? (
                    <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold uppercase text-teal-900">
                      Available
                    </span>
                  ) : (
                    <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-bold uppercase text-stone-700">
                      Coming soon
                    </span>
                  );

                const inner = (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-stone-900">{item.title}</p>
                      {badge}
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
                        className="block h-full rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/40"
                      >
                        {inner}
                      </Link>
                    </li>
                  );
                }

                return (
                  <li key={item.key}>
                    <Link
                      href={`/parents/feature/${item.key}`}
                      className="block h-full rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-stone-300 hover:bg-stone-50"
                    >
                      {inner}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-12 border-t border-stone-200 pt-8 text-sm text-stone-600">
        Not linked to a child yet? Ask your school to add your account under{" "}
        <span className="font-medium text-stone-800">Admin → Schools → Attendance setup → Guardian links</span>.
      </p>
    </div>
  );
}
