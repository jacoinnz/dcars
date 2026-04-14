import Link from "next/link";
import { notFound } from "next/navigation";
import { SidebarModuleDetail } from "@/components/sidebar-module-detail";
import { getAdminModuleByKey } from "@/lib/admin-control-center";
import { isDownloadCenterSidebarModuleKey } from "@/lib/download-center-menu";

type Props = { params: Promise<{ key: string }> };

export default async function DownloadCenterModulePage({ params }: Props) {
  const { key } = await params;
  if (!isDownloadCenterSidebarModuleKey(key)) notFound();

  const mod = getAdminModuleByKey(key);
  if (!mod) notFound();

  return (
    <SidebarModuleDetail
      mod={mod}
      homeHref="/dashboard"
      homeLabel="Dashboard"
      plannedExtra={
        <>
          This download center module is on the roadmap. Teacher content uploads today live under{" "}
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
