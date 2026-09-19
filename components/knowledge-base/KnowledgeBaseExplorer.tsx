"use client";

import { Article, Crop, PestDisease } from "@/lib/db/repository";
import { BookOpen, Bug, Calendar, ChevronRight, FileText, Filter, Globe, Info, Layers, Search, ShieldCheck, Sprout, X } from "lucide-react";
import { useState } from "react";

interface KnowledgeBaseExplorerProps {
  crops: Crop[];
  pests: PestDisease[];
  articles: Article[];
}

export default function KnowledgeBaseExplorer({ crops, pests, articles }: KnowledgeBaseExplorerProps) {
  const [activeTab, setActiveTab] = useState<"crops" | "pests" | "guides">("crops");
  const [searchQuery, setSearchQuery] = useState("");
  const [pestTypeFilter, setPestTypeFilter] = useState<string>("all");
  const [seasonFilter, setSeasonFilter] = useState<string>("all");

  // Selection state for Detail Drawer / Modal
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [selectedPest, setSelectedPest] = useState<PestDisease | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const filteredCrops = crops.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.climate.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeason = seasonFilter === "all" || c.season.toLowerCase().includes(seasonFilter.toLowerCase());
    return matchesSearch && matchesSeason;
  });

  const filteredPests = pests.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.symptoms.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = pestTypeFilter === "all" || p.type === pestTypeFilter;
    return matchesSearch && matchesType;
  });

  const filteredArticles = articles.filter((a) => {
    return a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.category.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Tabbed Navigation & Filter Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        {/* Tab Buttons */}
        <div className="flex items-center rounded-xl bg-slate-100 p-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("crops")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 transition ${
              activeTab === "crops" ? "bg-[#16875f] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sprout size={16} />
            Crops ({crops.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pests")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 transition ${
              activeTab === "pests" ? "bg-[#16875f] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Bug size={16} />
            Pests & Diseases ({pests.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("guides")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 transition ${
              activeTab === "guides" ? "bg-[#16875f] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen size={16} />
            Guides & Articles ({articles.length})
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-400 sm:w-64">
            <Search size={17} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-medium text-slate-800 outline-none placeholder:text-slate-400 bg-transparent"
            />
          </div>

          {activeTab === "crops" && (
            <select
              value={seasonFilter}
              onChange={(e) => setSeasonFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="all">All Seasons</option>
              <option value="wet">Wet Season</option>
              <option value="dry">Dry / Cool Season</option>
              <option value="year-round">Year-Round</option>
            </select>
          )}

          {activeTab === "pests" && (
            <select
              value={pestTypeFilter}
              onChange={(e) => setPestTypeFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="all">All Classifications</option>
              <option value="insect">Insect Pests</option>
              <option value="fungus">Fungal Infections</option>
              <option value="bacterial">Bacterial Pathogens</option>
              <option value="virus">Viral Diseases</option>
            </select>
          )}
        </div>
      </div>

      {/* Tab 1: Crops View */}
      {activeTab === "crops" && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCrops.map((crop) => (
            <article key={crop.id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e0f5eb] text-[#16875f]">
                    <Sprout size={22} />
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">
                    {crop.season}
                  </span>
                </div>

                <h3 className="mt-4 text-xl font-bold text-[#123d35]">{crop.name}</h3>

                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3.5 text-xs">
                  <div>
                    <span className="block text-slate-400">Soil pH Range</span>
                    <strong className="text-slate-800">{crop.ideal_ph_min} – {crop.ideal_ph_max} pH</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400">Growth Window</span>
                    <strong className="text-[#16875f]">{crop.growth_days} Days</strong>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-500 line-clamp-1">
                  <strong>Climate:</strong> {crop.climate}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCrop(crop)}
                className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-[#16875f] hover:text-white"
              >
                View Crop Specs & Profile
                <ChevronRight size={14} />
              </button>
            </article>
          ))}
        </div>
      )}

      {/* Tab 2: Pests & Diseases View */}
      {activeTab === "pests" && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
          {filteredPests.map((pest) => (
            <article key={pest.id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-extrabold capitalize ${
                      pest.type === "insect"
                        ? "bg-amber-100 text-amber-800"
                        : pest.type === "fungus"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {pest.type} Classification
                  </span>
                  {pest.crop_name && (
                    <span className="text-xs font-bold text-slate-400">Host: {pest.crop_name}</span>
                  )}
                </div>

                <h3 className="mt-3 text-lg font-bold text-[#123d35]">{pest.name}</h3>

                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-700">Symptoms:</span>
                    <p className="mt-0.5 text-slate-600 line-clamp-2">{pest.symptoms}</p>
                  </div>
                  <div>
                    <span className="font-bold text-[#16875f]">Recommended Intervention:</span>
                    <p className="mt-0.5 text-slate-600 line-clamp-2">{pest.treatment}</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPest(pest)}
                className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 hover:bg-[#16875f] hover:text-white"
              >
                View Full Diagnostic Profile
                <ChevronRight size={14} />
              </button>
            </article>
          ))}
        </div>
      )}

      {/* Tab 3: Guides & Articles View */}
      {activeTab === "guides" && (
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <article key={article.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="rounded-md bg-[#e4f4e5] px-2.5 py-1 text-xs font-extrabold text-[#16875f]">
                    {article.category}
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-[#123d35]">{article.title}</h3>
                  <p className="mt-1.5 text-xs text-slate-500">By {article.author_name || "Agronomic Specialist"}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedArticle(article)}
                  className="shrink-0 rounded-xl bg-[#16875f] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#064b3b]"
                >
                  Read Full Article
                </button>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-600 border-t border-slate-100 pt-3">
                {article.summary}
              </p>
            </article>
          ))}
        </div>
      )}

      {/* Modal / Drawer for Crop Details */}
      {selectedCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div role="dialog" aria-modal="true" className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e0f5eb] text-[#16875f]">
                  <Sprout size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[#123d35]">{selectedCrop.name} Specs</h2>
                  <p className="text-xs text-slate-500">Agronomic profile & companion matching</p>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedCrop(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl bg-slate-50 p-3.5">
                <span className="block text-slate-400 font-medium">Ideal Soil pH Range</span>
                <strong className="text-sm text-[#123d35]">{selectedCrop.ideal_ph_min} – {selectedCrop.ideal_ph_max} pH</strong>
              </div>
              <div className="rounded-xl bg-slate-50 p-3.5">
                <span className="block text-slate-400 font-medium">Maturation Window</span>
                <strong className="text-sm text-[#16875f]">{selectedCrop.growth_days} Days</strong>
              </div>
              <div className="rounded-xl bg-slate-50 p-3.5">
                <span className="block text-slate-400 font-medium">Water Requirement</span>
                <strong className="text-sm text-slate-800">{selectedCrop.water_requirement}</strong>
              </div>
              <div className="rounded-xl bg-slate-50 p-3.5">
                <span className="block text-slate-400 font-medium">Seasonality</span>
                <strong className="text-sm text-slate-800">{selectedCrop.season}</strong>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-xl border border-slate-200 p-4">
                <span className="block font-bold text-slate-700">Ideal Climate & Elevation</span>
                <p className="mt-1 text-slate-600">{selectedCrop.climate}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <span className="block font-bold text-slate-700">Recommended Companion Crops</span>
                <p className="mt-1 text-slate-600">{selectedCrop.companion_crops}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedCrop(null)}
                className="rounded-xl bg-[#16875f] px-6 py-2.5 text-xs font-bold text-white shadow-xs"
              >
                Close Spec Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal / Drawer for Pest Profile */}
      {selectedPest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div role="dialog" aria-modal="true" className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                  <Bug size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[#123d35]">{selectedPest.name}</h2>
                  <p className="text-xs text-slate-500">Diagnostic profile & intervention guide</p>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedPest(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 space-y-4 text-xs">
              <div className="rounded-xl bg-amber-50 p-4 border border-amber-200">
                <strong className="block text-amber-900 font-bold">Observed Symptoms & Identification</strong>
                <p className="mt-1 text-amber-800 leading-relaxed">{selectedPest.symptoms}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                <strong className="block text-slate-800 font-bold">Preventive Agronomic Measures</strong>
                <p className="mt-1 text-slate-700 leading-relaxed">{selectedPest.prevention}</p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200">
                <strong className="block text-emerald-900 font-bold">Recommended Organic / Chemical Interventions</strong>
                <p className="mt-1 text-emerald-800 leading-relaxed">{selectedPest.treatment}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedPest(null)}
                className="rounded-xl bg-[#16875f] px-6 py-2.5 text-xs font-bold text-white shadow-xs"
              >
                Close Diagnostic Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal / Drawer for Article View */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div role="dialog" aria-modal="true" className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="rounded-md bg-[#e4f4e5] px-2.5 py-1 text-xs font-extrabold text-[#16875f]">
                  {selectedArticle.category}
                </span>
                <h2 className="mt-2 text-2xl font-extrabold text-[#123d35]">{selectedArticle.title}</h2>
                <p className="mt-1 text-xs text-slate-500">Author: {selectedArticle.author_name || "Agronomist"}</p>
              </div>
              <button type="button" onClick={() => setSelectedArticle(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 prose prose-slate max-w-none text-sm leading-relaxed text-slate-800 whitespace-pre-line">
              {selectedArticle.body}
            </div>

            <div className="mt-8 flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="rounded-xl bg-[#16875f] px-6 py-2.5 text-xs font-bold text-white shadow-xs"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
