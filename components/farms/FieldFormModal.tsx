"use client";

import { Crop, Farm } from "@/lib/db/repository";
import { Layers, Sprout, X } from "lucide-react";
import { useEffect, useState } from "react";

interface FieldFormModalProps {
  isOpen: boolean;
  farms: Farm[];
  crops: Crop[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function FieldFormModal({ isOpen, farms, crops, onClose, onSuccess }: FieldFormModalProps) {
  const [farmerFarms, setFarmerFarms] = useState<Farm[]>(farms);
  const [farmId, setFarmId] = useState("");
  const [isCustomFarm, setIsCustomFarm] = useState(false);
  const [customFarmName, setCustomFarmName] = useState("");
  const [customFarmLocation, setCustomFarmLocation] = useState("");
  const [customFarmArea, setCustomFarmArea] = useState("");

  const [name, setName] = useState("");
  const [area, setArea] = useState("");

  const [currentCropId, setCurrentCropId] = useState("");
  const [isCustomCrop, setIsCustomCrop] = useState(false);
  const [customCropName, setCustomCropName] = useState("");

  const [plantingDate, setPlantingDate] = useState(new Date().toISOString().split("T")[0]);
  const [soilPh, setSoilPh] = useState("");
  const [organicMatter, setOrganicMatter] = useState("");
  const [waterSource, setWaterSource] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch farmer's live farms from API when modal opens
  useEffect(() => {
    if (isOpen) {
      fetch("/api/farms")
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to load your farms.");
          return data;
        })
        .then((data) => {
          if (data?.farms && Array.isArray(data.farms)) {
            setFarmerFarms(data.farms);
          }
        })
        .catch((fetchError: unknown) => {
          setError(fetchError instanceof Error ? fetchError.message : "Failed to load your farms.");
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const fieldArea = Number(area);
    const pHValue = Number(soilPh);
    const organicMatterValue = Number(organicMatter);
    if (!name.trim() || !Number.isFinite(fieldArea) || fieldArea <= 0) {
      setError("Enter a field name and a positive field area.");
      return;
    }
    if (!Number.isFinite(pHValue) || pHValue < 0 || pHValue > 14) {
      setError("Enter a valid soil pH between 0 and 14.");
      return;
    }
    if (!Number.isFinite(organicMatterValue) || organicMatterValue < 0 || organicMatterValue > 100) {
      setError("Enter a valid organic matter percentage between 0 and 100.");
      return;
    }
    if (!waterSource) {
      setError("Select the field's water source.");
      return;
    }
    if (!plantingDate || Number.isNaN(Date.parse(plantingDate))) {
      setError("Enter a valid planting date.");
      return;
    }

    const selectedCrop = crops.find((crop) => crop.id === currentCropId);
    const finalCropName = isCustomCrop ? customCropName.trim() : selectedCrop?.name || "";
    if (!finalCropName) {
      setError("Please select or type a valid crop name.");
      return;
    }

    let targetFarmId = farmId;

    // Handle inline custom farm creation
    if (isCustomFarm) {
      const farmArea = Number(customFarmArea);
      if (!customFarmName.trim() || !customFarmLocation.trim() || !Number.isFinite(farmArea) || farmArea <= 0) {
        setError("Enter the new farm name, location, and positive total area.");
        return;
      }
      if (fieldArea > farmArea) {
        setError("Field area cannot exceed the new farm's total area.");
        return;
      }
      try {
        const farmRes = await fetch("/api/farms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: customFarmName.trim(),
            location: customFarmLocation.trim(),
            soil_type: "Loam",
            total_area: farmArea
          })
        });
        if (!farmRes.ok) {
          const farmData = await farmRes.json();
          throw new Error(farmData.error || "Failed to create farm parcel.");
        }
        const farmResult = await farmRes.json();
        targetFarmId = farmResult.farm.id;
      } catch (err) {
        setError((err as Error).message);
        return;
      }
    }

    if (!targetFarmId) {
      setError("Select an existing farm or add a new farm parcel.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farm_id: targetFarmId,
          name: name.trim(),
          area: fieldArea,
          current_crop_id: isCustomCrop ? null : currentCropId,
          crop_name: finalCropName,
          planting_date: plantingDate,
          soil_ph: pHValue,
          organic_matter: organicMatterValue,
          water_source: waterSource
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save field parcel.");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="field-form-title"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e0f5eb] text-[#16875f]">
              <Layers size={22} />
            </div>
            <div>
              <h2 id="field-form-title" className="text-xl font-extrabold text-[#123d35]">Add New Field Plot</h2>
              <p className="text-xs text-slate-500">Register land inputs for the Decision Support Engine.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        {error && <div className="mt-4 rounded-xl bg-[#fff5ef] p-3 text-sm text-[#9a3c20]">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Parent Farm Parcel */}
          <div>
            <div className="flex min-h-10 items-start justify-between gap-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Parent Farm Parcel *</label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomFarm(!isCustomFarm);
                  if (!isCustomFarm) {
                    setCustomFarmName("");
                    setCustomFarmLocation("");
                  }
                }}
                className="text-xs font-bold text-[#16875f] hover:underline"
              >
                {isCustomFarm ? "← Choose existing farm" : "+ Add new farm parcel"}
              </button>
            </div>

            {isCustomFarm ? (
              <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Farm Name (e.g. My Riverfront Farm)"
                  value={customFarmName}
                  onChange={(e) => setCustomFarmName(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#16875f]"
                />
                <input
                  type="text"
                  placeholder="Location (e.g. Sector 2, Talisay)"
                  value={customFarmLocation}
                  onChange={(e) => setCustomFarmLocation(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#16875f]"
                />
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Farm total area (hectares)"
                  value={customFarmArea}
                  onChange={(e) => setCustomFarmArea(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#16875f]"
                />
              </div>
            ) : (
              <select
                value={farmId}
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setIsCustomFarm(true);
                  } else {
                    setFarmId(e.target.value);
                  }
                }}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-[#16875f] focus:bg-white"
              >
                <option value="" disabled>Select a farm</option>
                {farmerFarms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.location})
                  </option>
                ))}
                <option value="__custom__">+ Register new farm parcel...</option>
              </select>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Field / Plot Name *</label>
              <input
                type="text"
                placeholder="e.g. North Maize Plot"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#16875f]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Area (Hectares) *</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 4.5"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#16875f]"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="flex min-h-10 items-start justify-between gap-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Current Crop</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomCrop(!isCustomCrop);
                    if (!isCustomCrop) setCustomCropName("");
                  }}
                  className="text-xs font-bold text-[#16875f] hover:underline"
                >
                  {isCustomCrop ? "← Select from list" : "+ Input new crop"}
                </button>
              </div>

              {isCustomCrop ? (
                <input
                  type="text"
                  placeholder="Type new crop name (e.g. Bush Green Beans)"
                  value={customCropName}
                  onChange={(e) => setCustomCropName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-[#16875f]"
                />
              ) : (
                <select
                  value={currentCropId}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      setIsCustomCrop(true);
                    } else {
                      setCurrentCropId(e.target.value);
                    }
                  }}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-[#16875f]"
                >
                  <option value="" disabled>Select a crop</option>
                  {crops.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                  <option value="__custom__">+ Input new crop...</option>
                </select>
              )}
            </div>

            <div>
              <div className="min-h-10">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Planting Date</label>
              </div>
              <input
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#16875f]"
              />
            </div>
          </div>

          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <div className="mb-1.5 min-h-10">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Soil pH *</label>
                <p className="text-xs text-slate-500">Test or estimate</p>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                max="14"
                required
                value={soilPh}
                onChange={(e) => setSoilPh(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#16875f]"
              />
            </div>
            <div className="min-w-0">
              <div className="mb-1.5 min-h-10">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Organic Matter (%) *</label>
                <p className="text-xs text-slate-500">Test or estimate</p>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                required
                value={organicMatter}
                onChange={(e) => setOrganicMatter(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#16875f]"
              />
            </div>
            <div className="min-w-0">
              <div className="mb-1.5 min-h-10">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Water Source *</label>
                <p className="text-xs text-slate-500">Select the primary source</p>
              </div>
              <select
                required
                value={waterSource}
                onChange={(e) => setWaterSource(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-[#16875f]"
              >
                <option value="" disabled>Select water source</option>
                <option value="Rainfed">Rainfed</option>
                <option value="Drip Irrigation">Drip Irrigation</option>
                <option value="Canal System">Canal System</option>
                <option value="Borehole / Well">Borehole / Well</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#16875f] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#064b3b] disabled:opacity-50"
            >
              <Sprout size={18} />
              {isSubmitting ? "Saving..." : "Register Field"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
