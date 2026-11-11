"use client";

import type { Article, PestDisease } from "@/lib/db/repository";
import { parseGuideSteps } from "@/lib/knowledge/guide-content";
import { BookOpen, Bug, FileText, Eye, LoaderCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmActionDialog from "@/components/ui/ConfirmActionDialog";

interface AdminKnowledgeApprovalsProps {
  initialArticles: Article[];
  initialPests: PestDisease[];
}

type ApprovalEntry =
  | {
      key: string;
      kind: "pest";
      id: string;
      title: string;
      category: string;
      summary: string;
      author?: string;
      pest: PestDisease;
    }
  | {
      key: string;
      kind: "article";
      id: string;
      title: string;
      category: string;
      summary: string;
      author?: string;
      article: Article;
    };

export default function AdminKnowledgeApprovals({
  initialArticles,
  initialPests,
}: AdminKnowledgeApprovalsProps) {
  const router = useRouter();
  const [approvingKey, setApprovingKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<ApprovalEntry | null>(null);
  const [confirmingDecline, setConfirmingDecline] = useState<ApprovalEntry | null>(null);
  const [activeTab, setActiveTab] = useState<"pests" | "guides" | "articles">("pests");
  const entries = [
    ...initialPests.map((pest) => ({
      key: `pest:${pest.id}`,
      kind: "pest" as const,
      id: pest.id,
      title: pest.name,
      category: pest.type,
      summary: pest.symptoms,
      author: pest.author_name,
      pest,
    })),
    ...initialArticles.map((article) => ({
      key: `article:${article.id}`,
      kind: "article" as const,
      id: article.id,
      title: article.title,
      category: article.category,
      summary: article.summary,
      author: article.author_name,
      article,
    })),
  ];
  const selectedGuideSteps = selectedEntry?.kind === "article"
    ? parseGuideSteps(selectedEntry.article.body)
    : null;
  const pestEntries = entries.filter((entry) => entry.kind === "pest");
  const guideEntries = entries.filter((entry) => entry.kind === "article" && entry.category.startsWith("Guide:"));
  const articleEntries = entries.filter((entry) => entry.kind === "article" && !entry.category.startsWith("Guide:"));
  const visibleEntries = activeTab === "pests" ? pestEntries : activeTab === "guides" ? guideEntries : articleEntries;
  const tabClass = (tab: typeof activeTab) =>
    `inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-xs font-bold transition ${
      activeTab === tab ? "bg-[#16875f] text-white" : "text-slate-600 hover:bg-white"
    }`;

  async function submitReview(entry: ApprovalEntry, status: "approved" | "declined") {
    setApprovingKey(entry.key);
    setError("");
    try {
      const response = await fetch("/api/admin/knowledge-approvals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: entry.kind, id: entry.id, status }),
      });
      const data: { error?: string } = await response.json();
      if (!response.ok) throw new Error(data.error || `Unable to ${status === "approved" ? "approve" : "decline"} this knowledge entry.`);
      router.refresh();
    } finally {
      setApprovingKey(null);
    }
  }

  async function approve(entry: ApprovalEntry) {
    try {
      await submitReview(entry, "approved");
    } catch (approvalError) {
      setError(approvalError instanceof Error ? approvalError.message : "Unable to approve this knowledge entry.");
    }
  }

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
        <div className="border-b border-amber-100 bg-amber-50 p-6">
          <h2 className="text-xl font-bold text-[#123d35]">Knowledge entries awaiting approval</h2>
          <p className="mt-1 text-sm text-slate-600">
            Review researcher-submitted pests, diseases, guides, and articles before they appear publicly.
          </p>
        </div>
        <div role="tablist" aria-label="Pending knowledge categories" className="flex gap-1 overflow-x-auto border-b border-slate-100 bg-slate-50 p-2">
          <button type="button" role="tab" aria-selected={activeTab === "pests"} onClick={() => setActiveTab("pests")} className={tabClass("pests")}>
            <Bug size={15} /> Pests &amp; Diseases ({pestEntries.length})
          </button>
          <button type="button" role="tab" aria-selected={activeTab === "guides"} onClick={() => setActiveTab("guides")} className={tabClass("guides")}>
            <BookOpen size={15} /> Guides ({guideEntries.length})
          </button>
          <button type="button" role="tab" aria-selected={activeTab === "articles"} onClick={() => setActiveTab("articles")} className={tabClass("articles")}>
            <FileText size={15} /> Articles ({articleEntries.length})
          </button>
        </div>
        {error && <p role="alert" className="m-5 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
        {visibleEntries.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No available data</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {visibleEntries.map((entry) => (
              <article key={entry.key} className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-[#123d35]">{entry.title}</h3>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                      {entry.kind === "pest" ? "Pest / Disease" : entry.category.startsWith("Guide:") ? "Guide" : "Article"}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                      {entry.category}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Submitted by {entry.author || "Researcher"}</p>
                  <p className="mt-3 line-clamp-2 whitespace-pre-line text-sm text-slate-600">{entry.summary}</p>
                  <button
                    type="button"
                    onClick={() => setSelectedEntry(entry)}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Eye size={15} />
                    View full details
                  </button>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void approve(entry)}
                    disabled={approvingKey !== null}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#16875f] px-4 py-2 text-sm font-bold text-white hover:bg-[#064b3b] disabled:opacity-60"
                  >
                    {approvingKey === entry.key && <LoaderCircle size={15} className="animate-spin" />}
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDecline(entry)}
                    disabled={approvingKey !== null}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                  >
                    Decline
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="knowledge-approval-detail-title"
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="rounded-md bg-[#e4f4e5] px-2.5 py-1 text-xs font-extrabold text-[#16875f]">
                  {selectedEntry.kind === "pest"
                    ? "Pest / Disease"
                    : selectedEntry.category.startsWith("Guide:")
                      ? "Guide"
                      : "Article"}
                </span>
                <h2 id="knowledge-approval-detail-title" className="mt-3 text-2xl font-extrabold text-[#123d35]">
                  {selectedEntry.title}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Submitted by {selectedEntry.author || "Researcher"} · {selectedEntry.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                aria-label="Close full details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {selectedEntry.kind === "pest" ? (
              <div className="mt-6 space-y-4 text-sm">
                {selectedEntry.pest.crop_name && (
                  <p className="rounded-lg bg-slate-50 p-3 text-slate-700">
                    <span className="font-bold">Crop: </span>{selectedEntry.pest.crop_name}
                  </p>
                )}
                <ConfirmActionDialog
                  isOpen={confirmingDecline !== null}
                  title="Decline knowledge submission?"
                  description={confirmingDecline
                    ? `Decline "${confirmingDecline.title}"? The researcher can update it and submit it for review again.`
                    : ""}
                  confirmLabel="Decline submission"
                  tone="warning"
                  onClose={() => setConfirmingDecline(null)}
                  onConfirm={async () => {
                    if (confirmingDecline) await submitReview(confirmingDecline, "declined");
                    setConfirmingDecline(null);
                  }}
                />
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <h3 className="font-bold text-amber-900">Symptoms &amp; identification</h3>
                  <p className="mt-2 whitespace-pre-line leading-relaxed text-amber-900">{selectedEntry.pest.symptoms}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-bold text-slate-800">Prevention</h3>
                  <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-700">{selectedEntry.pest.prevention}</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <h3 className="font-bold text-emerald-900">Treatment</h3>
                  <p className="mt-2 whitespace-pre-line leading-relaxed text-emerald-900">{selectedEntry.pest.treatment}</p>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-5 text-sm">
                <div>
                  <h3 className="font-bold text-slate-800">Overview</h3>
                  <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-700">{selectedEntry.article.summary}</p>
                </div>
                {selectedGuideSteps ? (
                  <div>
                    <h3 className="font-bold text-slate-800">Guide steps</h3>
                    <ol className="mt-3 space-y-3">
                      {selectedGuideSteps.map((step, index) => (
                        <li key={`${selectedEntry.key}-step-${index}`} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e0f5eb] text-xs font-bold text-[#16875f]">
                            {index + 1}
                          </span>
                          <span className="whitespace-pre-line pt-1 leading-relaxed text-slate-700">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-bold text-slate-800">Full content</h3>
                    <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-700">{selectedEntry.article.body}</p>
                  </div>
                )}
                {selectedEntry.article.evidence_note && (
                  <div className="rounded-xl bg-slate-50 p-4">
                    <h3 className="font-bold text-slate-800">Evidence note</h3>
                    <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-700">{selectedEntry.article.evidence_note}</p>
                  </div>
                )}
                {selectedEntry.article.source_url && (
                  <a
                    href={selectedEntry.article.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block font-bold text-[#16875f] underline"
                  >
                    View source
                  </a>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="rounded-xl bg-[#16875f] px-6 py-2.5 text-xs font-bold text-white shadow-xs"
              >
                Close details
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
