import { redirect } from "next/navigation";
import DashboardShell from "@/app/dashboard-shell";
import { getSession } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin" || user.status !== "active") redirect("/dashboard");
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
