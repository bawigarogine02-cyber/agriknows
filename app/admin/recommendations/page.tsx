import AdminEntityTable from "@/components/admin/AdminEntityTable";
import { getRecommendations } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function AdminRecommendationsPage() {
  const recs = await getRecommendations("admin");
  const rows = recs.map((r) => ({
    id: r.id,
    type: r.type,
    field_name: r.field_name || "Plot 1",
    crop_name: r.crop_name || "Maize",
    rule_applied: r.rule_applied,
    created_at: new Date(r.created_at).toLocaleDateString(),
  }));

  return (
    <section className="space-y-6">
      <header className="rounded-2xl bg-[#e4f4e5] p-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#27715d]">Data management</p>
        <h2 className="mt-3 text-3xl font-extrabold text-[#064b3b]">Recommendations</h2>
        <p className="mt-3 text-base text-[#45675e]">Monitor recommendations created by the agricultural decision workflows.</p>
      </header>
      <AdminEntityTable
        title="Recommendations"
        description={`${rows.length} records`}
        columns={["id", "type", "field_name", "crop_name", "rule_applied", "created_at"]}
        rows={rows as Record<string, string | number | null>[]}
      />
    </section>
  );
}
