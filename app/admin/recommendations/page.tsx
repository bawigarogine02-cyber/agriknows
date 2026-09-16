import AdminEntityTable from "@/components/admin/AdminEntityTable";
import { getDb } from "@/lib/db/pool";

export const dynamic = "force-dynamic";

export default async function AdminRecommendationsPage() {
  let rows: unknown[] = [];
  try {
    const db = getDb();
    if (db) {
      const [res] = await db.query("SELECT id, title, status, user_id AS userId, created_at AS createdAt FROM recommendations ORDER BY created_at DESC");
      rows = res as unknown[];
    }
  } catch {}
  return <section className="space-y-6"><header className="rounded-2xl bg-[#e4f4e5] p-7"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#27715d]">Data management</p><h2 className="mt-3 text-3xl font-extrabold text-[#064b3b]">Recommendations</h2><p className="mt-3 text-base text-[#45675e]">Monitor recommendations created by the agricultural workflows.</p></header><AdminEntityTable title="Recommendations" description={`${rows.length} records`} columns={["id", "title", "status", "userId", "createdAt"]} rows={rows as Record<string, string | number | null>[]} /></section>;
}
