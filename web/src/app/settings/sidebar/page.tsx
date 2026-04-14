import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { SidebarManagerClient } from "./sidebar-manager-client";
import { authOptions } from "@/lib/auth-options";

export const metadata = {
  title: "Sidebar manager — Youth programme",
};

export default async function SidebarSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  return <SidebarManagerClient isSuperAdmin={Boolean(session.user.isSuperAdmin)} />;
}
