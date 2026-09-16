"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  ChevronUp,
  CloudRain,
  Compass,
  Download,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  FileType,
  HelpCircle,
  ImagePlus,
  Leaf,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Save,
  Sprout,
  Sun,
  Thermometer,
  Wind,
  X,
} from "lucide-react";
import { exportToCSV, exportToDOCX, exportToPDF } from "@/lib/utils/export";
import { getAccurateUserLocation } from "@/lib/utils/geolocation";

type Analysis = {
  id: string;
  latitude: number;
  longitude: number;
  locationName?: string;
  weather: Record<string, unknown>;
  recommendations: Recommendation[];
  hazards?: string[];
  aiObservation?: string;
  createdAt: string;
};
type Recommendation = {
  name: string;
  plantType?: string;
  soilSuitability?: string;
  score: number;
  confidence: string;
  explanation: string;
  factors: string[];
  risks: string[];
  considerations: string;
  resilience: string;
  guideSteps: string[];
  guideSource: string;
  evidenceNote: string;
  nextSteps: string[];
  referenceUrl: string;
  imageUrl: string;
};
const steps = ["Location", "Farm image", "Environment", "Recommendations"];

function normalizeAnalysis(value: Analysis): Analysis {
  const weather = (value.weather as Record<string, unknown> | undefined) ?? {};
  return {
    ...value,
    latitude: Number(value.latitude ?? 0),
    longitude: Number(value.longitude ?? 0),
    weather,
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

export default function PlantingAdvisor({ userName }: { userName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [detectedLocationName, setDetectedLocationName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [history, setHistory] = useState<Analysis[]>([]);
  const [busy, setBusy] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [expandedImage, setExpandedImage] = useState<{ src: string; alt: string } | null>(null);
  const [expandedReference, setExpandedReference] = useState<{ url: string; title: string } | null>(null);
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [liveWeather, setLiveWeather] = useState<{
    temperature?: number | null;
    humidity?: number | null;
    precipitation?: number | null;
    solarRadiation?: number | null;
    windSpeed?: number | null;
    soilTemperature?: number | null;
    loading?: boolean;
  }>({});

  useEffect(() => {
    fetch("/api/planting-advisor")
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (data) =>
          data && setHistory((data.analyses ?? []).map(normalizeAnalysis)),
      );
  }, []);

  useEffect(() => {
    if (!coords) return;
    setLiveWeather({ loading: true });
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,shortwave_radiation&hourly=soil_temperature_0cm&timezone=auto`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setLiveWeather({
          temperature: data.current?.temperature_2m ?? null,
          humidity: data.current?.relative_humidity_2m ?? null,
          precipitation: data.current?.precipitation ?? null,
          solarRadiation: data.current?.shortwave_radiation ?? null,
          windSpeed: data.current?.wind_speed_10m ?? null,
          soilTemperature: data.hourly?.soil_temperature_0cm?.[0] ?? null,
          loading: false,
        });
      })
      .catch(() => setLiveWeather({ loading: false }));
  }, [coords]);
  const locate = async () => {
    setBusy("Detecting your GPS location...");
    setError("");
    try {
      const loc = await getAccurateUserLocation();
      setCoords({ latitude: loc.latitude, longitude: loc.longitude });
      setDetectedLocationName(loc.locationName);
    } catch {
      setError("Could not detect precise location. Please enter or confirm manually.");
    } finally {
      setBusy("");
    }
  };
  const chooseImage = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5_000_000) {
      setError("Choose a JPG, PNG, or WebP image under 5 MB.");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };
  const analyze = async () => {
    if (!coords || !image || busy || saving) return;
    setBusy("Retrieving environmental data and analyzing the planting area...");
    setError("");
    const form = new FormData();
    form.append("latitude", String(coords.latitude));
    form.append("longitude", String(coords.longitude));
    form.append("locationName", detectedLocationName.trim());
    form.append("image", image);
    const response = await fetch("/api/planting-advisor", {
      method: "POST",
      body: form,
    });
    const data = await response.json();
    setBusy("");
    if (!response.ok) {
      setError(
        data.error ?? "Analysis failed. Your saved analyses are unchanged.",
      );
      return;
    }
    const savedAnalysis = normalizeAnalysis(data.analysis);
    setAnalysis(savedAnalysis);
    setIsSaved(false);
    setStep(3);
  };
  const saveAnalysis = async () => {
    if (!analysis || isSaved || saving || busy) return;
    setSaving(true);
    setError("");
    const response = await fetch("/api/planting-advisor", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: analysis.id }),
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) {
      setError(data.error ?? "Analysis could not be saved.");
      return;
    }
    const savedAnalysis = normalizeAnalysis(data.analysis);
    setAnalysis(savedAnalysis);
    setIsSaved(true);
    setHistory((current) => [savedAnalysis, ...current.filter((item) => item.id !== savedAnalysis.id)]);
    router.push("/planting-advisor/history");
  };
  const generateAgain = () => {
    setAnalysis(null);
    setIsSaved(false);
    setStep(2);
    setError("");
  };
  return (
    <main className="min-h-screen bg-[#f5f7f0] px-4 py-10 text-[#1a201a] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-9 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#9a621e]">
              Field intelligence
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Planting Advisor
            </h1>
            <p className="mt-3 max-w-xl text-[#5d685c]">
              Good morning, {userName}. Combine field context, live weather, and
              crop knowledge into a decision you can stand behind.
            </p>
          </div>
          <div className="rounded-xl border border-[#dce5d7] bg-white px-4 py-3 text-sm text-[#496048]">
            <span className="font-semibold">Private workspace</span>
            <br />
            Your analyses belong to your account.
          </div>
        </header>
        <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {steps.map((label, index) => (
            <div
              key={label}
              className={`flex items-center gap-2 border-b-2 px-2 pb-3 text-sm font-semibold ${index <= step ? "border-[#2d5a27] text-[#2d5a27]" : "border-[#dbe4d8] text-[#9aa49a]"}`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${index < step ? "bg-[#2d5a27] text-white" : index === step ? "bg-[#f3cf43] text-[#1a201a]" : "bg-[#e4ebe1]"}`}
              >
                {index < step ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              {label}
            </div>
          ))}
        </div>
        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-2xl border border-[#dce5d7] bg-white p-6 shadow-[0_15px_50px_rgba(41,73,40,0.07)] sm:p-8">
            {error && (
              <div
                role="alert"
                className="mb-5 rounded-lg border border-[#e8b9a5] bg-[#fff5ef] px-4 py-3 text-sm text-[#9a3c20]"
              >
                {error}
              </div>
            )}
            {busy && (
              <div className="mb-5 flex items-center gap-3 rounded-lg bg-[#edf6e9] px-4 py-3 text-sm text-[#2d5a27]">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                {busy}
              </div>
            )}
            {step === 0 && (
              <div>
                <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-xl bg-[#e8f2e3] text-[#2d5a27]">
                  <MapPin />
                </div>
                <h2 className="text-2xl font-bold">
                  Where is the planting area?
                </h2>
                <p className="mt-2 max-w-lg text-[#697469]">
                  Use your device location to anchor weather and crop
                  requirements to the real field. Coordinates are only used for
                  your analyses.
                </p>
                <button
                  onClick={locate}
                  disabled={!!busy}
                  className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#2d5a27] px-5 py-3 text-sm font-bold text-white hover:bg-[#1f461c]"
                >
                  <Compass className="h-4 w-4" /> Detect my location
                </button>
                {coords && (
                  <div className="mt-6 flex items-center justify-between rounded-lg border border-[#bed5b9] bg-[#f3faef] p-4">
                    <div>
                      <p className="text-sm font-bold text-[#2d5a27]">
                        Location detected
                      </p>
                      <label className="mt-2 block text-xs font-semibold text-[#607060]">
                        Exact location name
                        <input
                          value={detectedLocationName}
                          onChange={(event) => setDetectedLocationName(event.target.value)}
                          placeholder="Purok Nangka, Laray, Talisay City, Cebu"
                          maxLength={255}
                          className="mt-1 w-full rounded-md border border-[#bed5b9] bg-white px-3 py-2 text-sm font-normal text-[#1a201a] outline-none focus:border-[#2d5a27]"
                        />
                      </label>
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="rounded-lg bg-[#f3cf43] px-4 py-2 text-sm font-bold"
                    >
                      Confirm location
                    </button>
                  </div>
                )}
              </div>
            )}
            {step === 1 && (
              <div>
                <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-xl bg-[#fff4ce] text-[#9a621e]">
                  <ImagePlus />
                </div>
                <h2 className="text-2xl font-bold">
                  Show us the planting area
                </h2>
                <p className="mt-2 text-[#697469]">
                  A wide, well-lit view helps identify terrain, vegetation,
                  drainage, and available space. Images cannot measure pH,
                  nutrients, or exact moisture.
                </p>
                <label className="mt-7 flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#bdd0b9] bg-[#f8fbf6] p-5 text-center hover:bg-[#f1f8ee]">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Planting area preview"
                      className="max-h-56 rounded-lg object-cover"
                    />
                  ) : (
                    <>
                      <Sprout className="mb-3 h-10 w-10 text-[#6c9764]" />
                      <span className="font-bold text-[#2d5a27]">
                        Upload or capture a field photo
                      </span>
                      <span className="mt-1 text-sm text-[#788478]">
                        JPG, PNG, or WebP · max 5 MB
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    onChange={(event) => chooseImage(event.target.files?.[0])}
                    className="sr-only"
                  />
                </label>
                {preview && (
                  <p className="mt-3 text-xs text-[#697469]">
                    Choose another file above to replace this image.
                  </p>
                )}
                <button
                  onClick={() => setStep(2)}
                  disabled={!image}
                  className="mt-6 rounded-lg bg-[#2d5a27] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continue to environment
                </button>
              </div>
            )}
            {step === 2 && (
              <div>
                <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-xl bg-[#e4f1f4] text-[#287184]">
                  <CloudRain />
                </div>
                <h2 className="text-2xl font-bold">Live field conditions</h2>
                <p className="mt-2 text-[#697469]">
                  Open-Meteo will provide current weather, forecast, solar
                  radiation, and available soil indicators for your confirmed
                  coordinates.
                </p>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <Info
                    icon={<Thermometer />}
                    title="Air temperature"
                    value={
                      liveWeather.loading
                        ? "Retrieving live data..."
                        : liveWeather.temperature !== undefined && liveWeather.temperature !== null
                        ? `${liveWeather.temperature.toFixed(1)}°C`
                        : "Live sensor available"
                    }
                  />
                  <Info
                    icon={<CloudRain />}
                    title="Rainfall & humidity"
                    value={
                      liveWeather.loading
                        ? "Retrieving live data..."
                        : liveWeather.humidity !== undefined
                        ? `${liveWeather.precipitation ?? 0} mm rain · ${liveWeather.humidity ?? "--"}% humidity`
                        : "Live sensor available"
                    }
                  />
                  <Info
                    icon={<Sun />}
                    title="Solar radiation"
                    value={
                      liveWeather.loading
                        ? "Retrieving live data..."
                        : liveWeather.solarRadiation !== undefined && liveWeather.solarRadiation !== null
                        ? `${liveWeather.solarRadiation.toFixed(0)} W/m² (Radiation)`
                        : "Live sensor available"
                    }
                  />
                  <Info
                    icon={<Wind />}
                    title="Wind & soil signals"
                    value={
                      liveWeather.loading
                        ? "Retrieving live data..."
                        : liveWeather.windSpeed !== undefined
                        ? `Wind ${liveWeather.windSpeed ?? "--"} km/h · Soil ${liveWeather.soilTemperature !== null && liveWeather.soilTemperature !== undefined ? `${liveWeather.soilTemperature.toFixed(1)}°C` : "--"}`
                        : "Live sensor available"
                    }
                  />
                </div>
                <div className="mt-6 rounded-lg bg-[#fff8df] p-4 text-sm leading-6 text-[#745f22]">
                  Soil pH, NPK, composition, and exact moisture are{" "}
                  <strong>unknown / not measured</strong> unless you provide
                  sensor or lab results.
                </div>
                <button
                  onClick={analyze}
                  disabled={!!busy || saving}
                  className="mt-6 rounded-lg bg-[#2d5a27] px-5 py-3 text-sm font-bold text-white"
                >
                  {busy ? "Analysis in progress..." : "Start AI field analysis"}
                </button>
              </div>
            )}
            {step === 3 && analysis && (
              <div>
                <div className="mb-7 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#9a621e]">
                      Analysis complete
                    </p>
                    <h2 className="mt-2 text-2xl font-bold">
                      Your crop shortlist
                    </h2>
                  </div>
                  <Leaf className="h-9 w-9 text-[#2d5a27]" />
                </div>
                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    ["Air", `${analysis.weather.temperature ?? "--"}°C`],
                    ["Humidity", `${analysis.weather.humidity ?? "--"}%`],
                    [
                      "Rainfall",
                      `${analysis.weather.precipitation ?? "--"} mm`,
                    ],
                    [
                      "Soil temp",
                      `${analysis.weather.soilTemperature ?? "--"}°C`,
                    ],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-[#f5f8f3] p-3">
                      <p className="text-xs text-[#718071]">{label}</p>
                      <p className="mt-1 font-bold">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mb-6 rounded-xl border border-[#ead9a2] bg-[#fff8df] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-bold text-[#745f22]">Recent location risk signals</h3>
                    <span className="text-xs font-semibold text-[#8b762c]">30-day history · 7-day forecast</span>
                  </div>
                  {analysis.hazards?.length ? (
                    <ul className="mt-3 space-y-2 text-sm leading-5 text-[#745f22]">
                      {analysis.hazards.map((hazard) => <li key={hazard}>• {hazard}</li>)}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-[#745f22]">No heat, heavy-rain, high-wind, dry-spell, or official warning signal was returned for the available weather period.</p>
                  )}
                  <p className="mt-3 text-xs leading-5 text-[#8b762c]">These are weather-derived risk signals, not a guarantee against typhoons, floods, earthquakes, pests, or other local calamities. Check official local advisories before planting.</p>
                </div>
                <div className="space-y-4">
                  {analysis.recommendations.map((crop, index) => (
                    <article
                      key={crop.name}
                      className="rounded-xl border border-[#dce5d7] p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a621e]">
                            #{index + 1} recommendation
                          </p>
                          <h3 className="mt-1 text-xl font-bold">
                            {crop.name}
                          </h3>
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
                          <p className="text-xs font-semibold text-[#657365]">
                            {crop.confidence} confidence
                          </p>
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
                      <div className="mt-4 flex items-center gap-4 rounded-lg bg-[#f5f8f3] p-3">
                        <button
                          type="button"
                          aria-label={`Open larger image of ${crop.name}`}
                          onClick={() => setExpandedImage({ src: crop.imageUrl, alt: `${crop.name} crop` })}
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
                        <button
                          type="button"
                          onClick={() => setExpandedReference({ url: crop.referenceUrl, title: `${crop.name} reference` })}
                          className="text-sm font-bold text-[#2d5a27] underline underline-offset-2"
                        >
                          View {crop.name} reference
                        </button>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {crop.factors.map((factor) => (
                          <span
                            key={factor}
                            className="rounded-full bg-[#edf5e9] px-3 py-1 text-xs font-semibold text-[#436442]"
                          >
                            {factor}
                          </span>
                        ))}
                      </div>
                      <p className="mt-4 text-sm text-[#586459]">
                        <strong>Watch:</strong> {crop.risks.join(" ")}
                      </p>
                      <p className="mt-2 text-sm text-[#586459]">
                        <strong>Next:</strong> {crop.nextSteps.join(" · ")}
                      </p>
                      <p className="mt-2 text-sm text-[#586459]">
                        <strong>Planting considerations:</strong> {crop.considerations}
                      </p>
                      <p className="mt-2 text-sm text-[#586459]">
                        <strong>Resilience note:</strong> {crop.resilience}
                      </p>
                      <div className="mt-4 overflow-hidden rounded-lg border border-[#dce5d7]">
                        <button type="button" onClick={() => setExpandedGuide(expandedGuide === crop.name ? null : crop.name)} aria-expanded={expandedGuide === crop.name} className="flex w-full items-center justify-between bg-[#f5f8f3] px-4 py-3 text-left text-sm font-bold text-[#2d5a27]">
                          <span>FAQ: What is the best way to plant {crop.name}?</span>
                          <span aria-hidden="true">{expandedGuide === crop.name ? "−" : "+"}</span>
                        </button>
                        {expandedGuide === crop.name && <div className="space-y-3 bg-white p-4 text-sm leading-6 text-[#586459]">
                          <ol className="list-decimal space-y-2 pl-5">{crop.guideSteps.map((guideStep) => <li key={guideStep}>{guideStep}</li>)}</ol>
                          <p className="rounded-md bg-[#fff8df] p-3 text-xs leading-5 text-[#745f22]"><strong>Evidence:</strong> {crop.evidenceNote}</p>
                          <a href={crop.guideSource} target="_blank" rel="noreferrer" className="font-bold text-[#2d5a27] underline underline-offset-2">Read the extension planting guide</a>
                        </div>}
                      </div>
                    </article>
                  ))}
                </div>
                <p className="mt-6 text-xs leading-5 text-[#7a8579]">
                  Deterministic crop requirements control the shortlist and
                  score. Gemini image reasoning can add context and
                  explanations, but it cannot turn a photograph into a soil lab
                  test.
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-[#e4ebe1] pt-5">
                  <button
                    type="button"
                    onClick={saveAnalysis}
                    disabled={saving || isSaved || !!busy}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#2d5a27] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={16} /> {isSaved ? "Saved" : saving ? "Saving..." : "Save analysis"}
                  </button>
                  <button
                    type="button"
                    onClick={generateAgain}
                    disabled={saving || !!busy}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#bdd0b9] px-4 py-3 text-sm font-bold text-[#2d5a27] hover:bg-[#f1f8ee] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCw size={16} /> Generate again
                  </button>

                  <div className="relative inline-block text-left">
                    <button
                      type="button"
                      onClick={() => setExportOpen(!exportOpen)}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#2d5a27] bg-[#f0f7ed] px-4 py-3 text-sm font-bold text-[#2d5a27] hover:bg-[#e4f1df]"
                    >
                      <Download size={16} /> Download Report <ChevronDown size={14} />
                    </button>
                    {exportOpen && (
                      <div className="absolute left-0 z-30 mt-2 w-60 rounded-xl border border-[#dce5d7] bg-white p-2 shadow-xl">
                        <button
                          type="button"
                          onClick={() => {
                            setExportOpen(false);
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
                            setExportOpen(false);
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
                            setExportOpen(false);
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
              </div>
            )}
          </div>
          <aside className="rounded-2xl border border-[#dce5d7] bg-[#203b28] p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f3cf43]">
              Saved analyses
            </p>
            <h2 className="mt-2 text-xl font-bold">Your field journal</h2>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Previous analyses are scoped to your account.
            </p>
            {history.length === 0 ? (
              <p className="mt-8 text-sm text-white/60">
                Your first analysis will appear here.
              </p>
            ) : (
              <div className="mt-7 space-y-3">
                {history.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    disabled={!!busy || saving}
                    onClick={() => {
                      setAnalysis(normalizeAnalysis(item));
                      setStep(3);
                    }}
                    className="w-full rounded-lg border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10"
                  >
                    <p className="text-sm font-bold">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                    <p className="mt-1 text-xs text-white/60">
                      {item.locationName || "Location name unavailable"}
                    </p>
                    <p className="mt-2 text-xs text-[#d7edcc]">
                      {item.recommendations?.[0]?.name ?? "Analysis"} ·{" "}
                      {item.recommendations?.[0]?.score ?? "--"}/100
                    </p>
                  </button>
                ))}
              </div>
            )}
          </aside>
        </section>
      </div>
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
function Info({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#e1e8de] p-3">
      <span className="text-[#2d5a27]">{icon}</span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-[#7a8579]">{value}</p>
      </div>
    </div>
  );
}
