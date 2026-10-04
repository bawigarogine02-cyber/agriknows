"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Check,
  Droplets,
  Filter,
  Flower2,
  Info,
  Leaf,
  Plus,
  Search,
  Sprout,
  Sun,
  Thermometer,
  Trash2,
  X,
} from "lucide-react";

export type CropItem = {
  id: string;
  name: string;
  season: string;
  category: string;
  type?: string;
  ideal_ph_min: number;
  ideal_ph_max: number;
  water_requirement: string;
  growth_days: number;
  climate: string;
  companion_crops: string;
  detail?: string;
  soil?: string;
};

const defaultSeedCrops: CropItem[] = [
  {
    id: "c-1",
    name: "Maize (Corn)",
    season: "Wet Season",
    category: "Cereals",
    type: "Heavy-Feeder Cereal",
    ideal_ph_min: 5.8,
    ideal_ph_max: 7.0,
    water_requirement: "500 - 800 mm",
    growth_days: 110,
    climate: "Warm Subtropical / Tropical",
    companion_crops: "Beans, Squash, Cowpeas",
    detail: "Deep fertile loamy soil crop. Highly effective in crop rotation following nitrogen-fixing legumes.",
    soil: "Nitrogen-rich deep loam",
  },
  {
    id: "c-2",
    name: "Rice (Paddy)",
    season: "Wet Season",
    category: "Cereals",
    type: "Aquatic Cereal Grain",
    ideal_ph_min: 5.5,
    ideal_ph_max: 6.8,
    water_requirement: "1200 - 1600 mm",
    growth_days: 130,
    climate: "Humid Tropical",
    companion_crops: "Duckweed, Azolla, Fish co-culture",
    detail: "Thrives in clay or heavy loam soils capable of holding standing water layers.",
    soil: "Clay loam with high water retention",
  },
  {
    id: "c-3",
    name: "Bush Green Beans (Phaseolus vulgaris)",
    season: "Wet Season",
    category: "Legumes",
    type: "Compact Bush Legume",
    ideal_ph_min: 6.0,
    ideal_ph_max: 6.8,
    water_requirement: "400 - 600 mm",
    growth_days: 55,
    climate: "Warm Temperate / Tropical",
    companion_crops: "Corn, Cucumber, Carrots",
    detail: "Self-supporting 45-60 day bush bean. Thrives in loose well-drained loam and enriches soil nitrogen.",
    soil: "Loose loamy soil (pH 6.0–6.8)",
  },
  {
    id: "c-4",
    name: "Yardlong / Pole Beans (Sitaw)",
    season: "Year-Round",
    category: "Legumes",
    type: "Climbing Vertical Legume",
    ideal_ph_min: 5.8,
    ideal_ph_max: 6.8,
    water_requirement: "450 - 650 mm",
    growth_days: 60,
    climate: "Hot Subtropical",
    companion_crops: "Corn, Radish, Eggplant",
    detail: "High-yield vertical climber for bamboo trellises. Excellent for heat tolerance and vertical land use.",
    soil: "Fertile organic-rich soil",
  },
  {
    id: "c-5",
    name: "Soybean (Glycine max)",
    season: "Wet Season",
    category: "Legumes",
    type: "High-Protein Grain Legume",
    ideal_ph_min: 6.0,
    ideal_ph_max: 7.0,
    water_requirement: "450 - 700 mm",
    growth_days: 100,
    climate: "Warm Temperate / Tropical",
    companion_crops: "Corn, Sorghum",
    detail: "Requires deep, moist fertile loam. Restores depleted land nitrogen for future cereal seasons.",
    soil: "Deep fertile clay-loam",
  },
  {
    id: "c-6",
    name: "Tomato (Solanum lycopersicum)",
    season: "Dry Season",
    category: "Solanaceous",
    type: "Nightshade Fruit Crop",
    ideal_ph_min: 6.0,
    ideal_ph_max: 6.8,
    water_requirement: "400 - 600 mm",
    growth_days: 85,
    climate: "Warm Subtropical",
    companion_crops: "Basil, Marigold, Onions",
    detail: "Requires raised beds with deep organic compost and staking for optimal airflow and disease prevention.",
    soil: "Compost-enriched raised beds",
  },
];

const CATEGORIES = ["All", "Legumes", "Cereals", "Solanaceous", "Root Crops", "Cover Crops", "Vegetables"];

export default function FarmerCropsPage() {
  const [crops, setCrops] = useState<CropItem[]>(defaultSeedCrops);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCropModal, setSelectedCropModal] = useState<CropItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // New crop form state
  const [form, setForm] = useState({
    name: "",
    season: "Wet Season",
    category: "Legumes",
    type: "Agricultural Variety",
    growth_days: 90,
    ideal_ph_min: 6.0,
    ideal_ph_max: 7.5,
    water_requirement: "400 - 600 mm",
    climate: "Warm Subtropical",
    companion_crops: "Legumes, Basil",
    detail: "",
    soil: "Well-drained loamy soil",
  });

  // Fetch crops on mount
  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      const res = await fetch("/api/crops");
      const data = await res.json();
      if (data.crops && Array.isArray(data.crops) && data.crops.length > 0) {
        const fetchedCrops: CropItem[] = data.crops.map((c: Partial<CropItem>) => ({
          id: String(c.id || Date.now()),
          name: c.name || "Unnamed Crop",
          season: c.season || "Wet Season",
          category: c.category || "Legumes",
          type: c.type || "Agricultural Variety",
          ideal_ph_min: Number(c.ideal_ph_min || 6.0),
          ideal_ph_max: Number(c.ideal_ph_max || 7.5),
          water_requirement: c.water_requirement || "400 - 600 mm",
          growth_days: Number(c.growth_days || 90),
          climate: c.climate || "Warm Subtropical",
          companion_crops: c.companion_crops || "Legumes, Herbs",
          detail: c.detail || "Cultivated variety managed in workspace field records.",
          soil: c.soil || "Well-drained loamy soil",
        }));

        setCrops((existing) => {
          const existingNames = new Set(existing.map((item) => item.name.toLowerCase()));
          const newUnique = fetchedCrops.filter((item) => !existingNames.has(item.name.toLowerCase()));
          return [...newUnique, ...existing];
        });
      }
    } catch {
      // fallback to initial state
    }
  };

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Please enter a crop name.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMsg("");

    const payload = {
      name: form.name.trim(),
      season: form.season.trim(),
      category: form.category,
      type: form.type.trim(),
      growth_days: Number(form.growth_days) || 90,
      ideal_ph_min: Number(form.ideal_ph_min) || 6.0,
      ideal_ph_max: Number(form.ideal_ph_max) || 7.5,
      water_requirement: form.water_requirement.trim(),
      climate: form.climate.trim(),
      companion_crops: form.companion_crops.trim(),
      detail: form.detail.trim() || `Cultivated ${form.category.toLowerCase()} variety managed in workspace field records.`,
      soil: form.soil.trim(),
    };

    try {
      const response = await fetch("/api/crops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to add crop.");
        setIsSubmitting(false);
        return;
      }

      const createdCrop: CropItem = {
        id: String(data.crop?.id || `c-${Date.now()}`),
        ...payload,
      };

      setCrops((prev) => [createdCrop, ...prev]);
      setSuccessMsg(`Successfully added "${createdCrop.name}" to your crop catalog!`);

      setForm({
        name: "",
        season: "Wet Season",
        category: "Legumes",
        type: "Agricultural Variety",
        growth_days: 90,
        ideal_ph_min: 6.0,
        ideal_ph_max: 7.5,
        water_requirement: "400 - 600 mm",
        climate: "Warm Subtropical",
        companion_crops: "Legumes, Basil",
        detail: "",
        soil: "Well-drained loamy soil",
      });

      setTimeout(() => {
        setShowAddModal(false);
        setSuccessMsg("");
      }, 1200);
    } catch {
      setError("Network error while adding crop.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCrop = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from your catalog?`)) return;
    setCrops((prev) => prev.filter((c) => c.id !== id));
    if (selectedCropModal?.id === id) setSelectedCropModal(null);
  };

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
        <button
          type="button"
          onClick={() => {
            setError("");
            setSuccessMsg("");
            setShowAddModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16875f] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#0c704d] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <Plus size={19} /> Add New Crop
        </button>
      </header>

      {/* Summary KPI Strip */}
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
          {CATEGORIES.map((cat) => (
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
          <h3 className="mt-3 text-lg font-bold text-slate-700">No crops found</h3>
          <p className="mt-1 text-xs text-slate-500">
            {search ? `No results match your search "${search}"` : "Get started by adding your first crop profile."}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedCategory("All");
              setShowAddModal(true);
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#16875f] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c704d]"
          >
            <Plus size={16} /> Add Crop Now
          </button>
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
                <button
                  type="button"
                  onClick={() => handleDeleteCrop(crop.id, crop.name)}
                  aria-label={`Delete ${crop.name}`}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Add Crop Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add New Crop Modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 overflow-y-auto"
          onClick={() => setShowAddModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="my-8 w-full max-w-xl rounded-2xl bg-white p-6 sm:p-7 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-[#123d35] flex items-center gap-2">
                <Sprout className="text-[#16875f]" size={24} /> Add New Crop Entry
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
                ⚠️ {error}
              </div>
            )}

            {successMsg && (
              <div className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-200">
                ✅ {successMsg}
              </div>
            )}

            <form onSubmit={handleAddCrop} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700">Crop Name & Species *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Bush Green Beans (Phaseolus vulgaris)"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                  >
                    <option value="Legumes">Legumes</option>
                    <option value="Cereals">Cereals</option>
                    <option value="Solanaceous">Solanaceous</option>
                    <option value="Root Crops">Root Crops</option>
                    <option value="Cover Crops">Cover Crops</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700">Variety / Type</label>
                  <input
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    placeholder="e.g. Compact Bush Legume"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">Season</label>
                  <select
                    value={form.season}
                    onChange={(e) => setForm({ ...form, season: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                  >
                    <option value="Wet Season">Wet Season</option>
                    <option value="Dry Season">Dry Season</option>
                    <option value="Year-Round">Year-Round</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700">Growth Days</label>
                  <input
                    type="number"
                    min={10}
                    max={365}
                    value={form.growth_days}
                    onChange={(e) => setForm({ ...form, growth_days: Number(e.target.value) || 90 })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700">Water Needs</label>
                  <input
                    value={form.water_requirement}
                    onChange={(e) => setForm({ ...form, water_requirement: e.target.value })}
                    placeholder="e.g. 400 - 600 mm"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">Ideal pH Min</label>
                  <input
                    type="number"
                    step="0.1"
                    min={4.0}
                    max={9.0}
                    value={form.ideal_ph_min}
                    onChange={(e) => setForm({ ...form, ideal_ph_min: Number(e.target.value) || 6.0 })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700">Ideal pH Max</label>
                  <input
                    type="number"
                    step="0.1"
                    min={4.0}
                    max={9.0}
                    value={form.ideal_ph_max}
                    onChange={(e) => setForm({ ...form, ideal_ph_max: Number(e.target.value) || 7.5 })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">Climate Zone</label>
                  <input
                    value={form.climate}
                    onChange={(e) => setForm({ ...form, climate: e.target.value })}
                    placeholder="e.g. Warm Subtropical"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700">Companion Crops</label>
                  <input
                    value={form.companion_crops}
                    onChange={(e) => setForm({ ...form, companion_crops: e.target.value })}
                    placeholder="e.g. Legumes, Basil, Squash"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Agronomic Description & Field Notes</label>
                <textarea
                  rows={3}
                  value={form.detail}
                  onChange={(e) => setForm({ ...form, detail: e.target.value })}
                  placeholder="Growing characteristics, soil preference, drainage needs, nitrogen fixation notes..."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#16875f] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#0c704d] disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Crop Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
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
