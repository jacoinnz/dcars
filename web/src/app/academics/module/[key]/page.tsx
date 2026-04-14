import { notFound } from "next/navigation";
import { SidebarModuleDetail } from "@/components/sidebar-module-detail";
import { isAcademicsSidebarModuleKey } from "@/lib/academics-menu";
import { getAdminModuleByKey } from "@/lib/admin-control-center";

type Props = { params: Promise<{ key: string }> };

export default async function AcademicsModulePage({ params }: Props) {
  const { key } = await params;
  if (!isAcademicsSidebarModuleKey(key)) notFound();

  const mod = getAdminModuleByKey(key);
  if (!mod) notFound();

  return (
    <SidebarModuleDetail
      mod={mod}
      homeHref="/dashboard"
      homeLabel="Dashboard"
      plannedExtra="This module is on the product roadmap. Academics menu items link here for training and future rollout. Related live tools (exams, evaluations) are linked where marked Available."
    />
  );
}
