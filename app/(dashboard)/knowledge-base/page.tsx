import KnowledgeBaseExplorer from "@/components/knowledge-base/KnowledgeBaseExplorer";
import { getSession } from "@/lib/auth/session";
import { getArticles, getCrops, getPestsDiseases } from "@/lib/db/repository";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function KnowledgeBasePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/knowledge-base");
  }

  const [crops, pests, articles] = await Promise.all([
    getCrops(),
    getPestsDiseases(),
    getArticles()
  ]);

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-gradient-to-r from-[#e4f4e5] to-[#e0f5eb] p-6 sm:p-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#16875f]">
          AgriKMS Module 3
        </span>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#064b3b] sm:text-3xl">
          Agronomic Knowledge Base
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#45675e]">
          Searchable encyclopedia containing ideal soil pH ranges, crop maturation windows, diagnostic pest/disease intervention guidelines, and long-form farming articles.
        </p>
      </header>

      <KnowledgeBaseExplorer crops={crops} pests={pests} articles={articles} />
    </div>
  );
}
