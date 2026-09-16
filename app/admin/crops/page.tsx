import AdminEntityTable from "@/components/admin/AdminEntityTable";
import { getDb } from "@/lib/db/pool";

export const dynamic = "force-dynamic";

export default async function AdminCropsPage() {
  let rows: unknown[] = [];
  try {
    const db = getDb();
    if (db) {
      const [res] = await db.query("SELECT id, name, season, created_at AS createdAt FROM crops ORDER BY name");
      rows = res as unknown[];
    }
  } catch {}
  return <section className="space-y-6"><header className="rounded-2xl bg-[#e4f4e5] p-7"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#27715d]">Data management</p><h2 className="mt-3 text-3xl font-extrabold text-[#064b3b]">Crop records</h2><p className="mt-3 text-base text-[#45675e]">Existing crops and their growing seasons.</p></header><AdminEntityTable title="Crops" description={`${rows.length} records`} columns={["id", "name", "season", "createdAt"]} rows={rows as Record<string, string | number | null>[]} /></section>;
}
