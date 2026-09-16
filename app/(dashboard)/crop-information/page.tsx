"use client";

import { useState } from "react";
import {
  Check,
  ExternalLink,
  Filter,
  Flower2,
  Info,
  Leaf,
  Plus,
  Search,
  Sprout,
  Trash2,
  X,
} from "lucide-react";

type CropItem = {
  id: string;
  name: string;
  type: string;
  category: "Legumes" | "Solanaceous" | "Cereals" | "Cover Crops" | "Vegetables";
  stage: string;
  daysGrowing: number;
  health: "Healthy" | "Attention" | "Harvest Ready";
  detail: string;
  soil: string;
  temp: string;
  sun: string;
};

const initialCrops: CropItem[] = [
  {
    id: "1",
    name: "Bush Green Beans (Phaseolus vulgaris)",
    type: "Compact Bush Legume",
    category: "Legumes",
    stage: "Growing",
    daysGrowing: 45,
    health: "Healthy",
    detail: "Self-supporting 45-60 day bush bean. Thrives in loose well-drained loam and enriches soil nitrogen.",
    soil: "Loose loamy soil (pH 6.0–6.8)",
    temp: "18°C – 28°C",
    sun: "Full sun",
  },
  {
    id: "2",
    name: "Yardlong / Pole Beans (Sitaw)",
    type: "Climbing Vertical Legume",
    category: "Legumes",
    stage: "Flowering",
    daysGrowing: 52,
    health: "Healthy",
    detail: "High-yield vertical climber for bamboo trellises. Excellent for heat tolerance and vertical land use.",
    soil: "Fertile organic-rich soil",
    temp: "20°C – 32°C",
    sun: "Full sun",
  },
  {
    id: "3",
    name: "Cowpeas & Black-Eyed Peas",
    type: "Drought-Tolerant Tropical Legume",
    category: "Cover Crops",
    stage: "Established",
    daysGrowing: 38,
    health: "Healthy",
    detail: "Adapts to poor, sandy, or dry soil where other crops fail. Superior green manure cover crop.",
    soil: "Sandy or depleted soil",
    temp: "20°C – 35°C",
    sun: "Full sun",
  },
  {
    id: "4",
    name: "Mung Beans (Mungo)",
    type: "Fast 60-Day Short-Cycle Legume",
    category: "Legumes",
    stage: "Harvest Ready",
    daysGrowing: 58,
    health: "Harvest Ready",
    detail: "Ultra-fast crop cycle requiring minimal irrigation; ideal post-harvest rotation for dry land.",
    soil: "Loose well-drained loam",
    temp: "20°C – 34°C",
    sun: "Full sun",
  },
  {
    id: "5",
    name: "Soybeans (Glycine max)",
    type: "High-Protein Grain Legume",
    category: "Legumes",
    stage: "Growing",
    daysGrowing: 40,
    health: "Healthy",
    detail: "Requires deep, moist fertile loam. Restores depleted land nitrogen for future cereal seasons.",
    soil: "Deep fertile clay-loam",
    temp: "18°C – 32°C",
    sun: "Full sun",
  },
  {
    id: "6",
    name: "Tomato - Roma & Cherry",
    type: "Solanaceous Nightshade Fruit",
    category: "Solanaceous",
    stage: "Fruiting",
    daysGrowing: 65,
    health: "Attention",
    detail: "Requires raised beds with deep organic compost (pH 6.0-6.8) and staking for airflow.",
    soil: "Compost-enriched raised beds",
    temp: "18°C – 30°C",
    sun: "Full sun",
  },
  {
    id: "7",
    name: "Sweet Corn & Field Maize",
    type: "Heavy-Feeder Cereal Stalk",
    category: "Cereals",
    stage: "Tasseling",
    daysGrowing: 60,
    health: "Healthy",
    detail: "Deep fertile loamy soil crop. Highly effective in rotation following nitrogen-fixing bean land.",
    soil: "Nitrogen-rich deep loam",
    temp: "18°C – 32°C",
    sun: "Full sun",
  },
];

export default function CropInformationPage() {
  const [crops, setCrops] = useState<CropItem[]>(initialCrops);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCropModal, setSelectedCropModal] = useState<CropItem | null>(null);

  // New crop form state
  const [newCrop, setNewCrop] = useState({
    name: "",
    type: "",
    category: "Legumes" as CropItem["category"],
    stage: "Planting / Seedling",
    daysGrowing: 1,
    detail: "",
    soil: "Well-drained loamy soil",
    temp: "20°C – 30°C",
    sun: "Full sun",
  });

  const categories = ["All", "Legumes", "Solanaceous", "Cereals", "Cover Crops"];

  const filteredCrops = crops.filter((crop) => {
    const matchesSearch =
      crop.name.toLowerCase().includes(search.toLowerCase()) ||
      crop.type.toLowerCase().includes(search.toLowerCase()) ||
      crop.detail.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || crop.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrop.name.trim()) return;
    const item: CropItem = {
      id: String(Date.now()),
      name: newCrop.name.trim(),
      type: newCrop.type.trim() || "Agricultural Variety",
      category: newCrop.category,
      stage: newCrop.stage,
      daysGrowing: Number(newCrop.daysGrowing) || 1,
      health: "Healthy",
      detail: newCrop.detail.trim() || "Cultivated variety managed in workspace field records.",
      soil: newCrop.soil,
      temp: newCrop.temp,
      sun: newCrop.sun,
    };
    setCrops([item, ...crops]);
    setNewCrop({
      name: "",
      type: "",
      category: "Legumes",
      stage: "Planting / Seedling",
      daysGrowing: 1,
      detail: "",
      soil: "Well-drained loamy soil",
      temp: "20°C – 30°C",
      sun: "Full sun",
    });
    setShowAddModal(false);
  };

  const deleteCrop = (id: string) => {
    if (!confirm("Remove this crop from your library?")) return;
    setCrops((prev) => prev.filter((c) => c.id !== id));
    if (selectedCropModal?.id === id) setSelectedCropModal(null);
  };

  return (
    <section className="mx-auto w-full max-w-[1420px] space-y-6">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 rounded-2xl bg-[#e4f4e5] p-7 sm:flex-row sm:items-end sm:p-9 shadow-sm">
        <div>
          <p className="text-[10px] font-bold tracking-[1.5px] text-[#27715d] uppercase">CROP KNOWLEDGE BASE</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#064b3b] sm:text-4xl">Your Crop Library</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#45675e]">
            Keep crop profiles, growing requirements, land suitability notes, and field guides in one place.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#16875f] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#0c704d]"
        >
          <Plus size={18} /> Add Crop
        </button>
      </header>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between border border-slate-100">
        <label className="flex h-11 flex-1 items-center gap-3 rounded-xl border border-slate-200 px-3.5 text-slate-400 focus-within:border-[#16875f]">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search crops, species, or land fit..."
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

      {/* Crop Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCrops.map((crop) => (
          <article
            key={crop.id}
            className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition hover:shadow-md hover:border-emerald-200"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e0f5eb] text-[#288b69]">
                  <Flower2 size={24} />
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                    crop.health === "Healthy"
                      ? "bg-emerald-100 text-emerald-800"
                      : crop.health === "Harvest Ready"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {crop.health}
                </span>
              </div>

              <span className="mt-4 inline-block rounded-md bg-[#e8f2e3] px-2.5 py-0.5 text-xs font-bold text-[#2d5a27]">
                🌱 {crop.type}
              </span>

              <h2 className="mt-2 text-lg font-bold text-[#123d35]">{crop.name}</h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 line-clamp-3">{crop.detail}</p>

              <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs space-y-1 text-slate-600">
                <p><strong>Soil:</strong> {crop.soil}</p>
                <p><strong>Temp:</strong> {crop.temp}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedCropModal(crop)}
                className="text-xs font-bold text-[#18765b] hover:underline"
              >
                View crop details →
              </button>
              <button
                type="button"
                onClick={() => deleteCrop(crop.id)}
                aria-label={`Delete ${crop.name}`}
                className="p-1.5 text-slate-400 hover:text-rose-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Add Crop Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add Crop Modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-[#123d35] flex items-center gap-2">
                <Sprout className="text-[#16875f]" size={22} /> Add New Crop Profile
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCrop} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700">Crop Name & Species *</label>
                <input
                  required
                  value={newCrop.name}
                  onChange={(e) => setNewCrop({ ...newCrop, name: e.target.value })}
                  placeholder="e.g. Bush Green Beans (Phaseolus vulgaris)"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">Plant Variety / Type</label>
                  <input
                    value={newCrop.type}
                    onChange={(e) => setNewCrop({ ...newCrop, type: e.target.value })}
                    placeholder="e.g. Compact Bush Legume"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700">Category</label>
                  <select
                    value={newCrop.category}
                    onChange={(e) => setNewCrop({ ...newCrop, category: e.target.value as CropItem["category"] })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                  >
                    <option value="Legumes">Legumes</option>
                    <option value="Solanaceous">Solanaceous</option>
                    <option value="Cereals">Cereals</option>
                    <option value="Cover Crops">Cover Crops</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Agronomic & Soil Notes</label>
                <textarea
                  rows={3}
                  value={newCrop.detail}
                  onChange={(e) => setNewCrop({ ...newCrop, detail: e.target.value })}
                  placeholder="Growing characteristics, soil preference, drainage needs..."
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
                  className="rounded-xl bg-[#16875f] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0c704d]"
                >
                  Save Crop Profile
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setSelectedCropModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="rounded-md bg-[#e8f2e3] px-2.5 py-1 text-xs font-bold text-[#2d5a27]">
                  🌱 {selectedCropModal.type}
                </span>
                <h2 className="mt-2 text-2xl font-bold text-[#123d35]">{selectedCropModal.name}</h2>
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
              <p className="text-sm text-slate-700">{selectedCropModal.detail}</p>

              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
                <div>
                  <strong className="block text-slate-800">Ideal Temperature:</strong>
                  {selectedCropModal.temp}
                </div>
                <div>
                  <strong className="block text-slate-800">Sunlight Needs:</strong>
                  {selectedCropModal.sun}
                </div>
                <div>
                  <strong className="block text-slate-800">Soil Requirement:</strong>
                  {selectedCropModal.soil}
                </div>
                <div>
                  <strong className="block text-slate-800">Category:</strong>
                  {selectedCropModal.category}
                </div>
              </div>

              <div className="rounded-xl border border-[#d6e5d3] bg-[#f2f7f0] p-4 text-[#2d4d2b]">
                <strong>🌾 Agronomic Fit:</strong> Legumes fix atmospheric nitrogen in soil root nodules, reducing synthetic fertilizer requirements for subsequent crop rotations.
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedCropModal(null)}
                className="rounded-xl bg-[#16875f] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#0c704d]"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}