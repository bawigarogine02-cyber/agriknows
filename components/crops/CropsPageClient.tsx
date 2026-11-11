"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Filter,
  Flower2,
  Plus,
  Search,
  Sprout,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import AddCropModal from "./AddCropModal";
import type { CropItem } from "./crop-types";
import ConfirmActionDialog from "@/components/ui/ConfirmActionDialog";

export type { CropItem } from "./crop-types";

export default function FarmerCropsPage({
  canAddCrop,
  canDeleteCrop,
}: {
  canAddCrop: boolean;
  canDeleteCrop: boolean;
}) {
  const [crops, setCrops] = useState<CropItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCropModal, setSelectedCropModal] = useState<CropItem | null>(null);
  const [cropPendingDelete, setCropPendingDelete] = useState<CropItem | null>(null);
  const [error, setError] = useState("");

  const fetchCrops = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/crops");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch crops.");
      if (!Array.isArray(data.crops)) throw new Error("The server returned an invalid crop list.");
      setCrops(data.crops.map((crop: Partial<CropItem>) => ({
        id: String(crop.id),
        name: String(crop.name),
        season: crop.season || "",
        category: crop.category || "",
        type: crop.type,
        ideal_ph_min: Number(crop.ideal_ph_min),
        ideal_ph_max: Number(crop.ideal_ph_max),
        water_requirement: crop.water_requirement || "",
        growth_days: Number(crop.growth_days),
        climate: crop.climate || "",
        companion_crops: crop.companion_crops || "",
        detail: crop.detail,
        soil: crop.soil,
      })));
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to fetch crops.");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchCrops();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchCrops]);

  const handleDeleteCrop = async (crop: CropItem) => {
    const response = await fetch("/api/crops", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: crop.id }),
    });
    const data: { error?: string } = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to remove crop.");
    setCrops((current) => current.filter((item) => item.id !== crop.id));
    if (selectedCropModal?.id === crop.id) setSelectedCropModal(null);
  };

  const categories = ["All", ...new Set(crops.map((crop) => crop.category).filter((category) => Boolean(category)))];
  const filteredCrops = crops.filter((c) => {
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      c.name.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query) ||
      (c.type && c.type.toLowerCase().includes(query)) ||
      (c.detail && c.detail.toLowerCase().includes(query)) ||
      c.climate.toLowerCase().includes(query);

    const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mx-auto w-full max-w-[1420px] space-y-6">
      {/* Header Panel */}
      <header className="flex flex-col justify-between gap-4 rounded-2xl bg-[#e4f4e5] p-7 sm:flex-row sm:items-center sm:p-9 shadow-sm border border-emerald-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-700/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#1e6350]">
              Farmer Management Portal
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#064b3b] sm:text-4xl">
            Crops Catalog & Management
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#45675e]">
            Register new crops, monitor agronomic growth parameters, ideal soil pH ranges, water requirements, and crop rotation guidelines.
          </p>
        </div>
        {canAddCrop && <button
          type="button"
          onClick={() => {
            setError("");
            setShowAddModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16875f] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#0c704d] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <Plus size={19} /> Add New Crop
        </button>}
      </header>

      {/* Summary KPI Strip */}
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e0f5eb] text-[#16875f]">
            <Sprout size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Registered Crops</p>
            <strong className="text-2xl font-bold text-[#123d35]">{crops.length} Variety Entries</strong>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eee6ff] text-[#815cc6]">
            <Flower2 size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Active Crop Categories</p>
            <strong className="text-2xl font-bold text-[#123d35]">
              {new Set(crops.map((c) => c.category)).size} Categories
            </strong>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e9edff] text-[#4f64c8]">
            <Sun size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Fastest Growth Cycle</p>
            <strong className="text-2xl font-bold text-[#123d35]">
              {crops.length > 0 ? Math.min(...crops.map((c) => c.growth_days)) : 45} Days
            </strong>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between border border-slate-100">
        <label className="flex h-11 flex-1 items-center gap-3 rounded-xl border border-slate-200 px-3.5 text-slate-400 focus-within:border-[#16875f]">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search crops by name, category, climate, or detail..."
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

      {/* Crops Cards Grid */}
      {filteredCrops.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <Sprout className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-lg font-bold text-slate-700">No available data</h3>
          <p className="mt-1 text-xs text-slate-500">
            {search ? `No results match your search "${search}"` : "Get started by adding your first crop profile."}
          </p>
          {canAddCrop && <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedCategory("All");
              setShowAddModal(true);
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#16875f] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c704d]"
          >
            <Plus size={16} /> Add Crop Now
          </button>}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCrops.map((crop) => (
            <article
              key={crop.id}
              className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition hover:shadow-md hover:border-emerald-200"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e0f5eb] text-[#16875f]">
                    <Sprout size={24} />
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
                    {crop.category}
                  </span>
                </div>

                <span className="mt-4 inline-block rounded-md bg-[#e8f2e3] px-2.5 py-0.5 text-xs font-bold text-[#2d5a27]">
                  🌱 {crop.type || crop.season}
                </span>

                <h2 className="mt-2 text-xl font-bold text-[#123d35]">{crop.name}</h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 line-clamp-3">
                  {crop.detail || "Cultivated variety managed in workspace field records."}
                </p>

                <div className="mt-4 rounded-xl bg-slate-50 p-3.5 text-xs space-y-1.5 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Growth Cycle:</span>
                    <strong className="text-slate-800">{crop.growth_days} Days</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ideal pH Range:</span>
                    <strong className="text-slate-800">
                      {crop.ideal_ph_min} – {crop.ideal_ph_max}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Water Need:</span>
                    <strong className="text-slate-800">{crop.water_requirement}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Climate Fit:</span>
                    <strong className="text-slate-800">{crop.climate}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedCropModal(crop)}
                  className="text-xs font-bold text-[#16875f] hover:underline"
                >
                  View full specifications →
                </button>
                {canDeleteCrop && <button
                  type="button"
                  onClick={() => setCropPendingDelete(crop)}
                  aria-label={`Delete ${crop.name}`}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                >
                  <Trash2 size={16} />
                </button>}
              </div>
            </article>
          ))}
        </div>
      )}

      {canAddCrop && showAddModal && (
        <AddCropModal
          onClose={() => setShowAddModal(false)}
          onCreated={(crop) => setCrops((current) => [crop, ...current])}
        />
      )}

      {/* Crop Details Modal */}
      {selectedCropModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Crop Details Modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 overflow-y-auto"
          onClick={() => setSelectedCropModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-2xl bg-white p-6 sm:p-7 shadow-2xl space-y-5"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="rounded-md bg-[#e8f2e3] px-2.5 py-1 text-xs font-bold text-[#2d5a27]">
                  🌱 {selectedCropModal.category} • {selectedCropModal.season}
                </span>
                <h2 className="mt-2 text-2xl font-bold text-[#123d35]">{selectedCropModal.name}</h2>
                {selectedCropModal.type && (
                  <p className="text-xs font-semibold text-[#16875f] mt-0.5">{selectedCropModal.type}</p>
                )}
                <ConfirmActionDialog
                  isOpen={cropPendingDelete !== null}
                  title="Remove crop from catalog?"
                  description={cropPendingDelete
                    ? `Remove "${cropPendingDelete.name}" from your catalog? This cannot be undone.`
                    : ""}
                  confirmLabel="Remove crop"
                  onClose={() => setCropPendingDelete(null)}
                  onConfirm={async () => {
                    if (cropPendingDelete) await handleDeleteCrop(cropPendingDelete);
                    setCropPendingDelete(null);
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setSelectedCropModal(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-600">
              <p className="text-sm text-slate-700">
                {selectedCropModal.detail || "Cultivated variety managed in workspace field records."}
              </p>

              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
                <div>
                  <strong className="block text-slate-800">Growth Duration:</strong>
                  {selectedCropModal.growth_days} Days
                </div>
                <div>
                  <strong className="block text-slate-800">Ideal pH Range:</strong>
                  {selectedCropModal.ideal_ph_min} – {selectedCropModal.ideal_ph_max}
                </div>
                <div>
                  <strong className="block text-slate-800">Water Requirement:</strong>
                  {selectedCropModal.water_requirement}
                </div>
                <div>
                  <strong className="block text-slate-800">Climate Zone:</strong>
                  {selectedCropModal.climate}
                </div>
                <div>
                  <strong className="block text-slate-800">Companion Plants:</strong>
                  {selectedCropModal.companion_crops}
                </div>
                <div>
                  <strong className="block text-slate-800">Soil Preference:</strong>
                  {selectedCropModal.soil || "Well-drained loamy soil"}
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedCropModal(null)}
                className="rounded-xl bg-[#16875f] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#0c704d]"
              >
                Close Specification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
