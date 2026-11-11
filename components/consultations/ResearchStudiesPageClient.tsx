"use client";

import type { Article, Crop, PestDisease, ResearchPublication } from "@/lib/db/repository";
import { parseGuideSteps } from "@/lib/knowledge/guide-content";
import { BookOpen, Bug, FileText, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PublishResearchModal from "./PublishResearchModal";
import ResearchPublicationsFeed from "./ResearchPublicationsFeed";
import ResearchPublishingActions from "./ResearchPublishingActions";
import PublishKnowledgeModal from "./PublishKnowledgeModal";
import ConfirmActionDialog from "@/components/ui/ConfirmActionDialog";

type KnowledgeKind = "pest" | "guide" | "article";
type KnowledgeDeleteTarget = { id: string; kind: KnowledgeKind; title: string };

function ApprovalStatusBadge({ status, className = "" }: { status: PestDisease["approval_status"]; className?: string }) {
  const statusStyles = {
    approved: "bg-[#e0f5eb] text-[#16875f]",
    pending: "bg-amber-50 text-amber-800",
    declined: "bg-rose-50 text-rose-800",
  };
  const statusLabels = {
    approved: "Approved",
    pending: "Pending approval",
    declined: "Declined — update and resubmit",
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusStyles[status]} ${className}`}>
      {statusLabels[status]}
    </span>
  );
}

interface ResearchStudiesPageClientProps {
  crops: Crop[];
  publications: ResearchPublication[];
  pests: PestDisease[];
  articles: Article[];
  userRole: string;
  currentUserId: string;
}

export default function ResearchStudiesPageClient({
  crops,
  publications,
  pests,
  articles,
  userRole,
  currentUserId,
}: ResearchStudiesPageClientProps) {
  const router = useRouter();
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [editingPublication, setEditingPublication] = useState<ResearchPublication | null>(null);
  const [editingPest, setEditingPest] = useState<PestDisease | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editingKnowledgeKind, setEditingKnowledgeKind] = useState<"guide" | "article">("article");
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeDeleteTarget | null>(null);
  const [activeTab, setActiveTab] = useState<"research" | "pests" | "guides" | "articles">("research");
  const guides = articles.filter((article) => article.category.startsWith("Guide:"));
  const knowledgeArticles = articles.filter((article) => !article.category.startsWith("Guide:"));
  async function deleteKnowledgeEntry() {
    if (!deleteTarget) return;
    const response = await fetch("/api/research/knowledge", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteTarget.id, kind: deleteTarget.kind }),
    });
    const result: { error?: string } = await response.json();
    if (!response.ok) throw new Error(result.error || "Unable to delete the knowledge entry.");
    router.refresh();
  }
  const tabClass = (tab: typeof activeTab) =>
    `flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-xs font-bold transition ${
      activeTab === tab ? "bg-[#16875f] text-white shadow-xs" : "text-slate-600 hover:bg-white hover:text-slate-900"
    }`;

  return (
    <>
      <ResearchPublishingActions
        crops={crops}
        userRole={userRole}
        onSelectTab={setActiveTab}
      />
      <div role="tablist" aria-label="Research and knowledge categories" className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1.5">
        <button type="button" role="tab" aria-selected={activeTab === "research"} onClick={() => setActiveTab("research")} className={tabClass("research")}>
          <FileText size={16} /> Research ({publications.length})
        </button>
        <button type="button" role="tab" aria-selected={activeTab === "pests"} onClick={() => setActiveTab("pests")} className={tabClass("pests")}>
          <Bug size={16} /> Pests &amp; Diseases ({pests.length})
        </button>
        <button type="button" role="tab" aria-selected={activeTab === "guides"} onClick={() => setActiveTab("guides")} className={tabClass("guides")}>
          <BookOpen size={16} /> Guides ({guides.length})
        </button>
        <button type="button" role="tab" aria-selected={activeTab === "articles"} onClick={() => setActiveTab("articles")} className={tabClass("articles")}>
          <BookOpen size={16} /> Articles ({knowledgeArticles.length})
        </button>
      </div>
      {activeTab === "research" && (
        <ResearchPublicationsFeed
          publications={publications}
          userRole={userRole}
          currentUserId={currentUserId}
          onOpenPublishModal={() => setIsPublishModalOpen(true)}
          onEditPublication={setEditingPublication}
          onRefresh={() => router.refresh()}
          showPublishButton={false}
        />
      )}
      {activeTab === "pests" && <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Bug size={20} className="text-[#16875f]" />
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#123d35]">Pests &amp; Diseases ({pests.length})</h2>
            <p className="text-xs text-slate-500">Published diagnostic and intervention information.</p>
          </div>
        </div>
        {pests.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
            No available data
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {pests.map((pest) => (
              <article key={pest.id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <ApprovalStatusBadge status={pest.approval_status} />
                    <span className="text-xs font-semibold capitalize text-slate-400">{pest.type}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold leading-snug text-[#123d35]">{pest.name}</h3>
                  <p className="mt-1 text-xs font-semibold text-[#16875f]">
                    Author: {pest.author_name || "Agronomic Specialist"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                    {pest.crop_name && (
                      <span className="rounded-md bg-slate-100 px-2 py-1 font-bold text-slate-700">
                        Crop: {pest.crop_name}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 line-clamp-4 text-xs leading-relaxed text-slate-600">
                    <span className="font-bold text-slate-700">Symptoms: </span>{pest.symptoms}{" "}
                    <span className="font-bold text-slate-700">Prevention: </span>{pest.prevention}{" "}
                    <span className="font-bold text-[#16875f]">Treatment: </span>{pest.treatment}
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                  {pest.author_id === currentUserId && (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditingPest(pest)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        <Pencil size={14} /> {pest.approval_status === "declined" ? "Update and resubmit" : "Update"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ id: pest.id, kind: "pest", title: pest.name })}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>}
      {activeTab === "guides" && <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-[#16875f]" />
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#123d35]">Guides ({guides.length})</h2>
            <p className="text-xs text-slate-500">Practical farming guidance, organized step by step.</p>
          </div>
        </div>
        {guides.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
            No available data
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {guides.map((guide) => {
              const steps = parseGuideSteps(guide.body);
              return (
                <article key={guide.id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <ApprovalStatusBadge status={guide.approval_status} />
                      <span className="text-right text-xs font-semibold text-slate-400">
                        {guide.category.replace(/^Guide:\s*/, "")}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-bold leading-snug text-[#123d35]">{guide.title}</h3>
                    <p className="mt-1 text-xs font-semibold text-[#16875f]">Author: {guide.author_name || "Agronomic Specialist"}</p>
                    <p className="mt-3 line-clamp-4 text-xs leading-relaxed text-slate-600">{guide.summary}</p>
                    {steps ? (
                      <ol className="mt-3 space-y-2 text-xs leading-relaxed text-slate-600">
                        {steps.map((step, index) => (
                          <li key={`${guide.id}-step-${index}`} className="flex gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e0f5eb] text-[10px] font-bold text-[#16875f]">
                              {index + 1}
                            </span>
                            <span className="whitespace-pre-line pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="mt-3 line-clamp-4 whitespace-pre-line text-xs leading-relaxed text-slate-600">{guide.body}</p>
                    )}
                    {guide.source_url && (
                      <a href={guide.source_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-bold text-[#16875f] underline">
                        View source
                      </a>
                    )}
                  </div>
                  <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                    {guide.author_id === currentUserId && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingKnowledgeKind("guide");
                            setEditingArticle(guide);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil size={14} /> {guide.approval_status === "declined" ? "Update and resubmit" : "Update"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ id: guide.id, kind: "guide", title: guide.title })}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>}
      {activeTab === "articles" && <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-[#16875f]" />
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#123d35]">Articles ({knowledgeArticles.length})</h2>
            <p className="text-xs text-slate-500">Published agricultural knowledge articles.</p>
          </div>
        </div>
        {knowledgeArticles.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
            No available data
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {knowledgeArticles.map((article) => (
              <article key={article.id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <ApprovalStatusBadge status={article.approval_status} />
                    <span className="text-right text-xs font-semibold text-slate-400">
                      {article.category.replace(/^Article:\s*/, "")}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold leading-snug text-[#123d35]">{article.title}</h3>
                  <p className="mt-1 text-xs font-semibold text-[#16875f]">Author: {article.author_name || "Agronomic Specialist"}</p>
                  <p className="mt-3 line-clamp-2 text-xs font-semibold leading-relaxed text-slate-700">{article.summary}</p>
                  <p className="mt-2 line-clamp-4 whitespace-pre-line text-xs leading-relaxed text-slate-600">{article.body}</p>
                  {article.evidence_note && (
                    <p className="mt-3 line-clamp-2 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                      <span className="font-bold">Evidence note: </span>{article.evidence_note}
                    </p>
                  )}
                  {article.source_url && (
                    <a href={article.source_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-bold text-[#16875f] underline">
                      View source
                    </a>
                  )}
                </div>
                <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                  {article.author_id === currentUserId && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingKnowledgeKind("article");
                          setEditingArticle(article);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        <Pencil size={14} /> {article.approval_status === "declined" ? "Update and resubmit" : "Update"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ id: article.id, kind: "article", title: article.title })}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>}
      {(isPublishModalOpen || editingPublication !== null) && (
        <PublishResearchModal
          key={editingPublication?.id || "new-publication"}
          isOpen
          crops={crops}
          initialPublication={editingPublication}
          onClose={() => {
            setIsPublishModalOpen(false);
            setEditingPublication(null);
          }}
          onSuccess={() => router.refresh()}
        />
      )}
      {(editingPest || editingArticle) && (
        <PublishKnowledgeModal
          key={editingPest?.id || editingArticle?.id}
          isOpen
          kind={editingPest ? "pest" : editingKnowledgeKind}
          crops={crops}
          userRole={userRole}
          initialPest={editingPest}
          initialArticle={editingArticle}
          onClose={() => {
            setEditingPest(null);
            setEditingArticle(null);
          }}
          onSuccess={() => router.refresh()}
        />
      )}
      <ConfirmActionDialog
        isOpen={deleteTarget !== null}
        title={`Delete ${deleteTarget?.kind === "pest" ? "pest or disease" : deleteTarget?.kind === "guide" ? "guide" : "article"}?`}
        description={`This will permanently delete "${deleteTarget?.title ?? ""}". This action cannot be undone.`}
        confirmLabel="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteKnowledgeEntry}
      />
    </>
  );
}
