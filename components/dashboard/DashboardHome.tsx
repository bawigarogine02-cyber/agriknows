"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  Article,
  Crop,
  Field,
  Recommendation,
  StoredWeatherSnapshot,
} from "@/lib/db/repository";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Check,
  Cloud,
  CloudRain,
  CloudSun,
  Droplets,
  Flower2,
  Lightbulb,
  MessageSquare,
  Plus,
  Sprout,
  Sun,
  Wind,
  X,
  Zap,
} from "lucide-react";

const heroImage = "/images/farmer-rice-field-with-laptop.jpg";

type WeatherState = {
  temp: number | null;
  humidity: number | null;
  rainfall: number | null;
  wind: number | null;
  location: string;
  condition: string;
  solarRadiation: number | null;
  soilTemperature: number | null;
  loading: boolean;
};

type ActiveModal =
  | null
  | "activeCrops"
  | "recommendations"
  | "knowledgeArticles"
  | "farmHealth"
  | "latestKnowledge"
  | "myCrops"
  | "addCrop"
  | "weatherDetail"
  | "reports";

type DashboardHomeProps = {
  initialFields: Field[];
  recommendations: Recommendation[];
  articles: Article[];
  initialCrops: Crop[];
  weatherSnapshot: StoredWeatherSnapshot | null;
};

export default function DashboardHome({
  initialFields,
  recommendations,
  articles,
  initialCrops,
  weatherSnapshot,
}: DashboardHomeProps) {
  const router = useRouter();

  // Active modal state
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const fields = initialFields;
  const [crops, setCrops] = useState(initialCrops);
  const activeFields = fields.filter((field) => !field.is_harvested);
  const stats = {
    activeCrops: activeFields.length,
    recommendations: recommendations.length,
    knowledgeArticles: articles.length,
    fieldRecords: fields.length,
    cropCatalog: crops.length,
  };
  const latestArticle = articles[0];
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const displayedArticle = selectedArticle || latestArticle;
  const featuredField = activeFields[0];
  const weather: WeatherState = {
    temp: weatherSnapshot?.temperature_c ?? null,
    humidity: weatherSnapshot?.humidity_percent ?? null,
    rainfall: weatherSnapshot?.rainfall_probability_percent ?? null,
    wind: weatherSnapshot?.wind_kph ?? null,
    location: weatherSnapshot?.location || "",
    condition: weatherSnapshot?.condition_label || "",
    solarRadiation: null,
    soilTemperature: null,
    loading: false,
  };

  // New crop form state for Add Crop Quick Action
  const [newCropForm, setNewCropForm] = useState({
    name: "",
    type: "",
    category: "",
    notes: "",
  });
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddCropSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCropForm.name.trim()) return;
    setFormError("");
    setIsSaving(true);
    try {
      const response = await fetch("/api/crops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newCropForm.name.trim(),
        type: newCropForm.type,
        category: newCropForm.category,
        detail: newCropForm.notes.trim(),
      }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save the crop.");
      setCrops((current) => [result.crop as Crop, ...current]);
      setFormSuccess(`Successfully added ${newCropForm.name} to the crop library.`);
      window.setTimeout(() => {
      setFormSuccess("");
      setNewCropForm({ name: "", type: "", category: "", notes: "" });
      setActiveModal(null);
      }, 1500);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to save the crop.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Weather Grid */}
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Hero Panel */}
        <div className="relative min-h-[250px] overflow-hidden rounded-2xl bg-[#dcefe0] shadow-sm">
          <img
            src={heroImage}
            alt="Farmer tending a rice field"
            className="absolute inset-0 h-full w-full object-cover object-[35%_center] opacity-[0.27] mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#e4f4e5] via-[#e4f4e5]/90 to-[#d9eddf]/30" />
          <div className="relative z-10 max-w-[620px] px-8 py-7 sm:px-9 sm:py-8">
            <p className="text-[10px] font-bold tracking-[1.8px] text-[#27715d]">
              AGRICULTURAL KNOWLEDGE MANAGEMENT SYSTEM
            </p>
            <h1 className="mt-3 max-w-[400px] text-3xl font-extrabold leading-tight tracking-tight text-[#064b3b] sm:text-4xl">
              Smarter Farming.
              <br />
              Better Decisions.
            </h1>
            <p className="mt-3 max-w-[535px] text-xs leading-relaxed text-[#45675e]">
              Access agricultural knowledge, explore crop information, and get smart recommendations to improve your farm productivity.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => router.push("/agricultural-knowledge")}
                className="flex items-center gap-2 rounded-xl bg-[#16875f] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0c704d]"
              >
                <BookOpen size={16} /> Explore Knowledge
              </button>
              <button
                type="button"
                onClick={() => router.push("/consultations")}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-xs font-bold text-[#17604d] hover:bg-white"
              >
                <Lightbulb size={16} /> Get Recommendations
              </button>
            </div>
          </div>
        </div>

        {/* Card 1: Today's Weather Card */}
        <div
          onClick={() => setActiveModal("weatherDetail")}
          className="group cursor-pointer flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 transition hover:shadow-md hover:border-[#277e96]/40"
        >
          <div className="relative min-h-[170px] overflow-hidden bg-[#277e96] px-6 py-5 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,#75c0d2,transparent_38%),linear-gradient(135deg,#267c95,#84bc87)] opacity-90" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold">Latest Stored Weather</h2>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                  Click for details
                </span>
              </div>
              <p className="mt-1 text-xs text-white/80">{weather.location || "No location recorded"}</p>
              <div className="mt-4 flex items-center gap-3">
                {weather.condition.includes("Clear") ? (
                  <Sun size={40} className="text-amber-300" strokeWidth={1.5} />
                ) : weather.condition.includes("Rain") ? (
                  <CloudRain size={40} strokeWidth={1.5} />
                ) : (
                  <CloudSun size={40} strokeWidth={1.5} />
                )}
                <div>
                  <strong className="text-3xl font-extrabold leading-none">
                    {weather.temp === null ? "--" : `${weather.temp}°C`}
                  </strong>
                  <p className="mt-1 text-xs text-white/90">
                    {weather.condition || "No stored weather data"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x border-b border-slate-100 py-3 text-center">
            <div>
              <Droplets className="mx-auto text-[#4b9e9a]" size={17} />
              <p className="mt-1 text-[10px] text-slate-500">Humidity</p>
              <strong className="text-xs">{weather.humidity ?? "--"}%</strong>
            </div>
            <div>
              <CloudRain className="mx-auto text-[#4b9e9a]" size={17} />
              <p className="mt-1 text-[10px] text-slate-500">Rain chance</p>
              <strong className="text-xs">{weather.rainfall === null ? "--" : `${weather.rainfall}%`}</strong>
            </div>
            <div>
              <Wind className="mx-auto text-[#4b9e9a]" size={17} />
              <p className="mt-1 text-[10px] text-slate-500">Wind</p>
              <strong className="text-xs">{weather.wind ?? "--"} km/h</strong>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveModal("weatherDetail");
            }}
            className="flex w-full items-center justify-end gap-1 px-5 py-3 text-xs font-bold text-[#18765b] hover:underline"
          >
            View Forecast <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Dynamic Statistics Metrics Cards (Cards 2, 3, 4, 5) */}
      <section aria-label="Farm overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 2: Active Crops */}
        <article
          onClick={() => setActiveModal("activeCrops")}
          className="group cursor-pointer rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#16875f]/50 border border-slate-100"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e0f5eb] text-[#288b69] group-hover:bg-[#16875f] group-hover:text-white transition">
              <Flower2 size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Active Crops</p>
              <strong className="block text-2xl font-bold leading-7 text-[#123d35]">{stats.activeCrops}</strong>
              <small className="text-[10px] font-semibold text-[#288b69]">From your field records</small>
            </div>
          </div>
        </article>

        {/* Card 3: Recommendations */}
        <article
          onClick={() => setActiveModal("recommendations")}
          className="group cursor-pointer rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#6478d0]/50 border border-slate-100"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e9edff] text-[#6478d0] group-hover:bg-[#6478d0] group-hover:text-white transition">
              <Lightbulb size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Recommendations</p>
              <strong className="block text-2xl font-bold leading-7 text-[#123d35]">{stats.recommendations}</strong>
              <small className="text-[10px] font-semibold text-[#6478d0]">From your saved records</small>
            </div>
          </div>
        </article>

        {/* Card 4: Knowledge Articles */}
        <article
          onClick={() => setActiveModal("knowledgeArticles")}
          className="group cursor-pointer rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#815cc6]/50 border border-slate-100"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eee6ff] text-[#815cc6] group-hover:bg-[#815cc6] group-hover:text-white transition">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Knowledge Articles</p>
              <strong className="block text-2xl font-bold leading-7 text-[#123d35]">{stats.knowledgeArticles}</strong>
              <small className="text-[10px] font-semibold text-[#815cc6]">Available in the knowledge base</small>
            </div>
          </div>
        </article>

        {/* Card 5: Field Records */}
        <article
          onClick={() => setActiveModal("farmHealth")}
          className="group cursor-pointer rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#1b9b70]/50 border border-slate-100"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff1d5] text-[#c49229] group-hover:bg-[#c49229] group-hover:text-white transition">
              <Activity size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-500">Field Records</p>
              <strong className="block text-2xl font-bold leading-7 text-[#123d35]">{stats.fieldRecords}</strong>
              <small className="text-[10px] font-semibold text-[#1b9b70]">{stats.cropCatalog} crops in the database catalog</small>
            </div>
          </div>
        </article>
      </section>

      {/* Main Content Sections (Cards 6, 7, 8) */}
      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr_0.82fr]">
        {/* Card 6: Latest Agricultural Knowledge / Crop Management */}
        <article className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 transition hover:shadow-md">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="flex items-center gap-2.5 text-sm font-bold text-[#123d35]">
              <BookOpen size={18} className="text-[#177b5b]" /> Latest Agricultural Knowledge
            </h2>
            <button
              type="button"
              onClick={() => router.push("/agricultural-knowledge")}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#17765b]"
            >
              View All <ArrowRight size={13} />
            </button>
          </div>
          {latestArticle ? (
            <div
              onClick={() => {
                setSelectedArticle(latestArticle);
                setActiveModal("latestKnowledge");
              }}
              className="flex cursor-pointer gap-4 p-5 transition hover:bg-[#f8fcf9]"
            >
              <div className="flex h-[88px] w-[95px] shrink-0 items-center justify-center rounded-xl bg-[#e0f5eb] text-[#25805e]">
                <BookOpen size={32} strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <span className="inline-flex rounded-full bg-[#e0f5eb] px-2.5 py-1 text-[10px] font-bold text-[#25805e]">
                  {latestArticle.category}
                </span>
                <h3 className="mt-2 text-sm font-bold text-[#123d35]">{latestArticle.title}</h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">{latestArticle.summary}</p>
              </div>
            </div>
          ) : (
            <p className="p-5 text-xs text-slate-500">No knowledge articles are available.</p>
          )}
        </article>

        {/* Card 7: My Crops */}
        <article className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 transition hover:shadow-md">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="flex items-center gap-2.5 text-sm font-bold text-[#123d35]">
              <Flower2 size={18} className="text-[#177b5b]" /> My Crops
            </h2>
            <button
              type="button"
              onClick={() => router.push("/crops")}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#17765b]"
            >
              View All <ArrowRight size={13} />
            </button>
          </div>
          <div
            onClick={() => setActiveModal("myCrops")}
            className="flex cursor-pointer gap-3 p-5 transition hover:bg-[#f8fcf9]"
          >
            <div className="flex h-[70px] w-[57px] shrink-0 items-center justify-center rounded-xl bg-[#e0f5eb] text-[#288b69]">
              <Flower2 size={28} strokeWidth={1.8} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-[#123d35] truncate max-w-[180px]">
                {featuredField?.crop_name || "No active crop records"}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                {featuredField ? `${featuredField.name} · ${featuredField.area} ha` : "Add a field to track crops"}
              </p>
              {featuredField?.planting_date && (
                <p className="mt-1 text-xs text-slate-400">Planted {featuredField.planting_date}</p>
              )}
            </div>
          </div>
        </article>

        {/* Card 8: Quick Actions */}
        <article className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="flex items-center gap-2.5 text-sm font-bold text-[#123d35]">
              <Zap size={18} className="text-[#d29a1e]" /> Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4">
            <button
              type="button"
              onClick={() => setActiveModal("addCrop")}
              className="flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 p-2 text-center transition hover:border-[#9dd9bf] hover:bg-[#f5fbf7]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e9f7ed] text-[#258052]">
                <Plus size={16} />
              </span>
              <span className="text-[11px] font-bold text-slate-700">Add crop</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/consultations")}
              className="flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 p-2 text-center transition hover:border-[#9dd9bf] hover:bg-[#f5fbf7]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0edff] text-[#6857c9]">
                <Lightbulb size={16} />
              </span>
              <span className="text-[11px] font-bold text-slate-700">Recommendations</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/crops")}
              className="flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 p-2 text-center transition hover:border-[#9dd9bf] hover:bg-[#f5fbf7]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff5dd] text-[#bd8a20]">
                <Sprout size={16} />
              </span>
              <span className="text-[11px] font-bold text-slate-700">Crop library</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/reports")}
              className="flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 p-2 text-center transition hover:border-[#9dd9bf] hover:bg-[#f5fbf7]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eaf4fc] text-[#3980ad]">
                <Activity size={16} />
              </span>
              <span className="text-[11px] font-bold text-slate-700">Reports</span>
            </button>
          </div>
        </article>
      </section>

      {/* ==================== INTERACTIVE MODALS ==================== */}

      {/* 1. Active Crops Modal */}
      {activeModal === "activeCrops" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Active Crops Modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-[#123d35] flex items-center gap-2">
                <Flower2 className="text-[#16875f]" size={22} /> Active Crops Overview ({stats.activeCrops})
              </h2>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {activeFields.length ? activeFields.map((field) => (
                <div key={field.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <div>
                    <strong className="block text-sm text-[#123d35]">{field.crop_name || field.name}</strong>
                    <span className="text-xs text-slate-500">{field.name} · {field.area} ha</span>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                    Active
                  </span>
                </div>
              )) : (
                <p className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500">No active field records are available.</p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setActiveModal("addCrop")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#e0f5eb] px-4 py-2 text-xs font-bold text-[#16875f] hover:bg-[#c7ecd9]"
              >
                <Plus size={15} /> Add New Crop
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  router.push("/crops");
                }}
                className="rounded-xl bg-[#16875f] px-5 py-2 text-xs font-bold text-white hover:bg-[#0c704d]"
              >
                Go to Crop Library →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Recommendations Modal */}
      {activeModal === "recommendations" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Recommendations Modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-[#123d35] flex items-center gap-2">
                <Lightbulb className="text-[#6478d0]" size={22} /> Recommended Crops Shortlist
              </h2>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 text-xs">
              {recommendations.length ? recommendations.map((rec, i) => (
                <div key={rec.id} className="rounded-xl border border-slate-100 bg-[#fafcf9] p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#9a621e]">#{i + 1} Recommendation</span>
                    <strong className="text-sm capitalize text-[#16875f]">{rec.type}</strong>
                  </div>
                  <h3 className="font-bold text-[#123d35] text-sm">{rec.crop_name || rec.field_name || "Field recommendation"}</h3>
                  <p className="text-slate-500">{rec.output_text}</p>
                  {rec.field_name && <p className="text-slate-400">Field: {rec.field_name}</p>}
                </div>
              )) : (
                <p className="rounded-xl bg-slate-50 p-4 text-slate-500">No recommendations are saved for your account.</p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  router.push("/consultations");
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#16875f] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0c704d]"
              >
                <MessageSquare size={15} /> Get Consultation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Knowledge Articles Modal */}
      {activeModal === "knowledgeArticles" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Knowledge Articles Modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-[#123d35] flex items-center gap-2">
                <BookOpen className="text-[#815cc6]" size={22} /> Agricultural Knowledge Base ({stats.knowledgeArticles} Articles)
              </h2>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 text-xs">
              {articles.length ? articles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => {
                    setSelectedArticle(art);
                    setActiveModal("latestKnowledge");
                  }}
                  className="cursor-pointer rounded-xl border border-slate-100 bg-[#fafcf9] p-4 transition hover:border-[#815cc6]/40"
                >
                  <span className="rounded-md bg-[#eee6ff] px-2 py-0.5 text-[10px] font-bold text-[#815cc6]">
                    {art.category}
                  </span>
                  <h3 className="mt-1.5 font-bold text-[#123d35] text-sm">{art.title}</h3>
                  <p className="mt-1 text-slate-500">{art.summary}</p>
                </div>
              )) : <p className="rounded-xl bg-slate-50 p-4 text-slate-500">No knowledge articles are available.</p>}
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  router.push("/agricultural-knowledge");
                }}
                className="rounded-xl bg-[#815cc6] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#6c48ab]"
              >
                Browse All {stats.knowledgeArticles} Knowledge Articles →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Farm Health Breakdown Modal */}
      {activeModal === "farmHealth" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Farm Health Modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-[#123d35] flex items-center gap-2">
                <Activity className="text-[#c49229]" size={22} /> Field Records ({stats.fieldRecords})
              </h2>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {fields.length ? fields.map((field) => (
                <div key={field.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <strong className="block text-sm text-[#123d35]">{field.name}</strong>
                  <p className="mt-1 text-slate-500">{field.farm_name} · {field.area} ha</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-slate-600">
                    <span>Soil pH: {Number.isFinite(field.soil_ph) ? field.soil_ph : "Not recorded"}</span>
                    <span>Organic matter: {Number.isFinite(field.organic_matter) ? `${field.organic_matter}%` : "Not recorded"}</span>
                    <span>Water source: {field.water_source || "Not recorded"}</span>
                  </div>
                </div>
              )) : (
                <p className="rounded-xl bg-slate-50 p-4 text-slate-500">No field records are available.</p>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  router.push("/reports");
                }}
                className="rounded-xl bg-[#16875f] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0c704d]"
              >
                View Full Farm Health Report →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Article Reader Modal (Latest Agricultural Knowledge) */}
      {activeModal === "latestKnowledge" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Featured Article Modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 sm:p-6"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <header className="flex items-start justify-between border-b border-slate-100 bg-[#f8fbf7] px-6 py-5">
              <div>
                <span className="rounded-md bg-[#e0f5eb] px-2.5 py-1 text-xs font-bold text-[#25805e]">
                  {displayedArticle?.category || "Knowledge Article"}
                </span>
                <h2 className="mt-2 text-2xl font-bold text-[#123d35]">
                  {displayedArticle?.title || "No article selected"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
              >
                <X size={20} />
              </button>
            </header>

            <div className="space-y-4 overflow-y-auto whitespace-pre-wrap p-6 text-xs leading-relaxed text-slate-700 sm:text-sm">
              {displayedArticle ? (
                <>
                  <p className="rounded-xl border border-slate-100 bg-slate-50 p-4 font-medium text-slate-800">
                    {displayedArticle.summary}
                  </p>
                  <p>{displayedArticle.body}</p>
                  {displayedArticle.evidence_note && <p>Evidence: {displayedArticle.evidence_note}</p>}
                  {displayedArticle.source_url && (
                    <a className="text-[#16875f] underline" href={displayedArticle.source_url} target="_blank" rel="noreferrer">
                      View source
                    </a>
                  )}
                </>
              ) : (
                <p>No knowledge article is available.</p>
              )}
            </div>

            <footer className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl bg-[#16875f] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#0c704d]"
              >
                Close Guide
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* 6. My Crops Detail Modal */}
      {activeModal === "myCrops" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="My Crops Modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-[#123d35] flex items-center gap-2">
                <Flower2 className="text-[#16875f]" size={22} /> Active Crop Profile: {featuredField?.crop_name || "No active crop"}
              </h2>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {featuredField ? (
                <div className="rounded-xl bg-slate-50 p-4 text-xs border border-slate-100">
                  <p><strong>Field:</strong> {featuredField.name}</p>
                  <p className="mt-2"><strong>Farm:</strong> {featuredField.farm_name}</p>
                  <p className="mt-2"><strong>Area:</strong> {featuredField.area} ha</p>
                  <p className="mt-2"><strong>Planting date:</strong> {featuredField.planting_date || "Not recorded"}</p>
                  <p className="mt-2"><strong>Soil pH:</strong> {Number.isFinite(featuredField.soil_ph) ? featuredField.soil_ph : "Not recorded"}</p>
                </div>
              ) : (
                <p className="rounded-xl bg-slate-50 p-4 text-slate-500">No active crop field is recorded.</p>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  router.push("/crop-information");
                }}
                className="rounded-xl bg-[#16875f] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0c704d]"
              >
                Go to Crop Library →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Quick Action: Add Crop Modal */}
      {activeModal === "addCrop" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add Crop Quick Action Modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-[#123d35] flex items-center gap-2">
                <Plus className="text-[#16875f]" size={22} /> Add Crop to Library
              </h2>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {formSuccess && (
              <div role="status" className="rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <Check size={16} /> {formSuccess}
              </div>
            )}
            {formError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{formError}</p>}

            <form onSubmit={handleAddCropSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700">Crop Variety Name *</label>
                <input
                  required
                  value={newCropForm.name}
                  onChange={(e) => setNewCropForm({ ...newCropForm, name: e.target.value })}
                  placeholder="Crop name"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Crop Type *</label>
                <input
                  required
                  value={newCropForm.type}
                  onChange={(e) => setNewCropForm({ ...newCropForm, type: e.target.value })}
                  placeholder="Enter the crop type"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Category</label>
                <input
                  required
                  value={newCropForm.category}
                  onChange={(e) => setNewCropForm({ ...newCropForm, category: e.target.value })}
                  placeholder="Enter the crop category"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Notes</label>
                <textarea
                  rows={2}
                  value={newCropForm.notes}
                  onChange={(e) => setNewCropForm({ ...newCropForm, notes: e.target.value })}
                  placeholder="Optional notes"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-[#16875f] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0c704d]"
                >
                  {isSaving ? "Saving..." : "Save Crop"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Weather Detail Modal */}
      {activeModal === "weatherDetail" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Stored Weather Modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-[#123d35] flex items-center gap-2">
                <Cloud className="text-[#277e96]" size={22} /> Stored Weather Details
              </h2>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-[#277e96] p-5 text-white">
                <p className="text-xs text-white/80">{weather.location || "No location recorded"}</p>
                <div className="mt-2 flex items-center gap-3">
                  <strong className="text-4xl font-bold">{weather.temp === null ? "--" : `${weather.temp}°C`}</strong>
                  <span className="text-sm">{weather.condition || "No stored weather data"}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
                <div>
                  <span className="text-slate-500">Humidity:</span>
                  <strong className="block text-slate-800 text-sm">{weather.humidity === null ? "--" : `${weather.humidity}%`}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Rain chance:</span>
                  <strong className="block text-slate-800 text-sm">{weather.rainfall === null ? "--" : `${weather.rainfall}%`}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Wind Speed:</span>
                  <strong className="block text-slate-800 text-sm">{weather.wind === null ? "--" : `${weather.wind} km/h`}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Soil Temperature:</span>
                  <strong className="block text-slate-800 text-sm">{weather.soilTemperature === null ? "--" : `${weather.soilTemperature}°C`}</strong>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  router.push("/weather");
                }}
                className="rounded-xl bg-[#277e96] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#1f667a]"
              >
                View Weather Records →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
