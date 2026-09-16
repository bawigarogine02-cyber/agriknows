import DashboardShell from "@/app/dashboard-shell";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}