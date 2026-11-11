import AdminKnowledgeArticles from "@/components/admin/AdminKnowledgeArticles";
import { getArticles, getCrops, getPestsDiseases } from "@/lib/db/repository";
import AdminKnowledgeApprovals from "@/components/admin/AdminKnowledgeApprovals";
import ResearchPublishingActions from "@/components/consultations/ResearchPublishingActions";

export const dynamic = "force-dynamic";

export default async function AdminKnowledgePage() {
  const [articles, pests, crops] = await Promise.all([
    getArticles(true, { includePending: true }),
    getPestsDiseases({ includePending: true }),
    getCrops(),
  ]);

  return (
    <section className="space-y-6">
      <header className="rounded-2xl bg-[#e4f4e5] p-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#27715d]">Website content</p>
        <h2 className="mt-3 text-3xl font-extrabold text-[#064b3b]">Knowledge articles</h2>
        <p className="mt-3 text-base text-[#45675e]">
          Create, edit, publish, and remove agricultural guidance articles.
        </p>
      </header>
      <ResearchPublishingActions crops={crops} userRole="admin" />
      <AdminKnowledgeApprovals
        initialArticles={articles.filter((article) => article.approval_status === "pending" && article.published_at !== null)}
        initialPests={pests.filter((pest) => pest.approval_status === "pending")}
      />
      <AdminKnowledgeArticles
        key={`${articles.map((article) => article.id).join("-")}-${pests.map((pest) => pest.id).join("-")}`}
        initialArticles={articles}
        initialPests={pests}
        crops={crops}
        showCreateButton={false}
      />
    </section>
  );
}
