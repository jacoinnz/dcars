import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { STUDENT_PANEL_GROUPS } from "@/lib/student-panel";
import { getPortalStudentIdForUser } from "@/lib/student-portal-access";
import { authOptions } from "@/lib/auth-options";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Student panel — Youth programme",
};

export default async function StudentPanelPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const portalStudentId = await getPortalStudentIdForUser(session.user.id);

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold text-stone-900">Student panel</h1>
      <p className="mt-2 max-w-3xl text-sm text-stone-600">
        Signed-in view for learners. Your school must link your account to your student profile
        (Admin → Schools → Student portal login). Then you can open marks, attendance, and study
        files for <strong className="font-medium text-stone-800">your</strong> record only.
      </p>

      {!portalStudentId ? (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
          <p className="font-semibold">Your login is not linked to a student profile yet</p>
          <p className="mt-2 text-amber-950/90">
            Ask your school administrator to connect this account under{" "}
            <span className="font-medium">Admin → Schools → your school → Student portal login</span>.
            Parents can use the{" "}
            <Link href="/parents" className="font-semibold text-teal-900 underline">
              Parents panel
            </Link>{" "}
            if they are linked as guardians instead.
          </p>
        </div>
      ) : null}

      <div className="mt-10 flex flex-col gap-10">
        {STUDENT_PANEL_GROUPS.map((group) => (
          <section key={group.id} aria-labelledby={`sp-${group.id}`}>
            <h2 id={`sp-${group.id}`} className="text-lg font-semibold text-stone-900">
              {group.title}
            </h2>
            {group.description ? (
              <p className="mt-1 max-w-3xl text-sm text-stone-600">{group.description}</p>
            ) : null}
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {group.items.map((item) => {
                const disabled = !portalStudentId && item.status === "live";
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

                if (item.status === "live" && item.href && !disabled) {
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

                if (item.status === "live" && item.href && disabled) {
                  return (
                    <li key={item.key}>
                      <div className="block h-full rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-5 opacity-80">
                        {inner}
                        <p className="mt-2 text-xs text-stone-500">Link your student account first.</p>
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={item.key}>
                    <Link
                      href={`/student/feature/${item.key}`}
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
    </div>
  );
}
