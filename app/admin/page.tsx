import AdminAuditFeed from "@/components/admin/AdminAuditFeed";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import { getAuditLogs } from "@/lib/db/repository";
import { Activity, ShieldCheck, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const auditLogs = await getAuditLogs();

  return (
    <section className="space-y-8">
      <header className="rounded-2xl bg-gradient-to-r from-[#e4f4e5] to-[#e0f5eb] p-7 sm:p-9">
        <span className="text-xs font-bold uppercase tracking-widest text-[#27715d]">
          AgriKMS Module 6 — System Governance
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#064b3b]">
          System Audit & User Monitoring
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#45675e]">
          Platform governance tools for managing user role assignments (Farmer, Researcher, Admin), account status toggles, and real-time compliance audit logs.
        </p>
      </header>

      {/* User Management Section */}
      <AdminUsersTable />

      {/* Audit Log Activity Feed Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <AdminAuditFeed initialLogs={auditLogs} />
      </section>
    </section>
  );
}
