"use client";

import { useState } from "react";
import {
  BookOpen,
  CheckCircle,
  ExternalLink,
  Filter,
  Leaf,
  Lightbulb,
  Search,
  Sprout,
  X,
} from "lucide-react";

type Article = {
  id: string;
  title: string;
  category: "Crop Management" | "Field Guide" | "Soil Health" | "Pest Control";
  readTime: string;
  summary: string;
  content: string[];
  evidenceNote: string;
  sourceUrl: string;
};

const articles: Article[] = [
  {
    id: "1",
    title: "Best Practices for Rice Cultivation",
    category: "Crop Management",
    readTime: "5 min read",
    summary: "Learn how to select seeds, manage water levels, balance fertilizer application, and optimize yield.",
    content: [
      "Select high-yielding, locally certified seed varieties resistant to common local pests and diseases.",
      "Prepare land thoroughly with proper leveling to ensure uniform water distribution across paddy fields.",
      "Maintain 2–5 cm shallow water depth during early tillering, allowing controlled drainage mid-season to strengthen root systems.",
      "Apply nitrogen fertilizer in split applications (basal, tillering, panicle initiation) to maximize absorption efficiency."
    ],
    evidenceNote: "University Extension advice: Split nitrogen applications prevent nutrient leaching during heavy tropical rains.",
    sourceUrl: "https://extension.umn.edu/agriculture/crop-production/corn",
  },
  {
    id: "2",
    title: "Nitrogen Fixation & Legume Crop Rotation",
    category: "Soil Health",
    readTime: "6 min read",
    summary: "Understand how bush green beans, sitaw, cowpeas, and mung beans enrich soil nitrogen for future cereal crops.",
    content: [
      "Leguminous crops form symbiotic relationships with Rhizobium soil bacteria in root nodules.",
      "Converting atmospheric nitrogen into plant-available soil ammonium reduces synthetic nitrogen fertilizer needs by up to 30–50 kg N/ha.",
      "Follow heavy-feeding crops like corn or rice with a short-cycle mung bean or cowpea rotation during dry seasons.",
      "Incorporate green vine residue back into topsoil after pod harvest to build long-term soil organic matter."
    ],
    evidenceNote: "Soil research proves legume crop rotations replenish soil structure and decrease pest cycles.",
    sourceUrl: "https://extension.uga.edu/publications/detail.html?number=C976",
  },
  {
    id: "3",
    title: "Managing Soil Moisture & Field Drainage",
    category: "Field Guide",
    readTime: "4 min read",
    summary: "Practical techniques to evaluate soil moisture, prevent root rot during storms, and irrigate efficiently.",
    content: [
      "Perform the hand feel test: squeeze a soil sample from 4–6 inches deep to check if it holds shape without leaking excess water.",
      "Construct raised beds (15–20 cm elevated) with perimeter drainage ditches to safeguard roots from standing water.",
      "Mulch soil surfaces with clean straw or organic material to retain moisture during high heat windows.",
      "Irrigate deeply and infrequently at early morning hours to minimize evaporation losses."
    ],
    evidenceNote: "Good field drainage prevents soil hypoxia and fungal root rot during typhoon rainfall periods.",
    sourceUrl: "https://extension.umn.edu/vegetables/growing-beans",
  },
  {
    id: "4",
    title: "Early Field Scouting & Integrated Pest Management",
    category: "Pest Control",
    readTime: "7 min read",
    summary: "How to identify early signs of leaf blight, stem borers, aphids, and implement biological controls.",
    content: [
      "Walk fields in a 'Z' pattern twice weekly, inspecting upper and lower leaf surfaces.",
      "Identify beneficial predator insects like ladybugs, green lacewings, and spiders before applying sprays.",
      "Remove diseased leaves early and dispose of them outside planting areas.",
      "Use targeted botanical oils (neem extract) or soapy water sprays for soft-bodied aphids and whiteflies."
    ],
    evidenceNote: "Integrated Pest Management (IPM) preserves beneficial predator populations while managing outbreaks.",
    sourceUrl: "https://extension.umn.edu/vegetables/growing-tomatoes",
  },
];

export default function AgriculturalKnowledgePage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeArticleModal, setActiveArticleModal] = useState<Article | null>(null);

  const categories = ["All", "Crop Management", "Soil Health", "Field Guide", "Pest Control"];

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
                <span className="text-[11px] text-slate-400">{article.readTime}</span>
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
                <p className="mt-1 text-xs text-slate-500">{activeArticleModal.readTime} · Agronomic Guidance</p>
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

              <div className="space-y-3">
                <h3 className="text-base font-bold text-[#123d35]">Key Step-by-Step Practices</h3>
                <ul className="space-y-2.5">
                  {activeArticleModal.content.map((point, idx) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#16875f] text-[10px] font-bold text-white mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-[#d6e5d3] bg-[#f2f7f0] p-4 text-xs text-[#2d4d2b]">
                <strong>🌾 Evidence Note:</strong> {activeArticleModal.evidenceNote}
              </div>
            </div>

            {/* Modal Footer */}
            <footer className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
              <a
                href={activeArticleModal.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16875f] hover:underline"
              >
                View Extension Reference <ExternalLink size={14} />
              </a>
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