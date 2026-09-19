"use client";

import { Crop, Farm, Field } from "@/lib/db/repository";
import { CheckCircle2, Droplets, Layers, Leaf, MapPin, Plus, RefreshCw, Sprout } from "lucide-react";
import { useState } from "react";
import CropCycleToggle from "./CropCycleToggle";
import FieldFormModal from "./FieldFormModal";

interface FarmCardGridProps {
  initialFarms: Farm[];
  initialFields: Field[];
  crops: Crop[];
}

export default function FarmCardGrid({ initialFarms, initialFields, crops }: FarmCardGridProps) {
  const [farms, setFarms] = useState<Farm[]>(initialFarms);
  const [fields, setFields] = useState<Field[]>(initialFields);
  const [cycleFilter, setCycleFilter] = useState<"all" | "active" | "harvested">("all");
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [isFarmModalOpen, setIsFarmModalOpen] = useState(false);

  // New Farm form state
  const [farmName, setFarmName] = useState("");
  const [farmLocation, setFarmLocation] = useState("");
  const [farmSoilType, setFarmSoilType] = useState("Loam");
  const [farmArea, setFarmArea] = useState("");
  const [isSubmittingFarm, setIsSubmittingFarm] = useState(false);
  const [farmError, setFarmError] = useState("");

  const activeFields = fields.filter((f) => !f.is_harvested);
  const harvestedFields = fields.filter((f) => f.is_harvested);

  const displayedFields = fields.filter((f) => {
    if (cycleFilter === "active") return !f.is_harvested;
    if (cycleFilter === "harvested") return f.is_harvested;
    return true;
  });

  async function reloadData() {
    try {
      const [farmRes, fieldRes] = await Promise.all([fetch("/api/farms"), fetch("/api/fields")]);
      if (farmRes.ok && fieldRes.ok) {
        const farmData = await farmRes.json();
        const fieldData = await fieldRes.json();
        setFarms(farmData.farms);
        setFields(fieldData.fields);
      }
    } catch {
      // ignore
    }
  }

  async function handleAddFarm(e: React.FormEvent) {
    e.preventDefault();
    if (!farmName.trim() || !farmLocation.trim() || !farmArea || Number(farmArea) <= 0) {
      setFarmError("Fill in farm name, location, and valid total area.");
      return;
    }
    setFarmError("");
    setIsSubmittingFarm(true);

    try {
      const res = await fetch("/api/farms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: farmName.trim(),
          location: farmLocation.trim(),
          soil_type: farmSoilType,
          total_area: Number(farmArea),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add farm.");
      }
      setFarmName("");
      setFarmLocation("");
      setFarmArea("");
      setIsFarmModalOpen(false);
      await reloadData();
    } catch (err) {
      setFarmError((err as Error).message);
    } finally {
      setIsSubmittingFarm(false);
    }
  }

  async function handleToggleHarvest(fieldId: string) {
    try {
      const res = await fetch("/api/fields", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field_id: fieldId }),
      });
      if (res.ok) {
        await reloadData();
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-8">
      {/* Action Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CropCycleToggle
          filter={cycleFilter}
          onChange={setCycleFilter}
          activeCount={activeFields.length}
          harvestedCount={harvestedFields.length}
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsFarmModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            <Plus size={18} className="text-[#16875f]" />
            New Farm Parcel
          </button>
          <button
            type="button"
            onClick={() => setIsFieldModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#16875f] px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#064b3b]"
          >
            <Layers size={18} />
            Add Field Plot
          </button>
        </div>
      </div>

      {/* Farm Card Grid */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold tracking-tight text-[#123d35]">Registered Farm Parcels</h3>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {farms.map((farm) => {
            const farmFields = fields.filter((f) => f.farm_id === farm.id);
            return (
              <div key={farm.id} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e0f5eb] text-[#16875f]">
                    <Leaf size={24} />
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">
                    {farm.soil_type || "Loam Soil"}
                  </span>
                </div>

                <h4 className="mt-4 text-lg font-bold text-[#123d35]">{farm.name}</h4>
                <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
                  <MapPin size={14} className="text-[#16875f]" />
                  {farm.location}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                  <div>
                    <span className="block text-slate-400 font-medium">Total Area</span>
                    <strong className="text-base text-slate-800">{farm.total_area} ha</strong>
                  </div>
                  <div className="text-right">
                    <span className="block text-slate-400 font-medium">Field Plots</span>
                    <strong className="text-base text-[#16875f]">{farmFields.length} Registered</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Field Plot Grid / List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight text-[#123d35]">Field Plot Inventory & Crop Parameters</h3>
          <span className="text-xs font-semibold text-slate-500">Inputs fed to Decision Support</span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {displayedFields.map((field) => (
            <article key={field.id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-[#e4f4e5] px-2.5 py-1 text-xs font-extrabold text-[#16875f]">
                    {field.farm_name || "Registered Farm"}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                      field.is_harvested ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {field.is_harvested ? "Harvested" : "Active Growth"}
                  </span>
                </div>

                <h4 className="mt-3 text-lg font-bold text-[#123d35]">{field.name}</h4>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                  <Sprout size={15} className="text-[#16875f]" />
                  Crop: <strong className="font-semibold text-slate-800">{field.crop_name || "Unspecified"}</strong>
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs">
                  <div>
                    <span className="block text-slate-400">Area</span>
                    <strong className="text-slate-700">{field.area} ha</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400">Soil pH</span>
                    <strong className="text-slate-700">{field.soil_ph || 6.5} pH</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400">Organic Matter</span>
                    <strong className="text-slate-700">{field.organic_matter || 3.0}%</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400">Water Source</span>
                    <strong className="truncate text-[#16875f]">{field.water_source || "Rainfed"}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-[11px] text-slate-400">Planted: {field.planting_date}</span>
                <button
                  type="button"
                  onClick={() => handleToggleHarvest(field.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    field.is_harvested
                      ? "bg-emerald-50 text-[#16875f] hover:bg-emerald-100"
                      : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                  }`}
                >
                  {field.is_harvested ? <RefreshCw size={13} /> : <CheckCircle2 size={13} />}
                  {field.is_harvested ? "Re-activate" : "Mark Harvested"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Field Form Modal */}
      <FieldFormModal
        isOpen={isFieldModalOpen}
        farms={farms}
        crops={crops}
        onClose={() => setIsFieldModalOpen(false)}
        onSuccess={reloadData}
      />

      {/* Farm Form Modal */}
      {isFarmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-[#123d35]">Add New Farm Parcel</h3>
            <p className="mt-1 text-xs text-slate-500">Register land holdings to organize field plots.</p>

            {farmError && <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">{farmError}</div>}

            <form onSubmit={handleAddFarm} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600">Farm Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Green Valley Estate"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-[#16875f]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600">Location / Sector *</label>
                <input
                  type="text"
                  placeholder="e.g. Central Valley, Sector 4"
                  value={farmLocation}
                  onChange={(e) => setFarmLocation(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-[#16875f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600">Soil Type Tag</label>
                  <select
                    value={farmSoilType}
                    onChange={(e) => setFarmSoilType(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-2 py-2 text-xs font-semibold outline-none focus:border-[#16875f]"
                  >
                    <option value="Loam">Loam</option>
                    <option value="Clay Loam">Clay Loam</option>
                    <option value="Sandy Loam">Sandy Loam</option>
                    <option value="Silt Loam">Silt Loam</option>
                    <option value="Peat Soil">Peat Soil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600">Total Area (ha) *</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="12.5"
                    value={farmArea}
                    onChange={(e) => setFarmArea(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-[#16875f]"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFarmModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFarm}
                  className="rounded-xl bg-[#16875f] px-5 py-2 text-xs font-bold text-white hover:bg-[#064b3b]"
                >
                  {isSubmittingFarm ? "Creating..." : "Save Farm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
