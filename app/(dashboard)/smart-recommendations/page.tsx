"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Leaf,
  Lightbulb,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Sparkles,
  Sprout,
} from "lucide-react";

type SavedAnalysis = {
  id: string;
  latitude: number;
  longitude: number;
  locationName?: string;
  weather?: Record<string, unknown>;
  recommendations: Array<{
    name: string;
    plantType?: string;
    score: number;
    confidence: string;
    explanation: string;
    soilSuitability?: string;
    nextSteps?: string[];
  }>;
  createdAt: string;
};

export default function SmartRecommendationsPage() {
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/planting-advisor")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.analyses) setAnalyses(data.analyses);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const latestAnalysis = analyses[0];

  return (
    <section className="mx-auto w-full max-w-[1420px] space-y-6">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 rounded-2xl bg-[#e4f4e5] p-7 sm:flex-row sm:items-end sm:p-9 shadow-sm">
        <div>
          <p className="text-[10px] font-bold tracking-[1.5px] text-[#27715d] uppercase">AI & FIELD INTELLIGENCE</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#064b3b] sm:text-4xl">
            Smart Crop Recommendations
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#45675e]">
            Combining field location, live Open-Meteo weather data, and crop requirements to match the best plant varieties.
          </p>
        </div>
        <Link
          href="/planting-advisor"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16875f] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#0c704d]"
        >
          <Sparkles size={18} /> Run Field Analysis
        </Link>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-[#16875f]">
          <LoaderCircle className="animate-spin mr-2" size={20} /> Loading your smart recommendations...
        </div>
      ) : latestAnalysis ? (
        <div className="space-y-6">
          {/* Active Field Analysis Summary */}
          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#9a621e]">Latest Field Run</span>
                <h2 className="mt-1 text-xl font-bold text-[#123d35] flex items-center gap-2">
                  <MapPin size={18} className="text-[#16875f]" /> {latestAnalysis.locationName || "Confirmed Location"}
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                Generated {new Date(latestAnalysis.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {latestAnalysis.recommendations.slice(0, 3).map((rec, idx) => (
                <div
                  key={rec.name}
                  className="flex flex-col justify-between rounded-xl border border-slate-100 bg-[#fafcf9] p-5 shadow-sm hover:border-emerald-200 transition"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-[#9a621e]">#{idx + 1} Best Fit</span>
                      <span className="text-xl font-extrabold text-[#16875f]">{rec.score}/100</span>
                    </div>

                    <h3 className="mt-2 text-base font-bold text-[#123d35]">{rec.name}</h3>
                    {rec.plantType && (
                      <span className="mt-1 inline-block rounded-md bg-[#e8f2e3] px-2 py-0.5 text-[11px] font-bold text-[#2d5a27]">
                        🌱 {rec.plantType}
                      </span>
                    )}

                    <p className="mt-3 text-xs leading-relaxed text-slate-500">{rec.explanation}</p>
                  </div>

                  <Link
                    href="/planting-advisor/history"
                    className="mt-4 flex items-center gap-1 text-xs font-bold text-[#16875f] hover:underline"
                  >
                    View full details & export report <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0edff] text-[#6857c9]">
            <Lightbulb size={32} />
          </div>
          <h2 className="text-xl font-bold text-[#123d35]">No Field Analyses Generated Yet</h2>
          <p className="mx-auto max-w-md text-xs text-slate-500 leading-relaxed">
            Run your first field location analysis to generate smart crop recommendations tailored to your soil, rain, and weather conditions.
          </p>
          <Link
            href="/planting-advisor"
            className="inline-flex items-center gap-2 rounded-xl bg-[#16875f] px-6 py-3 text-xs font-bold text-white hover:bg-[#0c704d]"
          >
            <Sparkles size={16} /> Start Field Analysis
          </Link>
        </div>
      )}
    </section>
  );
}