import AdminEntityTable from "@/components/admin/AdminEntityTable";
import { getCrops } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function AdminCropsPage() {
  const crops = await getCrops();
  const rows = crops.map((c) => ({
    id: c.id,
    name: c.name,
    season: c.season,
    ideal_ph: `${c.ideal_ph_min} - ${c.ideal_ph_max}`,
    water: c.water_requirement,
    growth_days: c.growth_days,
  }));

  return (
    <section className="space-y-6">
      <header className="rounded-2xl bg-[#e4f4e5] p-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#27715d]">Data management</p>
        <h2 className="mt-3 text-3xl font-extrabold text-[#064b3b]">Crop records</h2>
        <p className="mt-3 text-base text-[#45675e]">Existing crops and their growing parameters in the system library.</p>
      </header>
      <AdminEntityTable
        title="Crops"
        description={`${rows.length} records`}
        columns={["id", "name", "season", "ideal_ph", "water", "growth_days"]}
        rows={rows as Record<string, string | number | null>[]}
      />
    </section>
  );
}
