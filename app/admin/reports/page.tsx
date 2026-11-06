import AdminEntityTable from "@/components/admin/AdminEntityTable";
import { getAdminSystemReport, getAuditLogs } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const [logs, summary] = await Promise.all([getAuditLogs(), getAdminSystemReport()]);
  const rows = logs.map((l) => ({
    id: l.id,
    action: l.action,
    target_table: l.target_table,
    user_name: l.user_name || "—",
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
      <section aria-label="System data summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summary.map((item) => (
          <article key={item.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">{item.label}</p>
            <strong className="mt-2 block text-3xl font-extrabold text-[#123d35]">{item.value.toLocaleString()}</strong>
          </article>
        ))}
      </section>
      <AdminEntityTable
        title="Audit Logs & Reports"
        description={`${rows.length} records`}
        columns={["id", "action", "target_table", "user_name", "details", "created_at"]}
        rows={rows as Record<string, string | number | null>[]}
      />
    </section>
  );
}
