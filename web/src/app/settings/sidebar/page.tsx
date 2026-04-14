import { redirect } from "next/navigation";
import { SidebarManagerClient } from "./sidebar-manager-client";
import { getServerSessionWithBypass } from "@/lib/auth-options";

export const metadata = {
  title: "Sidebar manager — Youth programme",
};

export default async function SidebarSettingsPage() {
  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) redirect("/login");
  return <SidebarManagerClient isSuperAdmin={Boolean(session.user.isSuperAdmin)} />;
}
