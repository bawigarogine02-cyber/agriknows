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
  const [farmId, setFarmId] = useState(farms[0]?.id || "");
  const [isCustomFarm, setIsCustomFarm] = useState(false);
  const [customFarmName, setCustomFarmName] = useState("");
  const [customFarmLocation, setCustomFarmLocation] = useState("");

  const [name, setName] = useState("");
  const [area, setArea] = useState("");

  const [currentCropId, setCurrentCropId] = useState(crops[0]?.id || "");
  const [isCustomCrop, setIsCustomCrop] = useState(false);
  const [customCropName, setCustomCropName] = useState("");

  const [plantingDate, setPlantingDate] = useState(new Date().toISOString().split("T")[0]);
  const [soilPh, setSoilPh] = useState("6.5");
  const [organicMatter, setOrganicMatter] = useState("3.0");
  const [waterSource, setWaterSource] = useState("Drip Irrigation");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch farmer's live farms from API when modal opens
  useEffect(() => {
    if (isOpen) {
      fetch("/api/farms")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.farms && Array.isArray(data.farms)) {
            setFarmerFarms(data.farms);
            if (data.farms.length > 0 && !farmId) {
              setFarmId(data.farms[0].id);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let targetFarmId = farmId;

    // Handle inline custom farm creation
    if (isCustomFarm) {
      if (!customFarmName.trim() || !customFarmLocation.trim()) {
        setError("Please enter the new farm name and location.");
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
            total_area: Number(area) || 5.0
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

    if (!targetFarmId || !name.trim() || !area || Number(area) <= 0) {
      setError("Please fill out all required fields with valid measurements.");
      return;
    }

    const selectedCrop = crops.find(c => c.id === currentCropId);
    const finalCropName = isCustomCrop ? customCropName.trim() : (selectedCrop?.name || "Maize (Corn)");

    if (!finalCropName) {
      setError("Please select or type a valid crop name.");
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
          area: Number(area),
          current_crop_id: isCustomCrop ? null : currentCropId,
          crop_name: finalCropName,
          planting_date: plantingDate,
          soil_ph: Number(soilPh),
          organic_matter: Number(organicMatter),
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
      <div role="dialog" aria-modal="true" className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e0f5eb] text-[#16875f]">
              <Layers size={22} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#123d35]">Add New Field Plot</h2>
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
            <div className="flex items-center justify-between">
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
              <div className="flex items-center justify-between">
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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Planting Date</label>
              <input
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#16875f]"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Soil pH</label>
              <input
                type="number"
                step="0.1"
                min="4.0"
                max="9.0"
                value={soilPh}
                onChange={(e) => setSoilPh(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#16875f]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Organic Matter (%)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="15.0"
                value={organicMatter}
                onChange={(e) => setOrganicMatter(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#16875f]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Water Source</label>
              <select
                value={waterSource}
                onChange={(e) => setWaterSource(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-[#16875f]"
              >
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
