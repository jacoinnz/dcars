import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { STUDENT_ATTENDANCE_PANEL_GROUPS } from "@/lib/student-attendance-panel";
import { authOptions } from "@/lib/auth-options";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Student attendance — Youth programme",
};

export default async function StudentAttendanceHubPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold text-stone-900">Student attendance</h1>
      <p className="mt-2 max-w-3xl text-sm text-stone-600">
        Daily roll for staff, plus read-only views for learners and families — the same information
        architecture as typical{" "}
        <span className="font-medium text-stone-800">student attendance</span> screens in school
        systems. Cards marked <span className="font-medium text-stone-800">Available</span> are live
        in this app.
      </p>

      <div className="mt-10 flex flex-col gap-10">
        {STUDENT_ATTENDANCE_PANEL_GROUPS.map((group) => (
          <section key={group.id} aria-labelledby={`sa-${group.id}`}>
            <h2 id={`sa-${group.id}`} className="text-lg font-semibold text-stone-900">
              {group.title}
            </h2>
            {group.description ? (
              <p className="mt-1 max-w-3xl text-sm text-stone-600">{group.description}</p>
            ) : null}
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {group.items.map((item) => {
                const badge = (
                  <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold uppercase text-teal-900">
                    Available
                  </span>
                );

                const inner = (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-stone-900">{item.title}</p>
                      {badge}
                    </div>
                    <p className="mt-2 text-sm text-stone-600">{item.description}</p>
                    <p className="mt-3 text-sm font-medium text-teal-800">Open →</p>
                  </>
                );

                if (item.href) {
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
                  <li key={item.key} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                    {inner}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-12 border-t border-stone-200 pt-10">
        <h2 className="text-lg font-semibold text-stone-900">Related</h2>
        <ul className="mt-4 flex flex-wrap gap-4 text-sm">
          <li>
            <Link href="/students" className="font-semibold text-teal-800 underline">
              Student information
            </Link>
          </li>
          <li>
            <Link href="/dashboard" className="font-semibold text-teal-800 underline">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/evaluations" className="font-semibold text-teal-800 underline">
              Evaluations
            </Link>
          </li>
        </ul>
      </section>

      <p className="mt-10 text-sm text-stone-600">
        Assign staff under{" "}
        <Link href="/admin/institutions" className="font-semibold text-teal-800 underline">
          Admin → Schools
        </Link>{" "}
        so they can record attendance; link guardians there for family visibility.
      </p>
    </div>
  );
}
