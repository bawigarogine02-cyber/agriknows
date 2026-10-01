import AdminEntityTable from "@/components/admin/AdminEntityTable";
import { getAuditLogs } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const logs = await getAuditLogs();
  const rows = logs.map((l) => ({
    id: l.id,
    action: l.action,
    target_table: l.target_table,
    user_name: l.user_name || "System User",
    details: l.details,
    created_at: new Date(l.created_at).toLocaleDateString(),
  }));

  return (
    <section className="space-y-6">
      <header className="rounded-2xl bg-[#e4f4e5] p-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#27715d]">System records</p>
        <h2 className="mt-3 text-3xl font-extrabold text-[#064b3b]">Generated Audit & Activity Reports</h2>
        <p className="mt-3 text-base text-[#45675e]">Review audit logs and activity events captured across farm workflows.</p>
      </header>
      <AdminEntityTable
        title="Audit Logs & Reports"
        description={`${rows.length} records`}
        columns={["id", "action", "target_table", "user_name", "details", "created_at"]}
        rows={rows as Record<string, string | number | null>[]}
      />
    </section>
  );
}
