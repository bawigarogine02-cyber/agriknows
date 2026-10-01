import AdminEntityTable from "@/components/admin/AdminEntityTable";
import { getArticles } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function AdminKnowledgePage() {
  const articles = await getArticles();
  const rows = articles.map((a) => ({
    id: a.id,
    title: a.title,
    category: a.category,
    author: a.author_name || "Agronomist Team",
    created_at: new Date(a.created_at).toLocaleDateString(),
  }));

  return (
    <section className="space-y-6">
      <header className="rounded-2xl bg-[#e4f4e5] p-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#27715d]">Website content</p>
        <h2 className="mt-3 text-3xl font-extrabold text-[#064b3b]">Knowledge articles</h2>
        <p className="mt-3 text-base text-[#45675e]">Review articles and publication status from the existing content model.</p>
      </header>
      <AdminEntityTable
        title="Articles"
        description={`${rows.length} records`}
        columns={["id", "title", "category", "author", "created_at"]}
        rows={rows as Record<string, string | number | null>[]}
      />
    </section>
  );
}
