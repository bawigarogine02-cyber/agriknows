"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Calendar,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  FileType,
  Flower2,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { exportToCSV, exportToDOCX, exportToPDF } from "@/lib/utils/export";

type SavedAnalysis = {
  id: string;
  latitude: number;
  longitude: number;
  locationName?: string | null;
  weather?: Record<string, unknown>;
  recommendations: Array<{
    name: string;
    plantType?: string;
    score: number;
    confidence: string;
    explanation: string;
  }>;
  createdAt: string;
};

export default function ReportsPage() {
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    fetch("/api/planting-advisor")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.analyses) setAnalyses(data.analyses);
      })
      .catch(() => {});
  }, []);

  const totalAnalyses = analyses.length;
  const totalCropsRecommended = analyses.reduce((acc, a) => acc + (a.recommendations?.length ?? 0), 0);
  const latestLocation = analyses[0]?.locationName || "San Jose, Nueva Ecija";

  return (
    <section className="mx-auto w-full max-w-[1420px] space-y-6">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 rounded-2xl bg-[#e4f4e5] p-7 sm:flex-row sm:items-end sm:p-9 shadow-sm">
        <div>
          <p className="text-[10px] font-bold tracking-[1.5px] text-[#27715d] uppercase">FARM PERFORMANCE & ANALYTICS</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#064b3b] sm:text-4xl">Farm Reports</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#45675e]">
            Review field activity logs, saved crop shortlist reports, and seasonal performance indicators.
          </p>
        </div>

        {/* Download Export Button Dropdown */}
        <div className="relative inline-block text-left">
          <button
            type="button"
            onClick={() => setExportOpen(!exportOpen)}
            disabled={totalAnalyses === 0}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#16875f] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#0c704d] disabled:opacity-50"
          >
            <Download size={18} /> Export Farm Report <ChevronDown size={14} />
          </button>

          {exportOpen && analyses[0] && (
            <div className="absolute right-0 z-30 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
              <button
                type="button"
                onClick={() => {
                  setExportOpen(false);
                  exportToPDF(analyses[0]);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                <FileText size={18} className="text-rose-600" />
                <div>
                  <p className="font-bold">Export PDF Report (.pdf)</p>
                  <p className="text-[10px] font-normal text-slate-400">Print or save as PDF document</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setExportOpen(false);
                  exportToDOCX(analyses[0]);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                <FileType size={18} className="text-blue-600" />
                <div>
                  <p className="font-bold">Export Word Doc (.docx)</p>
                  <p className="text-[10px] font-normal text-slate-400">Editable Word format</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setExportOpen(false);
                  exportToCSV(analyses[0]);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                <FileSpreadsheet size={18} className="text-emerald-600" />
                <div>
                  <p className="font-bold">Export CSV Spreadsheet (.csv)</p>
                  <p className="text-[10px] font-normal text-slate-400">Structured data rows</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e0f5eb] text-[#288b69]">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Saved Analyses</p>
              <strong className="block text-2xl font-extrabold text-[#123d35]">{totalAnalyses}</strong>
              <small className="text-[10px] font-bold text-[#288b69]">Recorded field runs</small>
            </div>
          </div>
        </article>

        <article className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e9edff] text-[#6478d0]">
              <Flower2 size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Crops Evaluated</p>
              <strong className="block text-2xl font-extrabold text-[#123d35]">{totalCropsRecommended}</strong>
              <small className="text-[10px] font-bold text-[#6478d0]">Plant shortlist entries</small>
            </div>
          </div>
        </article>

        <article className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff1d5] text-[#c49229]">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Primary Field Hub</p>
              <strong className="block text-base font-bold text-[#123d35] truncate max-w-[180px]">{latestLocation}</strong>
              <small className="text-[10px] font-bold text-[#c49229]">Active workspace</small>
            </div>
          </div>
        </article>
      </div>

      {/* Activity Logs List */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-[#123d35] border-b border-slate-100 pb-4">
          Field Activity & Saved Reports Journal
        </h2>

        {totalAnalyses === 0 ? (
          <p className="py-8 text-center text-xs text-slate-500">
            No saved reports yet. Run a field analysis in Planting Advisor to generate detailed reports.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-slate-100">
            {analyses.map((a) => (
              <div key={a.id} className="py-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-[#123d35] flex items-center gap-1.5 text-sm">
                    <MapPin size={15} className="text-[#16875f]" /> {a.locationName || "Confirmed Location"}
                  </p>
                  <p className="mt-1 text-slate-500 flex items-center gap-1">
                    <Calendar size={13} /> Saved on {new Date(a.createdAt).toLocaleString()} · {a.recommendations?.length ?? 0} recommended crops
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => exportToPDF(a)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 font-bold text-[#16875f] hover:bg-[#e4f4e5]"
                >
                  Download PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}