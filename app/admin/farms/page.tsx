import AdminEntityTable from "@/components/admin/AdminEntityTable";
import { getDb } from "@/lib/db/pool";

export default async function AdminFarmsPage() {
  const db = getDb();
  const [rows] = db ? await db.query("SELECT farms.id, farms.name, users.name AS owner, fields.fieldCount FROM farms JOIN users ON users.id = farms.owner_id LEFT JOIN (SELECT farm_id, COUNT(*) AS fieldCount FROM fields GROUP BY farm_id) fields ON fields.farm_id = farms.id ORDER BY farms.created_at DESC") : [[]];
  return <section className="space-y-6"><header className="rounded-2xl bg-[#e4f4e5] p-7"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#27715d]">Data management</p><h2 className="mt-3 text-3xl font-extrabold text-[#064b3b]">Farms and fields</h2><p className="mt-3 text-base text-[#45675e]">Review registered farms and their related field counts.</p></header><AdminEntityTable title="Farms" description={`${(rows as unknown[]).length} records`} columns={["id", "name", "owner", "fieldCount"]} rows={rows as Record<string, string | number | null>[]} /></section>;
}
