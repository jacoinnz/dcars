import Link from "next/link";
import { notFound } from "next/navigation";
import { SidebarModuleDetail } from "@/components/sidebar-module-detail";
import { getAdminModuleByKey } from "@/lib/admin-control-center";
import { isStudyMaterialSidebarModuleKey } from "@/lib/study-material-menu";

type Props = { params: Promise<{ key: string }> };

export default async function StudyMaterialModulePage({ params }: Props) {
  const { key } = await params;
  if (!isStudyMaterialSidebarModuleKey(key)) notFound();

  const mod = getAdminModuleByKey(key);
  if (!mod) notFound();

  return (
    <SidebarModuleDetail
      mod={mod}
      homeHref="/dashboard"
      homeLabel="Dashboard"
      plannedExtra={
        <>
          This study material module is on the roadmap. Published syllabuses today are managed per school under{" "}
          <Link
            href="/evaluations"
            style={{ fontWeight: 600, color: "var(--mantine-color-blue-7)", textDecoration: "underline" }}
          >
            Evaluations
          </Link>{" "}
          and file uploads under{" "}
          <Link
            href="/teacher-content"
            style={{ fontWeight: 600, color: "var(--mantine-color-blue-7)", textDecoration: "underline" }}
          >
            Teacher content
          </Link>
          .
        </>
      }
    />
  );
}
