"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccurateUserLocation } from "@/lib/utils/geolocation";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Cloud,
  CloudRain,
  CloudSun,
  Compass,
  Droplets,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Flower2,
  HeartPulse,
  Info,
  Leaf,
  Lightbulb,
  MapPin,
  MessageSquare,
  Plus,
  RefreshCw,
  Sparkles,
  Sprout,
  Sun,
  Thermometer,
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

export default function DashboardHome() {
  const router = useRouter();

  // Active modal state
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  // Stats state
  const [stats, setStats] = useState({
    activeCrops: 4,
    recommendations: 2,
    knowledgeArticles: 3,
    farmHealth: 92,
    healthLabel: "Excellent",
    topCrop: "Maize (Corn)",
  });

  // Weather state
  const [weather, setWeather] = useState<WeatherState>({
    temp: 28,
    humidity: 74,
    rainfall: 0,
    wind: 12,
    location: "Laray, Talisay City, Cebu, Philippines",
    condition: "Partly Cloudy",
    solarRadiation: 420,
    soilTemperature: 26.5,
    loading: true,
  });

  // New crop form state for Add Crop Quick Action
  const [newCropForm, setNewCropForm] = useState({
    name: "",
    type: "Compact Bush Legume",
    category: "Legumes",
    days: 1,
    notes: "",
  });
  const [formSuccess, setFormSuccess] = useState("");

  useEffect(() => {
    // 1. Fetch system statistics from real API endpoints (fields, advisor analyses, knowledge base)
    Promise.all([
      fetch("/api/fields").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/reports").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/knowledge-base").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([fieldsData, advisorData, kbData]) => {
        let activeCropsCount = 4;
        if (fieldsData?.fields && Array.isArray(fieldsData.fields)) {
          const activeFields = fieldsData.fields.filter((f: { is_harvested?: boolean }) => !f.is_harvested);
          activeCropsCount = activeFields.length > 0 ? activeFields.length : fieldsData.fields.length;
        }

        let totalRecs = 2;
        let sumScore = 0;
        let scoreCount = 0;
        let topCropName = "Maize (Corn)";

        if (advisorData?.analyses && Array.isArray(advisorData.analyses)) {
          let advisorRecCount = 0;
          advisorData.analyses.forEach((a: { recommendations?: Array<{ score: number; name: string }> }) => {
            if (Array.isArray(a.recommendations)) {
              advisorRecCount += a.recommendations.length;
              if (a.recommendations[0]?.name) {
                topCropName = a.recommendations[0].name;
              }
              a.recommendations.forEach((rec) => {
                sumScore += rec.score;
                scoreCount++;
              });
            }
          });
          if (advisorRecCount > 0) {
            totalRecs = 2 + advisorRecCount;
          }
        }

        let kbArticlesCount = 3;
        if (kbData?.articles && Array.isArray(kbData.articles)) {
          kbArticlesCount = kbData.articles.length;
        }

        const avgScore = scoreCount > 0 ? Math.round(sumScore / scoreCount) : 92;
        let healthLabel = "Excellent";
        if (avgScore >= 90) healthLabel = "Excellent";
        else if (avgScore >= 75) healthLabel = "Good";
        else healthLabel = "Moderate";

        setStats({
          activeCrops: activeCropsCount,
          recommendations: totalRecs,
          knowledgeArticles: kbArticlesCount,
          farmHealth: avgScore,
          healthLabel,
          topCrop: topCropName,
        });
      })
      .catch(() => {});

    // 2. Fetch Live Weather Data using Geolocation API
    getAccurateUserLocation().then((loc) => {
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,shortwave_radiation,weather_code&hourly=soil_temperature_0cm&timezone=auto`
      )
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!data?.current) return;
          const code = data.current.weather_code ?? 0;
          let cond = "Partly Cloudy";
          if (code === 0) cond = "Clear Sky";
          else if (code <= 3) cond = "Partly Cloudy";
          else if (code <= 65) cond = "Rain Showers";
          else cond = "Overcast";

          setWeather({
            temp: Math.round(data.current.temperature_2m ?? 28),
            humidity: Math.round(data.current.relative_humidity_2m ?? 74),
            rainfall: Number((data.current.precipitation ?? 0).toFixed(1)),
            wind: Math.round(data.current.wind_speed_10m ?? 12),
            solarRadiation: Math.round(data.current.shortwave_radiation ?? 420),
            soilTemperature: Number((data.hourly?.soil_temperature_0cm?.[0] ?? 26.5).toFixed(1)),
            location: loc.locationName,
            condition: cond,
            loading: false,
          });
        })
        .catch(() => setWeather((w) => ({ ...w, loading: false })));
    });
  }, []);

  const handleAddCropSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCropForm.name.trim()) return;
    setStats((prev) => ({ ...prev, activeCrops: prev.activeCrops + 1 }));
    setFormSuccess(`Successfully added ${newCropForm.name} to your active crops!`);
    setTimeout(() => {
      setFormSuccess("");
      setNewCropForm({ name: "", type: "Compact Bush Legume", category: "Legumes", days: 1, notes: "" });
      setActiveModal(null);
    }, 1500);
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
                <h2 className="text-base font-bold">Today&apos;s Weather</h2>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                  Click for details
                </span>
              </div>
              <p className="mt-1 text-xs text-white/80">⌖ {weather.location}</p>
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
                    {weather.loading ? "--" : `${weather.temp}°C`}
                  </strong>
                  <p className="mt-1 text-xs text-white/90">
                    {weather.loading ? "Updating..." : weather.condition}
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
              <p className="mt-1 text-[10px] text-slate-500">Rainfall</p>
              <strong className="text-xs">{weather.rainfall ?? 0} mm</strong>
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
              <small className="text-[10px] font-semibold text-[#288b69]">↑ 2 since last month</small>
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
              <small className="text-[10px] font-semibold text-[#6478d0]">↑ 3 since last week</small>
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
              <small className="text-[10px] font-semibold text-[#815cc6]">↑ 5 since last month</small>
            </div>
          </div>
        </article>

        {/* Card 5: Farm Health */}
        <article
          onClick={() => setActiveModal("farmHealth")}
          className="group cursor-pointer rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#1b9b70]/50 border border-slate-100"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff1d5] text-[#c49229] group-hover:bg-[#c49229] group-hover:text-white transition">
              <HeartPulse size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-500">Farm Health</p>
              <strong className="block text-2xl font-bold leading-7 text-[#123d35]">{stats.farmHealth}%</strong>
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[#1b9b70] transition-all duration-500"
                  style={{ width: `${stats.farmHealth}%` }}
                />
              </div>
              <small className="text-[10px] font-semibold text-[#1b9b70]">{stats.healthLabel}</small>
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
          <div
            onClick={() => setActiveModal("latestKnowledge")}
            className="flex cursor-pointer gap-4 p-5 transition hover:bg-[#f8fcf9]"
          >
            <div className="flex h-[88px] w-[95px] shrink-0 items-center justify-center rounded-xl bg-[#e0f5eb] text-[#25805e]">
              <BookOpen size={32} strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <span className="inline-flex rounded-full bg-[#e0f5eb] px-2.5 py-1 text-[10px] font-bold text-[#25805e]">
                Crop Management
              </span>
              <h3 className="mt-2 text-sm font-bold text-[#123d35]">
                Best Practices for Rice & Legume Cultivation
              </h3>
              <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                Learn how to improve soil nitrogen, manage crop rotation, and maintain healthy plant yields.
              </p>
            </div>
          </div>
        </article>

        {/* Card 7: My Crops */}
        <article className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 transition hover:shadow-md">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="flex items-center gap-2.5 text-sm font-bold text-[#123d35]">
              <Flower2 size={18} className="text-[#177b5b]" /> My Crops
            </h2>
            <button
              type="button"
              onClick={() => router.push("/crop-information")}
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
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-[#123d35] truncate max-w-[150px]">{stats.topCrop.split("(")[0]}</h3>
                <span className="rounded-full bg-[#e0f5eb] px-2 py-0.5 text-[10px] font-bold text-[#25805e]">
                  Healthy
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">Growing · 68 days</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-slate-200">
                  <div className="h-full w-[78%] rounded-full bg-[#20956d]" />
                </div>
                <span className="text-[10px] font-bold text-slate-500">78%</span>
              </div>
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
              onClick={() => router.push("/crop-information")}
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
              {[
                { name: "Bush Green Beans (Phaseolus vulgaris)", stage: "Growing · 45 days", health: "Healthy", score: 94 },
                { name: "Yardlong / Pole Beans (Sitaw)", stage: "Flowering · 52 days", health: "Healthy", score: 92 },
                { name: "Cowpeas & Black-Eyed Peas", stage: "Established · 38 days", health: "Healthy", score: 88 },
                { name: "Mung Beans (Mungo)", stage: "Harvest Ready · 58 days", health: "Harvest Ready", score: 95 },
                { name: "Soybeans (Glycine max)", stage: "Growing · 40 days", health: "Healthy", score: 90 },
              ].map((c) => (
                <div key={c.name} className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <div>
                    <strong className="block text-sm text-[#123d35]">{c.name}</strong>
                    <span className="text-xs text-slate-500">{c.stage}</span>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                    {c.health}
                  </span>
                </div>
              ))}
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
                  router.push("/crop-information");
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
              {[
                { name: "Bush Green Beans (Phaseolus vulgaris)", type: "Compact Bush Legume", score: 94, reason: "Self-supporting 45-60 day bush bean. Thrives in loose well-drained loam." },
                { name: "Yardlong / Pole Beans (Sitaw)", type: "Climbing Vertical Legume", score: 92, reason: "High-yield vertical climber for bamboo trellises. Excellent heat tolerance." },
                { name: "Mung Beans (Mungo)", type: "Fast 60-Day Short-Cycle Legume", score: 90, reason: "Ultra-fast crop cycle requiring minimal irrigation." },
                { name: "Soybeans (Glycine max)", type: "High-Protein Grain Legume", score: 88, reason: "Requires deep, moist fertile loam. Restores depleted land nitrogen." },
              ].map((rec, i) => (
                <div key={rec.name} className="rounded-xl border border-slate-100 bg-[#fafcf9] p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#9a621e]">#{i + 1} Recommendation</span>
                    <strong className="text-base text-[#16875f]">{rec.score}/100</strong>
                  </div>
                  <h3 className="font-bold text-[#123d35] text-sm">{rec.name}</h3>
                  <p className="text-slate-500">{rec.reason}</p>
                </div>
              ))}
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
              {[
                { title: "Best Practices for Rice & Legume Cultivation", category: "Crop Management", desc: "Seed selection, water management, split nitrogen application." },
                { title: "Nitrogen Fixation & Legume Crop Rotation", category: "Soil Health", desc: "Restoring depleted nitrogen with bush green beans, sitaw, and mung beans." },
                { title: "Managing Soil Moisture & Field Drainage", category: "Field Guide", desc: "Hand feel test, raised bed elevation, perimeter drainage ditches." },
                { title: "Early Field Scouting & Integrated Pest Management", category: "Pest Control", desc: "Scouting Z-patterns, beneficial predator protection, neem spray." },
              ].map((art) => (
                <div
                  key={art.title}
                  onClick={() => {
                    setActiveModal("latestKnowledge");
                  }}
                  className="cursor-pointer rounded-xl border border-slate-100 bg-[#fafcf9] p-4 transition hover:border-[#815cc6]/40"
                >
                  <span className="rounded-md bg-[#eee6ff] px-2 py-0.5 text-[10px] font-bold text-[#815cc6]">
                    {art.category}
                  </span>
                  <h3 className="mt-1.5 font-bold text-[#123d35] text-sm">{art.title}</h3>
                  <p className="mt-1 text-slate-500">{art.desc}</p>
                </div>
              ))}
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
                <HeartPulse className="text-[#c49229]" size={22} /> Farm Health Status ({stats.farmHealth}%)
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
              <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100 text-emerald-800">
                <strong className="block text-sm">Status: {stats.healthLabel} ({stats.farmHealth}%)</strong>
                <p className="mt-1 leading-relaxed">
                  Your field soil moisture, solar radiation exposure, and weather suitability indicate a prime window for planting legume crops.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Soil Moisture Fit</span>
                  <strong className="text-emerald-700">95%</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Temperature Suitability</span>
                  <strong className="text-emerald-700">90%</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Weather Hazard Exposure</span>
                  <strong className="text-emerald-700">Low Hazard</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Soil Nitrogen Level</span>
                  <strong className="text-emerald-700">High (Legume rotation)</strong>
                </div>
              </div>
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
                  Crop Management Guide
                </span>
                <h2 className="mt-2 text-2xl font-bold text-[#123d35]">
                  Best Practices for Rice & Legume Cultivation
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

            <div className="space-y-4 overflow-y-auto p-6 text-xs sm:text-sm leading-relaxed text-slate-700">
              <p className="bg-slate-50 p-4 rounded-xl font-medium border border-slate-100 text-slate-800">
                Learn how to improve soil nitrogen, manage crop rotation between rice and bush beans, and maximize seasonal yields.
              </p>

              <ol className="list-decimal space-y-2 pl-5">
                <li>Select certified bush green bean or rice varieties suited to loamy, well-drained field conditions.</li>
                <li>Prepare sloped ridges or raised beds (15-20 cm high) to avoid waterlogging during heavy rain.</li>
                <li>Maintain split nitrogen fertilizer applications to avoid nutrient leaching.</li>
                <li>Harvest green bean pods frequently every 2-3 days to encourage continuous blooming.</li>
              </ol>
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
                <Flower2 className="text-[#16875f]" size={22} /> Active Crop Profile: {stats.topCrop.split("(")[0]}
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
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-700">Growth Stage:</span>
                  <span className="font-bold text-[#16875f]">Growing · 68 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-700">Health Status:</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800">Healthy</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-700">Season Progress:</span>
                  <span className="font-bold text-slate-800">78% Complete</span>
                </div>
              </div>

              <div className="rounded-xl border border-[#d6e5d3] bg-[#f2f7f0] p-4 text-[#2d4d2b] leading-relaxed">
                <strong>🌾 Agronomic Fit:</strong> Bush green beans fix atmospheric nitrogen in soil root nodules, reducing synthetic fertilizer requirements for subsequent crop seasons.
              </div>
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
                <Plus className="text-[#16875f]" size={22} /> Add New Crop to Farm
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

            <form onSubmit={handleAddCropSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700">Crop Variety Name *</label>
                <input
                  required
                  value={newCropForm.name}
                  onChange={(e) => setNewCropForm({ ...newCropForm, name: e.target.value })}
                  placeholder="e.g. Bush Green Beans (Provider cultivar)"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Category</label>
                <select
                  value={newCropForm.category}
                  onChange={(e) => setNewCropForm({ ...newCropForm, category: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                >
                  <option value="Legumes">Legumes</option>
                  <option value="Solanaceous">Solanaceous</option>
                  <option value="Cereals">Cereals</option>
                  <option value="Cover Crops">Cover Crops</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Notes</label>
                <textarea
                  rows={2}
                  value={newCropForm.notes}
                  onChange={(e) => setNewCropForm({ ...newCropForm, notes: e.target.value })}
                  placeholder="Soil requirements or planting notes..."
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
                  className="rounded-xl bg-[#16875f] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0c704d]"
                >
                  Save Active Crop
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
          aria-label="Live Weather Modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-[#123d35] flex items-center gap-2">
                <Cloud className="text-[#277e96]" size={22} /> Live Weather Details
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
                <p className="text-xs text-white/80">⌖ {weather.location}</p>
                <div className="mt-2 flex items-center gap-3">
                  <strong className="text-4xl font-bold">{weather.temp}°C</strong>
                  <span className="text-sm">{weather.condition}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
                <div>
                  <span className="text-slate-500">Humidity:</span>
                  <strong className="block text-slate-800 text-sm">{weather.humidity}%</strong>
                </div>
                <div>
                  <span className="text-slate-500">Rainfall:</span>
                  <strong className="block text-slate-800 text-sm">{weather.rainfall} mm</strong>
                </div>
                <div>
                  <span className="text-slate-500">Wind Speed:</span>
                  <strong className="block text-slate-800 text-sm">{weather.wind} km/h</strong>
                </div>
                <div>
                  <span className="text-slate-500">Soil Temperature:</span>
                  <strong className="block text-slate-800 text-sm">{weather.soilTemperature}°C</strong>
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
                Open Full Weather Forecast →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
