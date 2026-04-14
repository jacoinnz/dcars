import { notFound } from "next/navigation";
import { AdminModuleDetail } from "@/app/admin/admin-module-detail";
import { getAdminModuleByKey, isAdminModuleKey } from "@/lib/admin-control-center";

type Props = { params: Promise<{ key: string }> };

export default async function AdminModuleDetailPage({ params }: Props) {
  const { key } = await params;
  if (!isAdminModuleKey(key)) notFound();

  const mod = getAdminModuleByKey(key);
  if (!mod) notFound();

  return <AdminModuleDetail mod={mod} />;
}
