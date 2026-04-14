import { redirect } from "next/navigation";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { AdminLayoutClient } from "./admin-layout-client";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSessionWithBypass();
  if (!session?.user?.isSuperAdmin) {
    redirect("/");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
