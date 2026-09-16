import AdminEntityTable from "@/components/admin/AdminEntityTable";
import { getDb } from "@/lib/db/pool";

export default async function AdminKnowledgePage() {
  const db = getDb();
  const [rows] = db ? await db.query("SELECT id, title, category, published_at AS publishedAt, created_at AS createdAt FROM knowledge_articles ORDER BY created_at DESC") : [[]];
  return <section className="space-y-6"><header className="rounded-2xl bg-[#e4f4e5] p-7"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#27715d]">Website content</p><h2 className="mt-3 text-3xl font-extrabold text-[#064b3b]">Knowledge articles</h2><p className="mt-3 text-base text-[#45675e]">Review articles and publication status from the existing content model.</p></header><AdminEntityTable title="Articles" description={`${(rows as unknown[]).length} records`} columns={["id", "title", "category", "publishedAt", "createdAt"]} rows={rows as Record<string, string | number | null>[]} /></section>;
}
