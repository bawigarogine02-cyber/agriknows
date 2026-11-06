"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  ExternalLink,
  Filter,
  Search,
  X,
} from "lucide-react";

type Article = {
  id: string;
  title: string;
  category: string;
  summary: string;
  body: string;
  evidence_note?: string;
  source_url?: string;
};

export default function AgriculturalKnowledgePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeArticleModal, setActiveArticleModal] = useState<Article | null>(null);
  const [error, setError] = useState("");

  const categories = ["All", ...new Set(articles.map((article) => article.category))];

  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch("/api/knowledge-base");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch knowledge articles.");
        if (!Array.isArray(data.articles)) throw new Error("The server returned an invalid article list.");
        setArticles(data.articles);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Failed to fetch knowledge articles.");
      }
    }

    void fetchArticles();
  }, []);

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.summary.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="mx-auto w-full max-w-[1420px] space-y-6">
      {/* Header */}
      <header className="rounded-2xl bg-[#e4f4e5] p-7 sm:p-9 shadow-sm">
        <p className="text-[10px] font-bold tracking-[1.5px] text-[#27715d] uppercase">AGRICULTURAL KNOWLEDGE BASE</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#064b3b] sm:text-4xl">Learn from the Field</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#45675e]">
          Browse practical agronomic guides, research notes, soil care, and crop rotation strategies for better decisions.
        </p>
      </header>

      {/* Search & Category Filter */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm border border-slate-100 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex h-11 flex-1 items-center gap-3 rounded-xl border border-slate-200 px-3.5 text-slate-400 focus-within:border-[#16875f]">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agricultural articles, soil guides, pest management..."
            className="w-full text-sm outline-none text-[#123d35] placeholder:text-slate-400"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          )}
        </label>

        <div className="flex flex-wrap items-center gap-1.5">
          <Filter size={15} className="mr-1 text-slate-400" />
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                selectedCategory === cat
                  ? "bg-[#16875f] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        {filteredArticles.map((article) => (
          <article
            key={article.id}
            onClick={() => setActiveArticleModal(article)}
            className="group flex cursor-pointer gap-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition hover:border-[#16875f]/50 hover:shadow-md"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e0f5eb] text-[#288b69] group-hover:bg-[#16875f] group-hover:text-white transition">
              <BookOpen size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#25805e]">
                  {article.category}
                </span>
                <span className="text-[11px] text-slate-400">
                  {Math.max(1, Math.ceil(article.body.trim().split(/\s+/).length / 200))} min read
                </span>
              </div>

              <h2 className="mt-2 font-bold text-[#123d35] text-base group-hover:text-[#16875f] transition">
                {article.title}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 line-clamp-2">{article.summary}</p>

              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#16875f]">
                Read full article →
              </div>
            </div>
          </article>
        ))}
        {!error && filteredArticles.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 lg:col-span-2">
            No knowledge articles are available in the database yet.
          </p>
        )}
      </div>

      {/* Article Reader Modal */}
      {activeArticleModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeArticleModal.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 sm:p-6"
          onClick={() => setActiveArticleModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Modal Header */}
            <header className="flex items-start justify-between border-b border-slate-100 bg-[#f8fbf7] px-6 py-5">
              <div>
                <span className="rounded-md bg-[#e0f5eb] px-2.5 py-1 text-xs font-bold text-[#25805e]">
                  {activeArticleModal.category}
                </span>
                <h2 className="mt-2 text-2xl font-extrabold text-[#123d35]">{activeArticleModal.title}</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {Math.max(1, Math.ceil(activeArticleModal.body.trim().split(/\s+/).length / 200))} min read · Agronomic Guidance
                </p>
              </div>
              <button
                type="button"
                aria-label="Close article modal"
                onClick={() => setActiveArticleModal(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
              >
                <X size={20} />
              </button>
            </header>

            {/* Modal Body */}
            <div className="space-y-5 overflow-y-auto p-6 text-xs sm:text-sm leading-relaxed text-slate-700">
              <p className="text-sm font-medium text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {activeArticleModal.summary}
              </p>

              <p className="whitespace-pre-wrap">{activeArticleModal.body}</p>
              {activeArticleModal.evidence_note && (
                <div className="rounded-xl border border-[#d6e5d3] bg-[#f2f7f0] p-4 text-xs text-[#2d4d2b]">
                  <strong>Evidence note:</strong> {activeArticleModal.evidence_note}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <footer className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
              {activeArticleModal.source_url ? (
                <a
                  href={activeArticleModal.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16875f] hover:underline"
                >
                  View Source <ExternalLink size={14} />
                </a>
              ) : <span />}
              <button
                type="button"
                onClick={() => setActiveArticleModal(null)}
                className="rounded-xl bg-[#16875f] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#0c704d]"
              >
                Close Article
              </button>
            </footer>
          </div>
        </div>
      )}
    </section>
  );
}