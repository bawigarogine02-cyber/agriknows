"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { BookOpen, Bug, FileText, LoaderCircle, Pencil, Plus, Trash2, WandSparkles, X } from "lucide-react";
import type { Article, Crop, PestDisease } from "@/lib/db/repository";
import { parseGuideSteps, serializeGuideSteps } from "@/lib/knowledge/guide-content";
import PublishKnowledgeModal from "@/components/consultations/PublishKnowledgeModal";
import ConfirmActionDialog from "@/components/ui/ConfirmActionDialog";

type KnowledgeDeleteTarget =
  | { kind: "pest"; pest: PestDisease }
  | { kind: "article"; article: Article };

type ArticleForm = {
  title: string;
  category: string;
  summary: string;
  body: string;
  evidence_note: string;
  source_url: string;
  published: boolean;
};

const emptyForm: ArticleForm = {
  title: "",
  category: "",
  summary: "",
  body: "",
  evidence_note: "",
  source_url: "",
  published: false,
};

export default function AdminKnowledgeArticles({
  initialArticles,
  initialPests = [],
  crops = [],
  showCreateButton = true,
}: {
  initialArticles: Article[];
  initialPests?: PestDisease[];
  crops?: Crop[];
  showCreateButton?: boolean;
}) {
  const [articles, setArticles] = useState(initialArticles);
  const [pests, setPests] = useState(initialPests);
  const [activeTab, setActiveTab] = useState<"pests" | "guides" | "articles">("articles");
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editingKnowledgeEntry, setEditingKnowledgeEntry] = useState<Article | null>(null);
  const [editingPest, setEditingPest] = useState<PestDisease | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeDeleteTarget | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<ArticleForm>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [compositionGuidance, setCompositionGuidance] = useState("");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const isGuideForm = form.category.trim().startsWith("Guide:");
  const visibleArticles = articles.filter((article) =>
    activeTab === "guides"
      ? article.category.startsWith("Guide:")
      : !article.category.startsWith("Guide:")
  );
  const visiblePests = pests;

  function openCreateForm() {
    setEditingArticle(null);
    setIsFormOpen(true);
    setForm({
      ...emptyForm,
      category: activeTab === "guides" ? "Guide: " : "",
    });
    setCompositionGuidance("");
    setFormError("");
    setError("");
  }

  function openEditForm(article: Article) {
    if (!showCreateButton) {
      setEditingKnowledgeEntry(article);
      return;
    }
    setEditingArticle(article);
    setIsFormOpen(true);
    setForm({
      title: article.title,
      category: article.category,
      summary: article.summary,
      body: parseGuideSteps(article.body)?.join("\n\n") ?? article.body,
      evidence_note: article.evidence_note ?? "",
      source_url: article.source_url ?? "",
      published: article.published_at !== null,
    });
    setCompositionGuidance("");
    setFormError("");
    setError("");
  }

  function openEditPest(pest: PestDisease) {
    setEditingPest(pest);
  }

  async function reloadArticles() {
    const response = await fetch("/api/admin/knowledge-articles");
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? "Unable to refresh knowledge articles.");
    }
    setArticles(data.articles as Article[]);
  }

  async function reloadPests() {
    const response = await fetch("/api/admin/pests");
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? "Unable to refresh pest and disease entries.");
    }
    setPests(data.pests as PestDisease[]);
  }

  function refreshAfterSharedEdit() {
    void Promise.all([reloadArticles(), reloadPests()]).catch((reloadError: unknown) => {
      setError(reloadError instanceof Error ? reloadError.message : "Unable to refresh knowledge content.");
    });
  }

  async function removePest(pest: PestDisease) {
    const response = await fetch(`/api/admin/pests/${pest.id}`, { method: "DELETE" });
    const data: { error?: string } = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Unable to delete the pest or disease entry.");
    setPests((current) => current.filter((item) => item.id !== pest.id));
  }

  async function saveArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const isGuide = form.category.trim().startsWith("Guide:");
    const guideSteps = isGuide
      ? form.body.split(/\n\s*\n/).map((step) => step.trim()).filter(Boolean)
      : [];
    if (isGuide && guideSteps.length === 0) {
      setFormError("Add at least one guide step.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    setError("");

    try {
      const response = await fetch("/api/admin/knowledge-articles", {
        method: editingArticle ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          body: isGuide ? serializeGuideSteps(guideSteps) : form.body,
          id: editingArticle?.id,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setFormError(data.error ?? "Unable to save the knowledge article.");
        return;
      }

      await reloadArticles();
      setIsFormOpen(false);
      setEditingArticle(null);
      setForm(emptyForm);
    } catch (saveError) {
      setFormError(
        saveError instanceof Error ? saveError.message : "Unable to save the knowledge article."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function composeArticle() {
    if (!form.title.trim() || !form.category.trim()) {
      setFormError("Enter an article title and category before composing.");
      return;
    }
    if (
      (form.summary.trim() || form.body.trim()) &&
      !window.confirm("AI composition will replace the current summary, article body, and evidence note. Continue?")
    ) {
      return;
    }

    setIsComposing(true);
    setFormError("");
    try {
      const response = await fetch("/api/admin/knowledge-articles/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          guidance: compositionGuidance,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setFormError(data.error ?? "Unable to compose the article.");
        return;
      }
      if (
        typeof data.article?.summary !== "string" ||
        typeof data.article?.body !== "string" ||
        typeof data.article?.evidence_note !== "string"
      ) {
        setFormError("Gemini returned an incomplete article draft. Please try again.");
        return;
      }
      setForm((current) => ({
        ...current,
        summary: data.article.summary,
        body: data.article.body,
        evidence_note: data.article.evidence_note,
        source_url: "",
        published: false,
      }));
    } catch {
      setFormError("Unable to reach Gemini. Check your connection and try again.");
    } finally {
      setIsComposing(false);
    }
  }

  async function removeArticle(article: Article) {
    const response = await fetch("/api/admin/knowledge-articles", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: article.id }),
    });
    const data: { error?: string } = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Unable to delete the knowledge article.");
    setArticles((current) => current.filter((item) => item.id !== article.id));
  }

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-[#123d35]">
              {activeTab === "pests"
                ? "Pests & Diseases"
                : activeTab === "guides"
                  ? "Farming guides"
                  : "Knowledge articles"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {activeTab === "pests"
                ? `${visiblePests.length} entries`
                : `${visibleArticles.length} ${activeTab === "guides" ? "guides" : "articles"}`}
            </p>
          </div>
          {showCreateButton && activeTab !== "pests" && (
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#16875f] px-4 py-2 text-sm font-bold text-white hover:bg-[#0c704d]"
            >
              <Plus size={17} />
              {activeTab === "guides" ? "Add guide" : "Add article"}
            </button>
          )}
        </div>

        <div role="tablist" aria-label="Knowledge content categories" className="flex gap-1 border-b border-slate-100 bg-slate-50 p-2">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "pests"}
            onClick={() => setActiveTab("pests")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition ${
              activeTab === "pests" ? "bg-[#16875f] text-white" : "text-slate-600 hover:bg-white"
            }`}
          >
            <Bug size={15} /> Pests &amp; Diseases ({initialPests.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "guides"}
            onClick={() => setActiveTab("guides")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition ${
              activeTab === "guides" ? "bg-[#16875f] text-white" : "text-slate-600 hover:bg-white"
            }`}
          >
            <BookOpen size={15} /> Guides ({articles.filter((article) => article.category.startsWith("Guide:")).length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "articles"}
            onClick={() => setActiveTab("articles")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition ${
              activeTab === "articles" ? "bg-[#16875f] text-white" : "text-slate-600 hover:bg-white"
            }`}
          >
            <FileText size={15} /> Articles ({articles.filter((article) => !article.category.startsWith("Guide:")).length})
          </button>
        </div>

        {error && (
          <p role="alert" className="m-5 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </p>
        )}

        {activeTab === "pests" ? (
          visiblePests.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <Bug className="mx-auto h-9 w-9 text-slate-300" />
              <p className="mt-3 font-semibold text-slate-700">No available data</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-[#f8faf7] text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Pest / Disease</th>
                    <th className="px-5 py-4">Classification</th>
                    <th className="px-5 py-4">Crop</th>
                    <th className="px-5 py-4">Author</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visiblePests.map((pest) => (
                    <tr key={pest.id} className="align-top">
                      <td className="max-w-md px-5 py-4">
                        <p className="font-semibold text-slate-800">{pest.name}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{pest.symptoms}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{pest.type}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{pest.crop_name || "All crops"}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{pest.author_name || "Legacy entry"}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          pest.approval_status === "approved"
                            ? "bg-emerald-50 text-emerald-800"
                            : pest.approval_status === "declined"
                              ? "bg-rose-50 text-rose-800"
                              : "bg-amber-50 text-amber-800"
                        }`}>
                          {pest.approval_status === "approved"
                            ? "Approved"
                            : pest.approval_status === "declined"
                              ? "Declined"
                              : "Pending approval"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditPest(pest)}
                            aria-label={`Edit ${pest.name}`}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ kind: "pest", pest })}
                            aria-label={`Delete ${pest.name}`}
                            className="rounded-lg border border-rose-100 p-2 text-rose-700 hover:bg-rose-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : visibleArticles.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <BookOpen className="mx-auto h-9 w-9 text-slate-300" />
            <p className="mt-3 font-semibold text-slate-700">No available data</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead className="bg-[#f8faf7] text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Article</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Author</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleArticles.map((article) => (
                  <tr key={article.id} className="align-top">
                    <td className="max-w-md px-5 py-4">
                      <p className="font-semibold text-slate-800">{article.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{article.summary}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{article.category}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {article.author_name || "Admin"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          article.approval_status === "declined"
                            ? "bg-rose-50 text-rose-800"
                            : article.approval_status === "pending" && article.published_at !== null
                              ? "bg-amber-50 text-amber-800"
                              : article.published_at
                                ? "bg-emerald-50 text-emerald-800"
                                : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {article.approval_status === "declined"
                          ? "Declined"
                          : article.approval_status === "pending" && article.published_at !== null
                            ? "Pending approval"
                            : article.published_at
                              ? "Published"
                              : "Draft"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                      {article.created_at.slice(0, 10)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(article)}
                          aria-label={`Edit ${article.title}`}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ kind: "article", article })}
                          aria-label={`Delete ${article.title}`}
                          className="rounded-lg border border-rose-100 p-2 text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isFormOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="knowledge-article-form-title"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"
          onClick={() => !isSubmitting && !isComposing && setIsFormOpen(false)}
        >
          <div
            className="my-auto w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 id="knowledge-article-form-title" className="text-xl font-bold text-[#123d35]">
                {isGuideForm
                  ? editingArticle ? "Edit farming guide" : "Add farming guide"
                  : editingArticle ? "Edit knowledge article" : "Add knowledge article"}
              </h2>
              <button
                type="button"
                onClick={() => !isComposing && setIsFormOpen(false)}
                aria-label="Close article form"
                disabled={isComposing}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <p role="alert" className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {formError}
              </p>
            )}

            <form onSubmit={saveArticle} className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">
                Title
                <input
                  required
                  maxLength={255}
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-[#16875f]"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                {isGuideForm ? "Guide topic" : "Category"}
                <input
                  required
                  maxLength={100}
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-[#16875f]"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                AI composition guidance <span className="font-normal text-slate-500">(optional)</span>
                <textarea
                  rows={2}
                  maxLength={2000}
                  value={compositionGuidance}
                  onChange={(event) => setCompositionGuidance(event.target.value)}
                  placeholder={`Add the audience, focus, or specific points the ${isGuideForm ? "guide" : "article"} should cover.`}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-[#16875f]"
                />
              </label>
              <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
                <p className="text-xs leading-5 text-slate-500">
                  Gemini creates an editable draft. Review facts and add trusted sources before publishing.
                </p>
                <button
                  type="button"
                  disabled={isComposing || isSubmitting || !form.title.trim() || !form.category.trim()}
                  onClick={() => void composeArticle()}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#16875f] px-4 py-2 text-sm font-bold text-[#116a4d] hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isComposing ? <LoaderCircle size={16} className="animate-spin" /> : <WandSparkles size={16} />}
                  {isComposing ? "Composing..." : `Compose ${isGuideForm ? "guide" : "article"} with Gemini`}
                </button>
              </div>
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                {isGuideForm ? "Guide overview" : "Summary"}
                <textarea
                  required
                  rows={2}
                  maxLength={65535}
                  value={form.summary}
                  onChange={(event) => setForm({ ...form, summary: event.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-[#16875f]"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                {isGuideForm ? "Step-by-step guide" : "Article body"}
                {isGuideForm && (
                  <span className="ml-1 font-normal text-slate-500">
                    (separate steps with a blank line)
                  </span>
                )}
                <textarea
                  required
                  rows={7}
                  value={form.body}
                  onChange={(event) => setForm({ ...form, body: event.target.value })}
                  placeholder={isGuideForm ? "Step 1: ...\n\nStep 2: ..." : "Write the full article here."}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-[#16875f]"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                Evidence note <span className="font-normal text-slate-500">(optional)</span>
                <textarea
                  rows={2}
                  maxLength={65535}
                  value={form.evidence_note}
                  onChange={(event) => setForm({ ...form, evidence_note: event.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-[#16875f]"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                Source URL <span className="font-normal text-slate-500">(optional)</span>
                <input
                  type="url"
                  maxLength={1000}
                  value={form.source_url}
                  onChange={(event) => setForm({ ...form, source_url: event.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-[#16875f]"
                />
              </label>
              <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(event) => setForm({ ...form, published: event.target.checked })}
                  className="h-4 w-4 accent-[#16875f]"
                />
                Publish this article
              </label>
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 sm:col-span-2">
                <button
                  type="button"
                  disabled={isSubmitting || isComposing}
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isComposing}
                  className="rounded-lg bg-[#16875f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0c704d] disabled:opacity-60"
                >
                  {isSubmitting ? "Saving..." : editingArticle ? "Save changes" : "Save article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
      {editingKnowledgeEntry && (
        <PublishKnowledgeModal
          key={`edit-${editingKnowledgeEntry.id}`}
          isOpen
          kind={editingKnowledgeEntry.category.startsWith("Guide:") ? "guide" : "article"}
          crops={crops}
          userRole="admin"
          initialArticle={editingKnowledgeEntry}
          onClose={() => setEditingKnowledgeEntry(null)}
          onSuccess={refreshAfterSharedEdit}
        />
      )}
      {editingPest && (
        <PublishKnowledgeModal
          key={`edit-pest-${editingPest.id}`}
          isOpen
          kind="pest"
          crops={crops}
          userRole="admin"
          initialPest={editingPest}
          onClose={() => setEditingPest(null)}
          onSuccess={refreshAfterSharedEdit}
        />
      )}
      <ConfirmActionDialog
        isOpen={deleteTarget !== null}
        title={deleteTarget?.kind === "pest" ? "Delete pest or disease entry?" : "Delete knowledge article?"}
        description={deleteTarget
          ? `Delete "${deleteTarget.kind === "pest" ? deleteTarget.pest.name : deleteTarget.article.title}"? This cannot be undone.`
          : ""}
        confirmLabel="Delete entry"
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget?.kind === "pest") await removePest(deleteTarget.pest);
          if (deleteTarget?.kind === "article") await removeArticle(deleteTarget.article);
          setDeleteTarget(null);
        }}
      />
    </>
  );
}
