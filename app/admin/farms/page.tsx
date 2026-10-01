import AdminEntityTable from "@/components/admin/AdminEntityTable";
import { getFarms } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function AdminFarmsPage() {
  const farms = await getFarms("admin");
  const rows = farms.map((f) => ({
    id: f.id,
    name: f.name,
    location: f.location,
    soil_type: f.soil_type,
    total_area: `${f.total_area} ha`,
    field_count: f.field_count || 0,
  }));

  return (
    <section className="space-y-6">
      <header className="rounded-2xl bg-[#e4f4e5] p-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#27715d]">Data management</p>
        <h2 className="mt-3 text-3xl font-extrabold text-[#064b3b]">Farms and fields</h2>
        <p className="mt-3 text-base text-[#45675e]">Review registered farms and their related field counts.</p>
      </header>
      <AdminEntityTable
        title="Farms"
        description={`${rows.length} records`}
        columns={["id", "name", "location", "soil_type", "total_area", "field_count"]}
        rows={rows as Record<string, string | number | null>[]}
      />
    </section>
  );
}
