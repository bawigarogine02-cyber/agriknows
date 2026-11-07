"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sprout,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Globe,
  BookOpen,
  FlaskConical,
  RefreshCw,
  Search,
  MapPin,
  History,
  X,
  Sparkles,
  ArrowRight,
  Info,
  Printer,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { getAccurateUserLocation } from "@/lib/utils/geolocation";
import type { CropAdvisorAnalysis } from "@/lib/db/repository";

interface CropAdvisorClientProps {
  initialAnalyses: CropAdvisorAnalysis[];
}

const analysisDateFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});
const analysisDateTimeFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

function textMentionsCrop(text: string, cropName: string) {
  const variants = cropName.split(/[()[\],/]/).map((value) => value.trim()).filter((value) => value.length >= 3);
  return [...new Set([cropName.trim(), ...variants])].some((variant) => {
    const escaped = variant.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(text.toLowerCase());
  });
}

export default function CropAdvisorClient({ initialAnalyses }: CropAdvisorClientProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysesHistory, setAnalysesHistory] = useState<CropAdvisorAnalysis[]>(initialAnalyses);
  const [currentAnalysis, setCurrentAnalysis] = useState<CropAdvisorAnalysis | null>(
    initialAnalyses.length > 0 ? initialAnalyses[0] : null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"recommendations" | "evidence" | "missing_info">("recommendations");

  const [locationName, setLocationName] = useState<string>("Detecting Location...");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAccurateUserLocation().then((res) => {
      setLocationName(res.locationName);
      setCoords({ lat: res.latitude, lng: res.longitude });
    }).catch(() => setLocationName("Location unavailable"));
  }, []);

  const handleFileSelect = (file: File) => {
    setErrorMsg(null);
    const validMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validMimes.includes(file.type.toLowerCase())) {
      setErrorMsg("Unsupported image format. Please upload JPG, JPEG, PNG, or WebP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File size exceeds 10MB limit.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const runAnalysisWorkflow = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    setErrorMsg(null);
    setSavedToast(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      if (coords) {
        formData.append("latitude", coords.lat.toString());
        formData.append("longitude", coords.lng.toString());
      }
      formData.append("locationName", locationName);

      const res = await fetch("/api/crop-advisor", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to analyze image.");
      }

      const result: CropAdvisorAnalysis = await res.json();
      setCurrentAnalysis(result);
      
      const updatedHistory = [result, ...analysesHistory.filter((a) => a.id !== result.id)];
      setAnalysesHistory(updatedHistory);

      setSavedToast("Analysis automatically saved to history database.");
      setTimeout(() => setSavedToast(null), 5000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An error occurred during analysis.");
    } finally {
      setAnalyzing(false);
    }
  };

  const deleteHistoryItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/crop-advisor?id=${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to delete the analysis.");

      const updated = analysesHistory.filter((analysis) => analysis.id !== id);
      setAnalysesHistory(updated);
      if (currentAnalysis?.id === id) {
        setCurrentAnalysis(updated.length > 0 ? updated[0] : null);
      }
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Unable to delete the analysis.");
    }
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setErrorMsg(null);
  };

  const handleAnalyzeAnotherImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setErrorMsg(null);
    setCurrentAnalysis(null);
  };

  const filteredHistory = analysesHistory.filter((item) => {
    if (!historySearchQuery.trim()) return true;
    const q = historySearchQuery.toLowerCase();
    const loc = (item.location_name || "").toLowerCase();
    const crop = (item.recommendations[0]?.plantName || "").toLowerCase();
    return loc.includes(q) || crop.includes(q);
  });
  const qualifyingRecommendations = currentAnalysis?.recommendations.filter(
    (crop) => crop.estimatedSuitability >= 50
  ) ?? [];
  const candidateCropNames = qualifyingRecommendations.map((crop) => crop.plantName);
  const relevantInternalResearch = currentAnalysis?.internal_research.filter((source) =>
    candidateCropNames.some((cropName) =>
      textMentionsCrop(`${source.title} ${source.categoryOrCrop} ${source.summary}`, cropName)
    )
  ) ?? [];
  const relevantWebResearch = currentAnalysis?.web_research.filter((source) =>
    candidateCropNames.some((cropName) =>
      textMentionsCrop(`${source.topic} ${source.title} ${source.keyTakeaway}`, cropName)
    )
  ) ?? [];
  const webResearchStatus = currentAnalysis?.confidence_score.evidenceBreakdown.webResearchSupport;
  const displayedWebResearchStatus = webResearchStatus === "No external research sources are configured."
    ? "External literature search was not run for this saved analysis. Run a new analysis to search for relevant citations."
    : relevantWebResearch.length === 0 && currentAnalysis?.web_research.length
      ? "Saved citations did not match the crops in this analysis and are not shown."
      : webResearchStatus;

  return (
    <div className="space-y-7 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-[#064b3b] via-[#0b6b54] to-[#128a6d] p-6 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/20 backdrop-blur-md">
              <Sprout className="h-6 w-6 text-emerald-200" />
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Crop Advisor</h1>
            <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-200 border border-emerald-300/30">
              AI Vision & Research
            </span>
          </div>
          <p className="max-w-2xl text-base text-emerald-100/90 leading-relaxed">
            Upload a land or soil image for a preliminary crop screening. The analysis combines AI-generated visual notes,
            your crop catalog, relevant research records, and weather data when available. Results are saved to your history.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-emerald-100 backdrop-blur-md border border-white/10">
            <MapPin size={15} className="text-emerald-300" />
            <span className="max-w-[180px] truncate">{locationName}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-300/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-300/30 border border-emerald-200/30 shadow-sm"
          >
            <History size={16} />
            <span>History</span>
            {analysesHistory.length > 0 && (
              <span className="ml-1 rounded-full bg-emerald-400 px-2 py-0.5 text-xs font-extrabold text-[#064b3b]">
                {analysesHistory.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Auto-Save Toast Notification */}
      {savedToast && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 shadow-md">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span className="font-bold">{savedToast}</span>
          </div>
          <button type="button" onClick={() => setSavedToast(null)} className="text-emerald-700 hover:text-emerald-950">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {!currentAnalysis || selectedFile ? (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Upload Area */}
          <div className={`${analyzing ? "lg:col-span-6" : "lg:col-span-12"} space-y-6 transition-all`}>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Land & Soil Image Upload</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Provide a clear photo of the soil surface, field plot, or land area for analysis.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {analysesHistory.length > 0 && !currentAnalysis && (
                    <button
                      type="button"
                      onClick={() => setCurrentAnalysis(analysesHistory[0])}
                      className="rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-extrabold text-emerald-800 hover:bg-emerald-100 transition flex items-center gap-1.5"
                    >
                      <ArrowRight size={14} className="rotate-180 text-emerald-600" />
                      <span>View Previous Results</span>
                    </button>
                  )}
                  <span className="text-xs font-medium text-slate-400 shrink-0">Supported: JPG, PNG, WebP (Max 10MB)</span>
                </div>
              </div>

              {errorMsg && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {!imagePreview ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
                    isDragOver
                      ? "border-emerald-500 bg-emerald-50/50"
                      : "border-slate-300 bg-slate-50/50 hover:border-emerald-500 hover:bg-slate-50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 group-hover:scale-110 transition-transform">
                    <UploadCloud className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Drag & drop your land photo here</h3>
                  <p className="mt-1 text-sm text-slate-500">or click to browse from your device</p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs font-semibold text-slate-500">
                    <span className="rounded-md bg-slate-200/60 px-2.5 py-1">JPG</span>
                    <span className="rounded-md bg-slate-200/60 px-2.5 py-1">JPEG</span>
                    <span className="rounded-md bg-slate-200/60 px-2.5 py-1">PNG</span>
                    <span className="rounded-md bg-slate-200/60 px-2.5 py-1">WEBP</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-md">
                    {/* Image Preview */}
                    <img
                      src={imagePreview}
                      alt="Land/Soil Preview"
                      className="max-h-[380px] w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                      <div className="min-w-0 flex-1">
                        <p
                          title={selectedFile?.name}
                          className="max-w-full truncate text-sm font-bold"
                        >
                          {selectedFile?.name}
                        </p>
                        <p className="text-xs text-slate-300">
                          {(selectedFile?.size ? selectedFile.size / (1024 * 1024) : 0).toFixed(2)} MB • Ready for analysis
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={resetAnalysis}
                        disabled={analyzing}
                        className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/30 disabled:opacity-50"
                      >
                        Change Photo
                      </button>
                    </div>
                  </div>

                  {!analyzing && (
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={resetAnalysis}
                        className="w-full sm:w-auto rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={runAnalysisWorkflow}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#064b3b] px-7 py-3 text-sm font-extrabold text-white shadow-lg transition hover:bg-[#0b6b54] active:scale-[0.99]"
                      >
                        <Sparkles size={18} className="text-emerald-300" />
                        <span>Analyze & Generate Recommendation</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Analysis progress */}
          {analyzing && (
            <div className="lg:col-span-6 space-y-6">
              <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-md sm:p-8">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="flex h-10 w-10 animate-spin items-center justify-center rounded-full border-2 border-emerald-600 border-t-transparent text-emerald-600">
                    <RefreshCw size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Analysis In Progress</h3>
                    <p className="text-xs text-slate-500">
                      Reviewing image estimates, crop catalog data, and relevant study records.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Results View */}
      {currentAnalysis && !analyzing && (
        <div className="space-y-8">
          {/* Analysis Top Bar */}
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xl border border-emerald-200">
                <Sprout size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-slate-900">Soil Analysis Results</h2>
                  <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Saved to History
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  Analyzed on {analysisDateFormat.format(new Date(currentAnalysis.created_at))} • Location:{" "}
                  {currentAnalysis.environmental_data.locationName}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <Printer size={15} />
                <span>Print Report</span>
              </button>
              <button
                type="button"
                onClick={handleAnalyzeAnotherImage}
                className="flex items-center gap-1.5 rounded-xl bg-[#064b3b] px-4 py-2 text-xs font-bold text-white hover:bg-[#0b6b54] transition shadow-sm"
              >
                <RefreshCw size={15} />
                <span>Analyze Another Image</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab("recommendations")}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-extrabold transition ${
                activeTab === "recommendations"
                  ? "border-emerald-600 text-emerald-800"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Sprout size={17} />
              <span>Crop Candidates</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 font-extrabold">
                {qualifyingRecommendations.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("evidence")}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-extrabold transition ${
                activeTab === "evidence"
                  ? "border-emerald-600 text-emerald-800"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <BookOpen size={17} />
              <span>Three Evidence Sources</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("missing_info")}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-extrabold transition ${
                activeTab === "missing_info"
                  ? "border-emerald-600 text-emerald-800"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <FlaskConical size={17} />
              <span>Evidence Limits & Lab Testing</span>
            </button>
          </div>

          {/* TAB 1: RECOMMENDATIONS */}
          {activeTab === "recommendations" && (
            <div className="space-y-8">
              {/* Disclaimer Banner */}
              <div className="flex items-start gap-3.5 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
                <Info className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <span className="font-bold">Important Notice:</span>{" "}
                  <strong className="underline">Preliminary crop screening</strong> compares AI-estimated surface
                  conditions and available weather with the crop catalog. Only crops with an estimated screening score
                  of at least 50% are listed. This heuristic score is not a measured suitability or probability of
                  success. A photo cannot measure soil pH, nutrients, or drainage; verify conditions with local
                  expertise and laboratory testing before making planting decisions.
                </div>
              </div>

              {/* Recommended Plants Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {qualifyingRecommendations.length === 0 && (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 md:col-span-2">
                    No crop met the 50% screening threshold for this analysis. This does not mean crops cannot grow
                    here; confirm conditions with local agricultural advice and soil-test results.
                  </p>
                )}
                {qualifyingRecommendations.map((plant, index) => (
                  <div
                    key={plant.plantName}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
                  >
                    <div className="space-y-5">
                      {/* Title & Badge */}
                      <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-extrabold text-slate-900">{plant.plantName}</h3>
                            {index === 0 && (
                              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                                Highest-ranked candidate
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-medium text-slate-500">{plant.cropCategory}</p>
                        </div>

                        <div className="text-right">
                          <span className="block text-2xl font-black text-emerald-700">
                            {plant.estimatedSuitability}%
                          </span>
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                            {plant.suitabilityRating}
                          </span>
                          <p className="mt-1 text-[11px] font-semibold text-slate-400">Estimated land match</p>
                        </div>
                      </div>

                      {/* Reasons for Recommendation */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Why it ranked here</h4>
                        <ul className="space-y-1.5 text-xs text-slate-700">
                          {plant.reasons.map((reason, rIdx) => (
                            <li key={rIdx} className="flex items-start gap-2">
                              <CheckCircle2 size={14} className="mt-0.5 text-emerald-600 shrink-0" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Plant Requirements Grid */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Agronomic Requirements</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-lg bg-slate-50 p-2.5">
                            <span className="text-slate-400 block font-medium">Ideal pH Range</span>
                            <span className="font-bold text-slate-800">{plant.idealPhRange}</span>
                          </div>
                          <div className="rounded-lg bg-slate-50 p-2.5">
                            <span className="text-slate-400 block font-medium">Water Needed</span>
                            <span className="font-bold text-slate-800">{plant.waterRequirement}</span>
                          </div>
                          <div className="rounded-lg bg-slate-50 p-2.5">
                            <span className="text-slate-400 block font-medium">Growth Window</span>
                            <span className="font-bold text-slate-800">{plant.growthDays} Days</span>
                          </div>
                          <div className="rounded-lg bg-slate-50 p-2.5">
                            <span className="text-slate-400 block font-medium">Companion Crops</span>
                            <span className="font-bold text-slate-800">{plant.companionCrops}</span>
                          </div>
                        </div>
                      </div>

                      {/* Required Improvements */}
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3.5 space-y-1.5">
                        <h5 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <Sprout size={14} className="text-emerald-700" />
                          Recommended Land Improvements
                        </h5>
                        <ul className="text-xs text-emerald-900 space-y-1 list-disc list-inside">
                          {plant.requiredImprovements.map((imp, iIdx) => (
                            <li key={iIdx}>{imp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 2: THREE EVIDENCE SOURCES */}
          {activeTab === "evidence" && (
            <div className="space-y-8">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Source 1: Image Observations */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">1. Image Observations</h3>
                      <p className="text-[11px] text-slate-400">AI Vision Model Visual Analysis</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block mb-1">Visible details suggested by AI:</span>
                      <ul className="list-disc list-inside space-y-1 text-slate-600">
                        {currentAnalysis.image_observations.visuallyObserved.map((obs, idx) => (
                          <li key={idx}>{obs}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="font-bold text-slate-800 block mb-1">AI-estimated properties (not measured):</span>
                      <ul className="list-disc list-inside space-y-1 text-slate-600">
                        {currentAnalysis.image_observations.estimatedProperties.map((est, idx) => (
                          <li key={idx}>{est}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-amber-900">
                      <span className="font-bold block mb-1">Requires Lab Testing:</span>
                      <ul className="list-disc list-inside space-y-1 text-amber-800">
                        {currentAnalysis.image_observations.requiresLabTesting.map((lab, idx) => (
                          <li key={idx}>{lab}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Source 2: Agricultural Research Database */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">2. Agricultural Research Database</h3>
                      <p className="text-[11px] text-slate-400">Crop-matched records from this app</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    {relevantInternalResearch.map((res, idx) => (
                      <div key={idx} className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1">
                        <span className="font-bold text-slate-800 block">{res.title}</span>
                        <p className="text-slate-500 font-medium">By {res.author} • {res.categoryOrCrop}</p>
                        <p className="text-slate-600 text-[11px] leading-relaxed mt-1">{res.summary}</p>
                      </div>
                    ))}
                    {relevantInternalResearch.length === 0 && (
                      <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-600">
                        No internal study matched the crop candidates in this analysis.
                      </p>
                    )}
                  </div>
                </div>

                {/* Source 3: Web Research */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                      <Globe size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">3. External Literature Search</h3>
                      <p className="text-[11px] text-slate-400">Crossref-indexed citations screened by crop name</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    {relevantWebResearch.map((web, idx) => (
                      <div key={idx} className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1">
                        <a
                          href={web.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-emerald-700 hover:underline block"
                        >
                          {web.title}
                        </a>
                        <p className="text-slate-500 font-medium">{web.sourceName}</p>
                        <p className="text-slate-600 text-[11px] leading-relaxed mt-1">
                          <span className="font-semibold">Publisher abstract: </span>
                          {web.keyTakeaway}
                        </p>
                      </div>
                    ))}
                    {relevantWebResearch.length === 0 && (
                      <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-600">
                        {displayedWebResearchStatus || "No relevant external citation was saved for this analysis."}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONFIDENCE & LAB TESTING GUIDE */}
          {activeTab === "missing_info" && (
            <div className="space-y-8">
              {/* Confidence Index Box */}
              <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/50 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-8 w-8 text-emerald-700" />
                    <div>
                      <h3 className="text-lg font-extrabold text-emerald-950">Evidence Limits & Testing</h3>
                      <p className="text-xs text-emerald-800">This screening is not a calibrated confidence or success probability.</p>
                    </div>
                  </div>

                  <div className="max-w-sm rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                    Image estimates cannot replace field measurements. Confirm soil texture, drainage, pH, nutrients,
                    and local growing conditions before acting on a crop suggestion.
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-emerald-900">
                  <div className="rounded-xl bg-white/70 p-3 border border-emerald-200/50">
                    <span className="font-bold block">Image-based observations:</span>
                    {currentAnalysis.confidence_score.evidenceBreakdown.imageObservationQuality}
                  </div>
                  <div className="rounded-xl bg-white/70 p-3 border border-emerald-200/50">
                    <span className="font-bold block">Relevant internal records:</span>
                    {relevantInternalResearch.length} saved record(s) mention the candidate crops.
                  </div>
                  <div className="rounded-xl bg-white/70 p-3 border border-emerald-200/50">
                    <span className="font-bold block">External literature lookup:</span>
                    {displayedWebResearchStatus}
                  </div>
                  <div className="rounded-xl bg-white/70 p-3 border border-emerald-200/50">
                    <span className="font-bold block">Interpretation limits:</span>
                    {currentAnalysis.confidence_score.evidenceBreakdown.aiInferenceCertainty}
                  </div>
                </div>
              </div>

              {/* Recommended Lab Tests */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Recommended Laboratory Tests</h3>
                  <p className="text-xs text-slate-500">Perform these additional tests to elevate estimation accuracy to lab precision</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {currentAnalysis.missing_information.recommendedTests.map((test, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{test.testName}</span>
                        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                          {test.importance} Priority
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{test.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analysis History Modal/Drawer */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-emerald-700" />
                <h3 className="text-lg font-bold text-slate-900">Crop Advisor History Database</h3>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                  {analysesHistory.length} Saved
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter / Search Box */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                placeholder="Search history by location or crop name..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {filteredHistory.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <Sprout className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                  <p className="text-sm font-semibold">No saved crop advisor analyses found</p>
                  <p className="text-xs">Upload your land photo to automatically save recommendations to history.</p>
                </div>
              ) : (
                filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setCurrentAnalysis(item);
                      setShowHistoryModal(false);
                      setSelectedFile(null);
                    }}
                    className={`group flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
                      currentAnalysis?.id === item.id
                        ? "border-emerald-500 bg-emerald-50/50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-800">
                          {item.location_name || "Field Parcel Analysis"}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">ID: {item.id.slice(0, 8)}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {analysisDateTimeFormat.format(new Date(item.created_at))} • {item.recommendations.length} Candidate Crops
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                        Highest-ranked: {item.recommendations.find((crop) => crop.estimatedSuitability >= 50)?.plantName || "No candidate"}
                      </span>
                      <button
                        type="button"
                        title="Delete from history"
                        onClick={(e) => deleteHistoryItem(e, item.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
