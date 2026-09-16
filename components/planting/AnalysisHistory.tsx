"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  CloudRain,
  Download,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  FileType,
  HelpCircle,
  Leaf,
  LoaderCircle,
  MapPin,
  Sprout,
  Sun,
  Thermometer,
  Trash2,
  X,
} from "lucide-react";
import { exportToCSV, exportToDOCX, exportToPDF } from "@/lib/utils/export";

type Recommendation = {
  name: string;
  plantType?: string;
  soilSuitability?: string;
  score: number;
  confidence: string;
  explanation: string;
  factors?: string[];
  risks?: string[];
  considerations?: string | string[];
  resilience?: string;
  guideSteps?: string[];
  guideSource?: string;
  evidenceNote?: string;
  nextSteps?: string[];
  referenceUrl?: string;
  imageUrl?: string;
};

type Analysis = {
  id: string;
  latitude: number;
  longitude: number;
  locationName?: string | null;
  weather: Record<string, number | string | null>;
  soil?: { status?: string };
  recommendations: Recommendation[];
  aiObservation?: string;
  hazards?: string[];
  createdAt: string;
};

function normalizeAnalysis(value: Analysis): Analysis {
  const weather = (value.weather as Record<string, unknown> | undefined) ?? {};
  return {
    ...value,
    latitude: Number(value.latitude ?? 0),
    longitude: Number(value.longitude ?? 0),
    weather: weather as Record<string, string | number | null>,
    recommendations: (value.recommendations ?? []).map((crop) => ({
      ...crop,
      factors: Array.isArray(crop.factors) ? crop.factors : [],
      risks: Array.isArray(crop.risks) ? crop.risks : typeof crop.risks === "string" ? [crop.risks] : [],
      nextSteps: Array.isArray(crop.nextSteps) ? crop.nextSteps : typeof crop.nextSteps === "string" ? [crop.nextSteps] : [],
      guideSteps: Array.isArray(crop.guideSteps) ? crop.guideSteps : [],
      considerations: Array.isArray(crop.considerations) ? crop.considerations.join(" ") : String(crop.considerations ?? ""),
    })),
    hazards: value.hazards ?? (Array.isArray(weather.hazards) ? (weather.hazards.filter((item): item is string => typeof item === "string")) : []),
  };
}

export default function AnalysisHistory() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [selectedAnalysisModal, setSelectedAnalysisModal] = useState<Analysis | null>(null);
  const [openExportId, setOpenExportId] = useState<string | null>(null);
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<{ src: string; alt: string } | null>(null);
  const [expandedReference, setExpandedReference] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    fetch("/api/planting-advisor", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load your analysis history.");
        return response.json() as Promise<{ analyses: Analysis[] }>;
      })
      .then((data) => setAnalyses((data.analyses ?? []).map(normalizeAnalysis)))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setBusy(false));
  }, []);

  async function removeAnalysis(id: string) {
    if (!window.confirm("Delete this saved analysis?")) return;
    const response = await fetch(`/api/planting-advisor?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) {
      setError("This analysis could not be deleted.");
      return;
    }
    setAnalyses((current) => current.filter((analysis) => analysis.id !== id));
    if (selectedAnalysisModal?.id === id) {
      setSelectedAnalysisModal(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7f0] px-4 py-10 text-[#1a201a] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/planting-advisor" className="inline-flex items-center gap-2 text-sm font-bold text-[#2d5a27] hover:underline">
          <ArrowLeft size={16} /> Planting Advisor
        </Link>
        <header className="mt-7">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9a621e]">Private field journal</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Analysis history</h1>
          <p className="mt-3 max-w-2xl text-[#5d685c]">
            Review all saved crop analyses, weather conditions, land compatibility, and step-by-step planting FAQs.
          </p>
        </header>

        {error && (
          <p role="alert" className="mt-7 rounded-lg border border-[#e8b9a5] bg-[#fff5ef] px-4 py-3 text-sm text-[#9a3c20]">
            {error}
          </p>
        )}
        {busy && (
          <div className="mt-10 flex items-center gap-3 text-sm text-[#2d5a27]">
            <LoaderCircle className="animate-spin" size={18} /> Loading your analyses...
          </div>
        )}
        {!busy && analyses.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-[#bdd0b9] bg-white p-10 text-center">
            <h2 className="text-xl font-bold">No saved analyses yet</h2>
            <p className="mt-2 text-sm text-[#697469]">Run your first field analysis to build a private record of all recommended crops.</p>
            <Link href="/planting-advisor" className="mt-6 inline-flex rounded-lg bg-[#2d5a27] px-5 py-3 text-sm font-bold text-white">
              Start an analysis
            </Link>
          </div>
        )}

        <div className="mt-8 space-y-5">
          {analyses.map((analysis) => {
            const top = analysis.recommendations?.[0];
            const count = analysis.recommendations?.length ?? 0;
            return (
              <article key={analysis.id} className="rounded-2xl border border-[#dce5d7] bg-white p-5 shadow-[0_12px_35px_rgba(41,73,40,0.06)] sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#5d685c]">
                      <CalendarDays size={16} /> {new Date(analysis.createdAt).toLocaleString()}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-[#697469]">
                      <MapPin size={16} /> {analysis.locationName || "Location name unavailable"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAnalysis(analysis.id)}
                    aria-label="Delete analysis"
                    className="rounded-lg p-2 text-[#9a3c20] hover:bg-[#fff5ef]"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-[#f5f8f3] p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a621e]">Top recommendation</p>
                    <p className="mt-2 text-xl font-bold">{top?.name ?? "No recommendation"}</p>
                    {top?.plantType && (
                      <span className="mt-1.5 inline-block rounded-md bg-[#e0ebd8] px-2 py-0.5 text-xs font-bold text-[#2d5a27]">
                        🌱 {top.plantType}
                      </span>
                    )}
                    <p className="mt-2 text-sm text-[#5d685c]">
                      {top ? `${top.score}/100 · ${top.confidence} confidence` : "Review the full analysis for details."}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#fff8df] p-4 text-sm">
                    <p className="font-bold text-[#745f22]">Recorded conditions</p>
                    <p className="mt-2 text-[#745f22]">Air {analysis.weather?.temperature ?? "unknown"}°C · Humidity {analysis.weather?.humidity ?? "unknown"}%</p>
                    <p className="mt-1 text-[#745f22]">Soil: {analysis.soil?.status || "Open-Meteo values recorded"}</p>
                  </div>
                </div>

                {/* Saved Recommended Crops Shortlist Badges */}
                <div className="mt-4 rounded-xl border border-[#e4ebe1] bg-[#fafcf9] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2d5a27]">
                      Saved Recommended Plants ({count} species)
                    </p>
                    <span className="text-xs font-semibold text-[#5d685c]">Ranked by suitability score</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(analysis.recommendations ?? []).map((crop, idx) => (
                      <span
                        key={crop.name}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#cde0c7] bg-white px-3 py-1.5 text-xs font-semibold text-[#234720]"
                      >
                        <span className="font-bold text-[#9a621e]">#{idx + 1}</span>
                        <span>{crop.name}</span>
                        <span className="rounded bg-[#e8f2e3] px-1.5 py-0.5 text-[10px] font-bold text-[#2d5a27]">
                          {crop.score}/100
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                {analysis.aiObservation && (
                  <p className="mt-4 text-sm leading-6 text-[#586459]">
                    <strong>Visible field notes:</strong> {analysis.aiObservation}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e4ebe1] pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedAnalysisModal(analysis)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#2d5a27] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#1f461c]"
                  >
                    <Eye size={17} /> View All {count} Recommended Plants & FAQ
                  </button>

                  <div className="relative inline-block text-left">
                    <button
                      type="button"
                      onClick={() => setOpenExportId(openExportId === analysis.id ? null : analysis.id)}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#2d5a27] bg-[#f0f7ed] px-4 py-2.5 text-sm font-bold text-[#2d5a27] hover:bg-[#e4f1df]"
                    >
                      <Download size={16} /> Download Report <ChevronDown size={14} />
                    </button>
                    {openExportId === analysis.id && (
                      <div className="absolute right-0 z-30 mt-2 w-60 rounded-xl border border-[#dce5d7] bg-white p-2 shadow-xl">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenExportId(null);
                            exportToPDF(analysis);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[#1a201a] hover:bg-[#f4f8f3]"
                        >
                          <FileText size={16} className="text-[#9a3c20]" />
                          <div>
                            <p className="font-bold">Export as PDF (.pdf)</p>
                            <p className="text-[11px] font-normal text-[#697469]">Print or save report as PDF</p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenExportId(null);
                            exportToDOCX(analysis);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[#1a201a] hover:bg-[#f4f8f3]"
                        >
                          <FileType size={16} className="text-[#2563eb]" />
                          <div>
                            <p className="font-bold">Export as Word (.docx)</p>
                            <p className="text-[11px] font-normal text-[#697469]">Editable Word document</p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenExportId(null);
                            exportToCSV(analysis);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[#1a201a] hover:bg-[#f4f8f3]"
                        >
                          <FileSpreadsheet size={16} className="text-[#16a34a]" />
                          <div>
                            <p className="font-bold">Export as CSV (.csv)</p>
                            <p className="text-[11px] font-normal text-[#697469]">Spreadsheet table data</p>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Modal: View All Recommended Plants & FAQ */}
      {selectedAnalysisModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="All Recommended Plants and FAQ Modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-6"
          onClick={() => setSelectedAnalysisModal(null)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Modal Header */}
            <header className="flex items-start justify-between border-b border-[#e4ebe1] bg-[#f5f8f3] px-6 py-5">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#9a621e]">
                  <Sprout size={15} /> Saved Analysis Details
                </span>
                <h2 className="mt-1 text-2xl font-extrabold text-[#1a201a]">
                  All Recommended Plants & Planting FAQ
                </h2>
                <p className="mt-1 text-xs text-[#5d685c]">
                  {selectedAnalysisModal.locationName || "Location unavailable"} · Saved on {new Date(selectedAnalysisModal.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setSelectedAnalysisModal(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
              >
                <X size={20} />
              </button>
            </header>

            {/* Modal Body */}
            <div className="space-y-6 overflow-y-auto p-6">
              {/* Environment Snapshot */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-[#f5f8f3] p-3">
                  <p className="text-xs text-[#718071]">Air Temp</p>
                  <p className="mt-1 font-bold text-[#1a201a]">{selectedAnalysisModal.weather?.temperature ?? "--"}°C</p>
                </div>
                <div className="rounded-xl bg-[#f5f8f3] p-3">
                  <p className="text-xs text-[#718071]">Humidity</p>
                  <p className="mt-1 font-bold text-[#1a201a]">{selectedAnalysisModal.weather?.humidity ?? "--"}%</p>
                </div>
                <div className="rounded-xl bg-[#f5f8f3] p-3">
                  <p className="text-xs text-[#718071]">Rainfall</p>
                  <p className="mt-1 font-bold text-[#1a201a]">{selectedAnalysisModal.weather?.precipitation ?? "--"} mm</p>
                </div>
                <div className="rounded-xl bg-[#f5f8f3] p-3">
                  <p className="text-xs text-[#718071]">Soil Status</p>
                  <p className="mt-1 text-xs font-bold text-[#1a201a] truncate">{selectedAnalysisModal.soil?.status || "Sensor pending"}</p>
                </div>
              </div>

              {selectedAnalysisModal.aiObservation && (
                <div className="rounded-xl bg-[#edf6e9] p-4 text-sm text-[#2d5a27]">
                  <strong>🌾 AI Field Visual Notes:</strong> {selectedAnalysisModal.aiObservation}
                </div>
              )}

              {/* All Recommended Crops List */}
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-[#1a201a] flex items-center gap-2">
                  <Leaf className="text-[#2d5a27]" size={20} />
                  Recommended Crops Shortlist ({selectedAnalysisModal.recommendations?.length ?? 0} Plants)
                </h3>

                {(selectedAnalysisModal.recommendations ?? []).map((crop, index) => (
                  <article key={crop.name} className="rounded-xl border border-[#dce5d7] bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a621e]">
                          #{index + 1} Recommendation
                        </p>
                        <h4 className="mt-1 text-xl font-bold text-[#1a201a]">{crop.name}</h4>
                        {crop.plantType && (
                          <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#e8f2e3] px-2.5 py-1 text-xs font-bold text-[#2d5a27]">
                            🌱 {crop.plantType}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-[#2d5a27]">
                          {crop.score}
                          <span className="text-sm">/100</span>
                        </p>
                        <p className="text-xs font-semibold text-[#657365]">{crop.confidence} confidence</p>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-[#586459]">
                      <strong>Why it fits:</strong> {crop.explanation}
                    </p>

                    {crop.soilSuitability && (
                      <div className="mt-3 rounded-lg border border-[#d6e5d3] bg-[#f2f7f0] p-3 text-sm leading-6 text-[#2d4d2b]">
                        <strong>🌾 Land & Soil Compatibility:</strong> {crop.soilSuitability}
                      </div>
                    )}

                    {(crop.imageUrl || crop.referenceUrl) && (
                      <div className="mt-4 flex items-center gap-4 rounded-lg bg-[#f5f8f3] p-3">
                        {crop.imageUrl && (
                          <button
                            type="button"
                            aria-label={`Open larger image of ${crop.name}`}
                            onClick={() => setExpandedImage({ src: crop.imageUrl!, alt: `${crop.name} crop` })}
                            className="overflow-hidden rounded-md focus:outline-none focus:ring-2 focus:ring-[#2d5a27]"
                          >
                            <img
                              src={crop.imageUrl}
                              alt={`${crop.name} crop`}
                              loading="lazy"
                              className="h-20 w-24 object-cover transition hover:scale-105"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          </button>
                        )}
                        {crop.referenceUrl && (
                          <button
                            type="button"
                            onClick={() => setExpandedReference({ url: crop.referenceUrl!, title: `${crop.name} reference` })}
                            className="text-sm font-bold text-[#2d5a27] underline underline-offset-2 flex items-center gap-1"
                          >
                            View {crop.name} reference <ExternalLink size={14} />
                          </button>
                        )}
                      </div>
                    )}

                    {crop.factors && crop.factors.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {crop.factors.map((factor) => (
                          <span key={factor} className="rounded-full bg-[#edf5e9] px-3 py-1 text-xs font-semibold text-[#436442]">
                            {factor}
                          </span>
                        ))}
                      </div>
                    )}

                    {crop.risks && crop.risks.length > 0 && (
                      <p className="mt-4 text-sm text-[#586459]">
                        <strong>Watch:</strong> {crop.risks.join(" ")}
                      </p>
                    )}

                    {crop.nextSteps && crop.nextSteps.length > 0 && (
                      <p className="mt-2 text-sm text-[#586459]">
                        <strong>Next steps:</strong> {crop.nextSteps.join(" · ")}
                      </p>
                    )}

                    {/* FAQ Accordion Section */}
                    <div className="mt-4 overflow-hidden rounded-lg border border-[#dce5d7]">
                      <button
                        type="button"
                        onClick={() => setExpandedGuide(expandedGuide === crop.name ? null : crop.name)}
                        aria-expanded={expandedGuide === crop.name}
                        className="flex w-full items-center justify-between bg-[#f5f8f3] px-4 py-3 text-left text-sm font-bold text-[#2d5a27]"
                      >
                        <span className="flex items-center gap-2">
                          <HelpCircle size={16} /> FAQ: What is the best way to plant {crop.name}?
                        </span>
                        <span>{expandedGuide === crop.name ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
                      </button>

                      {expandedGuide === crop.name && (
                        <div className="space-y-3 bg-white p-4 text-sm leading-6 text-[#586459]">
                          {crop.guideSteps && crop.guideSteps.length > 0 ? (
                            <ol className="list-decimal space-y-2 pl-5">
                              {crop.guideSteps.map((step) => (
                                <li key={step}>{step}</li>
                              ))}
                            </ol>
                          ) : (
                            <p className="text-xs italic text-slate-500">Planting steps will follow local extension advice for this variety.</p>
                          )}

                          {crop.evidenceNote && (
                            <p className="rounded-md bg-[#fff8df] p-3 text-xs leading-5 text-[#745f22]">
                              <strong>Evidence Note:</strong> {crop.evidenceNote}
                            </p>
                          )}

                          {crop.guideSource && (
                            <a
                              href={crop.guideSource}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-bold text-[#2d5a27] underline underline-offset-2"
                            >
                              Read the extension planting guide <ExternalLink size={13} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e4ebe1] bg-[#f5f8f3] px-6 py-4">
              <div className="relative inline-block text-left">
                <button
                  type="button"
                  onClick={() => setOpenExportId(openExportId === 'modal' ? null : 'modal')}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#2d5a27] bg-white px-4 py-2.5 text-sm font-bold text-[#2d5a27] hover:bg-[#e4f1df]"
                >
                  <Download size={16} /> Download Report <ChevronDown size={14} />
                </button>
                {openExportId === 'modal' && selectedAnalysisModal && (
                  <div className="absolute bottom-full left-0 z-30 mb-2 w-60 rounded-xl border border-[#dce5d7] bg-white p-2 shadow-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenExportId(null);
                        exportToPDF(selectedAnalysisModal);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[#1a201a] hover:bg-[#f4f8f3]"
                    >
                      <FileText size={16} className="text-[#9a3c20]" />
                      <div>
                        <p className="font-bold">Export as PDF (.pdf)</p>
                        <p className="text-[11px] font-normal text-[#697469]">Print or save report as PDF</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenExportId(null);
                        exportToDOCX(selectedAnalysisModal);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[#1a201a] hover:bg-[#f4f8f3]"
                    >
                      <FileType size={16} className="text-[#2563eb]" />
                      <div>
                        <p className="font-bold">Export as Word (.docx)</p>
                        <p className="text-[11px] font-normal text-[#697469]">Editable Word document</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenExportId(null);
                        exportToCSV(selectedAnalysisModal);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[#1a201a] hover:bg-[#f4f8f3]"
                    >
                      <FileSpreadsheet size={16} className="text-[#16a34a]" />
                      <div>
                        <p className="font-bold">Export as CSV (.csv)</p>
                        <p className="text-[11px] font-normal text-[#697469]">Spreadsheet table data</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedAnalysisModal(null)}
                className="rounded-xl bg-[#2d5a27] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1f461c]"
              >
                Close Modal
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Enlarged Image Lightbox */}
      {expandedImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={expandedImage.alt}
          onClick={() => setExpandedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-5"
        >
          <button
            type="button"
            aria-label="Close enlarged image"
            onClick={() => setExpandedImage(null)}
            className="absolute right-5 top-5 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
          >
            <X size={24} />
          </button>
          <img
            src={expandedImage.src}
            alt={expandedImage.alt}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] max-w-[95vw] rounded-lg object-contain shadow-2xl"
          />
        </div>
      )}

      {/* Wikipedia Reference Iframe Modal */}
      {expandedReference && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={expandedReference.title}
          onClick={() => setExpandedReference(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-8"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h2 className="font-bold text-slate-800">{expandedReference.title}</h2>
              <button
                type="button"
                aria-label="Close reference"
                onClick={() => setExpandedReference(null)}
                className="rounded-full p-2 text-slate-600 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            <iframe
              title={expandedReference.title}
              src={expandedReference.url}
              className="min-h-0 flex-1 border-0"
            />
            <div className="border-t border-slate-200 px-4 py-3 text-right">
              <a
                href={expandedReference.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-bold text-[#2d5a27] underline underline-offset-2"
              >
                Open reference in a new tab
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
