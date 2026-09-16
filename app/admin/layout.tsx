import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getSession } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin" || user.status !== "active") redirect("/dashboard");
  return <AdminShell user={user}>{children}</AdminShell>;
}
