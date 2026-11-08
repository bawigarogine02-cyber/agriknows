import AdminKnowledgeArticles from "@/components/admin/AdminKnowledgeArticles";
import { getArticles } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function AdminKnowledgePage() {
  const articles = await getArticles(true);

  return (
    <section className="space-y-6">
      <header className="rounded-2xl bg-[#e4f4e5] p-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#27715d]">Website content</p>
        <h2 className="mt-3 text-3xl font-extrabold text-[#064b3b]">Knowledge articles</h2>
        <p className="mt-3 text-base text-[#45675e]">
          Create, edit, publish, and remove agricultural guidance articles.
        </p>
      </header>
      <AdminKnowledgeArticles initialArticles={articles} />
    </section>
  );
}
