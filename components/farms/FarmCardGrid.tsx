"use client";

import { Crop, Farm, Field } from "@/lib/db/repository";
import { CheckCircle2, Layers, Leaf, MapPin, Pencil, Plus, RefreshCw, Sprout, Trash2 } from "lucide-react";
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
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [fieldEdit, setFieldEdit] = useState({ name: "", area: "", crop_name: "", planting_date: "", soil_ph: "", organic_matter: "", water_source: "" });
  const [fieldError, setFieldError] = useState("");
  const [actionError, setActionError] = useState("");

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
      const [farmData, fieldData] = await Promise.all([farmRes.json(), fieldRes.json()]);
      if (!farmRes.ok || !fieldRes.ok) {
        throw new Error(farmData.error || fieldData.error || "Unable to refresh farm and field records.");
      }
      setFarms(farmData.farms);
      setFields(fieldData.fields);
      setActionError("");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to refresh farm and field records.");
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
        method: editingFarm ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingFarm ? { id: editingFarm.id } : {}),
          name: farmName.trim(),
          location: farmLocation.trim(),
          soil_type: farmSoilType,
          total_area: Number(farmArea),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save farm.");
      setFarmName("");
      setFarmLocation("");
      setFarmArea("");
      setEditingFarm(null);
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to update harvest status.");
      await reloadData();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to update harvest status.");
    }
  }

  async function handleDeleteFarm(farm: Farm) {
    if (!window.confirm(`Delete "${farm.name}" and all of its field plots? Related recommendation history will be retained without its field link.`)) return;
    try {
      const response = await fetch("/api/farms", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: farm.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to delete farm.");
      await reloadData();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to delete farm.");
    }
  }

  async function handleDeleteField(field: Field) {
    if (!window.confirm(`Delete field plot "${field.name}"? Related recommendation history will be retained without its field link.`)) return;
    try {
      const response = await fetch("/api/fields", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field_id: field.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to delete field plot.");
      await reloadData();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to delete field plot.");
    }
  }

  async function handleUpdateField(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingField) return;
    setFieldError("");
    const crop = crops.find((item) => item.name.toLowerCase() === fieldEdit.crop_name.trim().toLowerCase());
    try {
      const response = await fetch("/api/fields", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field_id: editingField.id,
          name: fieldEdit.name,
          area: Number(fieldEdit.area),
          current_crop_id: crop?.id || null,
          crop_name: fieldEdit.crop_name,
          planting_date: fieldEdit.planting_date,
          soil_ph: Number(fieldEdit.soil_ph),
          organic_matter: Number(fieldEdit.organic_matter),
          water_source: fieldEdit.water_source,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update field plot.");
      setEditingField(null);
      await reloadData();
    } catch (error) {
      setFieldError(error instanceof Error ? error.message : "Unable to update field plot.");
    }
  }

  return (
    <div className="space-y-8">
      {actionError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{actionError}</p>}
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
            onClick={() => {
              setEditingFarm(null);
              setFarmName("");
              setFarmLocation("");
              setFarmArea("");
              setFarmError("");
              setIsFarmModalOpen(true);
            }}
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
                  <div className="flex items-center gap-1">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">
                      {farm.soil_type || "Loam Soil"}
                    </span>
                    <button type="button" aria-label={`Edit ${farm.name}`} onClick={() => {
                      setEditingFarm(farm);
                      setFarmName(farm.name);
                      setFarmLocation(farm.location);
                      setFarmSoilType(farm.soil_type || "Loam");
                      setFarmArea(String(farm.total_area));
                      setFarmError("");
                      setIsFarmModalOpen(true);
                    }} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Pencil size={15} /></button>
                    <button type="button" aria-label={`Delete ${farm.name}`} onClick={() => void handleDeleteFarm(farm)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"><Trash2 size={15} /></button>
                  </div>
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
                    {field.farm_name || "—"}
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
                    <strong className="text-slate-700">{field.soil_ph} pH</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400">Organic Matter</span>
                    <strong className="text-slate-700">{field.organic_matter}%</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400">Water Source</span>
                    <strong className="truncate text-[#16875f]">{field.water_source}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-[11px] text-slate-400">Planted: {field.planting_date}</span>
                <div className="flex flex-wrap justify-end gap-2">
                  <button type="button" aria-label={`Edit ${field.name}`} onClick={() => {
                    setEditingField(field);
                    setFieldEdit({
                      name: field.name,
                      area: String(field.area),
                      crop_name: field.crop_name || "",
                      planting_date: field.planting_date,
                      soil_ph: String(field.soil_ph),
                      organic_matter: String(field.organic_matter),
                      water_source: field.water_source,
                    });
                    setFieldError("");
                  }} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><Pencil size={14} /></button>
                  <button type="button" aria-label={`Delete ${field.name}`} onClick={() => void handleDeleteField(field)} className="rounded-lg border border-rose-200 p-2 text-rose-700 hover:bg-rose-50"><Trash2 size={14} /></button>
                  <button
                    type="button"
                    onClick={() => void handleToggleHarvest(field.id)}
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
            <h3 className="text-xl font-bold text-[#123d35]">{editingFarm ? "Edit Farm Parcel" : "Add New Farm Parcel"}</h3>
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
                  {isSubmittingFarm ? "Saving..." : editingFarm ? "Save Changes" : "Save Farm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="edit-field-title" className="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <h3 id="edit-field-title" className="text-xl font-bold text-[#123d35]">Edit Field Plot</h3>
            {fieldError && <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{fieldError}</p>}
            <form onSubmit={handleUpdateField} className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-bold text-slate-600">Field name
                <input required value={fieldEdit.name} onChange={(event) => setFieldEdit({ ...fieldEdit, name: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
              </label>
              <label className="text-xs font-bold text-slate-600">Area (hectares)
                <input required type="number" min="0.01" step="0.01" value={fieldEdit.area} onChange={(event) => setFieldEdit({ ...fieldEdit, area: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
              </label>
              <label className="text-xs font-bold text-slate-600">Crop
                <input value={fieldEdit.crop_name} list="field-edit-crops" onChange={(event) => setFieldEdit({ ...fieldEdit, crop_name: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
                <datalist id="field-edit-crops">{crops.map((crop) => <option key={crop.id} value={crop.name} />)}</datalist>
              </label>
              <label className="text-xs font-bold text-slate-600">Planting date
                <input required type="date" value={fieldEdit.planting_date} onChange={(event) => setFieldEdit({ ...fieldEdit, planting_date: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
              </label>
              <label className="text-xs font-bold text-slate-600">Soil pH
                <input required type="number" min="0" max="14" step="0.1" value={fieldEdit.soil_ph} onChange={(event) => setFieldEdit({ ...fieldEdit, soil_ph: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
              </label>
              <label className="text-xs font-bold text-slate-600">Organic matter (%)
                <input required type="number" min="0" max="100" step="0.1" value={fieldEdit.organic_matter} onChange={(event) => setFieldEdit({ ...fieldEdit, organic_matter: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
              </label>
              <label className="text-xs font-bold text-slate-600 sm:col-span-2">Water source
                <select required value={fieldEdit.water_source} onChange={(event) => setFieldEdit({ ...fieldEdit, water_source: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal">
                  <option value="Rainfed">Rainfed</option>
                  <option value="Drip Irrigation">Drip Irrigation</option>
                  <option value="Canal System">Canal System</option>
                  <option value="Borehole / Well">Borehole / Well</option>
                </select>
              </label>
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 sm:col-span-2">
                <button type="button" onClick={() => setEditingField(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600">Cancel</button>
                <button type="submit" className="rounded-xl bg-[#16875f] px-5 py-2 text-sm font-bold text-white hover:bg-[#064b3b]">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
