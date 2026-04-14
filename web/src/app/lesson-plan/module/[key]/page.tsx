import Link from "next/link";
import { notFound } from "next/navigation";
import { SidebarModuleDetail } from "@/components/sidebar-module-detail";
import { getAdminModuleByKey } from "@/lib/admin-control-center";
import { isLessonPlanSidebarModuleKey } from "@/lib/lesson-plan-menu";

type Props = { params: Promise<{ key: string }> };

export default async function LessonPlanModulePage({ params }: Props) {
  const { key } = await params;
  if (!isLessonPlanSidebarModuleKey(key)) notFound();

  const mod = getAdminModuleByKey(key);
  if (!mod) notFound();

  return (
    <SidebarModuleDetail
      mod={mod}
      homeHref="/dashboard"
      homeLabel="Dashboard"
      plannedExtra={
        <>
          This lesson planning module is on the roadmap. Curriculum documents today are available under school syllabuses in{" "}
          <Link
            href="/evaluations"
            style={{ fontWeight: 600, color: "var(--mantine-color-blue-7)", textDecoration: "underline" }}
          >
            Evaluations
          </Link>
          .
        </>
      }
    />
  );
}
