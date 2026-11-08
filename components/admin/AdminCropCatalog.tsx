"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { LoaderCircle, Pencil, Plus, Trash2, Sprout, X } from "lucide-react";
import type { Crop } from "@/lib/db/repository";

type CropForm = {
  name: string;
  season: string;
  ideal_ph_min: string;
  ideal_ph_max: string;
  water_requirement: string;
  growth_days: string;
  climate: string;
  companion_crops: string;
  category: string;
  type: string;
  stage: string;
  detail: string;
  soil: string;
};

const emptyForm: CropForm = {
  name: "",
  season: "Wet Season",
  ideal_ph_min: "5.5",
  ideal_ph_max: "7.5",
  water_requirement: "400 - 600 mm",
  growth_days: "120",
  climate: "Warm Subtropical",
  companion_crops: "Legumes, Basil",
  category: "Legumes",
  type: "Agricultural Variety",
  stage: "Planting / Seedling",
  detail: "Cultivated variety managed in workspace field records.",
  soil: "",
};

export default function AdminCropCatalog({ initialCrops }: { initialCrops: Crop[] }) {
  const [crops, setCrops] = useState(initialCrops);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<CropForm>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const summary = useMemo(() => {
    const maxGrowth = crops.reduce((largest, crop) => Math.max(largest, Number(crop.growth_days || 0)), 0);
    return {
      total: crops.length,
      longestGrowth: maxGrowth,
    };
  }, [crops]);

  function openCreateForm() {
    setEditingCrop(null);
    setForm(emptyForm);
    setError("");
    setIsFormOpen(true);
  }

  function openEditForm(crop: Crop) {
    setEditingCrop(crop);
    setForm({
      name: crop.name,
      season: crop.season || "",
      ideal_ph_min: String(crop.ideal_ph_min ?? ""),
      ideal_ph_max: String(crop.ideal_ph_max ?? ""),
      water_requirement: crop.water_requirement || "",
      growth_days: String(crop.growth_days ?? ""),
      climate: crop.climate || "",
      companion_crops: crop.companion_crops || "",
      category: crop.category || "",
      type: crop.type || "",
      stage: crop.stage || "",
      detail: crop.detail || "",
      soil: crop.soil || "",
    });
    setError("");
    setIsFormOpen(true);
  }

  async function saveCrop(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        ...(editingCrop ? { id: editingCrop.id } : {}),
        name: form.name.trim(),
        season: form.season.trim(),
        ideal_ph_min: Number(form.ideal_ph_min),
        ideal_ph_max: Number(form.ideal_ph_max),
        water_requirement: form.water_requirement.trim(),
        growth_days: Number(form.growth_days),
        climate: form.climate.trim(),
        companion_crops: form.companion_crops.trim(),
        category: form.category.trim(),
        type: form.type.trim(),
        stage: form.stage.trim(),
        detail: form.detail.trim(),
        soil: form.soil.trim(),
      };

      const response = await fetch("/api/crops", {
        method: editingCrop ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to save crop.");
      }

      const savedCrop = data.crop as Crop;
      setCrops((current) => {
        if (editingCrop) {
          return current.map((crop) => (crop.id === savedCrop.id ? savedCrop : crop));
        }
        return [savedCrop, ...current];
      });
      setIsFormOpen(false);
      setEditingCrop(null);
      setForm(emptyForm);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save crop.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function removeCrop(crop: Crop) {
    const confirmed = window.confirm(`Delete "${crop.name}" from the crop reference library?`);
    if (!confirmed) return;

    try {
      const response = await fetch("/api/crops", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: crop.id }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to delete crop.");
      }
      setCrops((current) => current.filter((item) => item.id !== crop.id));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Unable to delete crop.");
    }
  }

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#123d35]">Crop reference library</h2>
            <p className="mt-1 text-sm text-slate-500">{summary.total} crop records</p>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-lg bg-[#16875f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0c704d]"
          >
            <Plus size={17} />
            Add crop
          </button>
        </div>

        <div className="grid gap-4 border-b border-slate-100 bg-[#f8faf7] p-5 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Records</p>
            <p className="mt-2 text-2xl font-extrabold text-[#064b3b]">{summary.total}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Longest crop cycle</p>
            <p className="mt-2 text-2xl font-extrabold text-[#064b3b]">{summary.longestGrowth || 0} days</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Library status</p>
            <p className="mt-2 text-lg font-bold text-emerald-700">Active</p>
          </div>
        </div>

        {error && (
          <p role="alert" className="m-5 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </p>
        )}

        {crops.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <Sprout className="mx-auto h-9 w-9 text-slate-300" />
            <p className="mt-3 text-lg font-semibold text-slate-700">No crop records yet</p>
            <p className="mt-1 text-sm text-slate-500">Add the first crop to populate the reference library.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-[#f8faf7] text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Crop</th>
                  <th className="px-5 py-4">Season</th>
                  <th className="px-5 py-4">pH</th>
                  <th className="px-5 py-4">Water</th>
                  <th className="px-5 py-4">Growth</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {crops.map((crop) => (
                  <tr key={crop.id} className="align-top">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{crop.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{crop.category || "General crop"}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{crop.season || "—"}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {crop.ideal_ph_min !== undefined && crop.ideal_ph_max !== undefined
                        ? `${crop.ideal_ph_min} - ${crop.ideal_ph_max}`
                        : "—"}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{crop.water_requirement || "—"}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{crop.growth_days ? `${crop.growth_days} days` : "—"}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(crop)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#16875f] hover:text-[#16875f]"
                        >
                          <Pencil size={13} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeCrop(crop)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#27715d]">Crop library</p>
                <h3 className="mt-1 text-2xl font-extrabold text-[#064b3b]">
                  {editingCrop ? "Update crop record" : "Create crop record"}
                </h3>
              </div>
              <button type="button" onClick={() => setIsFormOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveCrop} className="grid gap-4 md:grid-cols-2">
              <label className="md:col-span-2 flex flex-col gap-1 text-sm font-medium text-slate-700">
                Crop name
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-[#16875f] focus:bg-white"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Season
                <input
                  value={form.season}
                  onChange={(event) => setForm((current) => ({ ...current, season: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#16875f] focus:bg-white"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Category
                <input
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#16875f] focus:bg-white"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Ideal pH minimum
                <input
                  type="number"
                  min="0"
                  max="14"
                  step="0.1"
                  value={form.ideal_ph_min}
                  onChange={(event) => setForm((current) => ({ ...current, ideal_ph_min: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#16875f] focus:bg-white"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Ideal pH maximum
                <input
                  type="number"
                  min="0"
                  max="14"
                  step="0.1"
                  value={form.ideal_ph_max}
                  onChange={(event) => setForm((current) => ({ ...current, ideal_ph_max: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#16875f] focus:bg-white"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Water requirement
                <input
                  value={form.water_requirement}
                  onChange={(event) => setForm((current) => ({ ...current, water_requirement: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#16875f] focus:bg-white"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Growth days
                <input
                  type="number"
                  min="1"
                  value={form.growth_days}
                  onChange={(event) => setForm((current) => ({ ...current, growth_days: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#16875f] focus:bg-white"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Climate
                <input
                  value={form.climate}
                  onChange={(event) => setForm((current) => ({ ...current, climate: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#16875f] focus:bg-white"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Type
                <input
                  value={form.type}
                  onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#16875f] focus:bg-white"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Companion crops
                <input
                  value={form.companion_crops}
                  onChange={(event) => setForm((current) => ({ ...current, companion_crops: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#16875f] focus:bg-white"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Stage
                <input
                  value={form.stage}
                  onChange={(event) => setForm((current) => ({ ...current, stage: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#16875f] focus:bg-white"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 md:col-span-2">
                Soil preference
                <input
                  value={form.soil}
                  onChange={(event) => setForm((current) => ({ ...current, soil: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#16875f] focus:bg-white"
                />
              </label>

              <label className="md:col-span-2 flex flex-col gap-1 text-sm font-medium text-slate-700">
                Details
                <textarea
                  value={form.detail}
                  onChange={(event) => setForm((current) => ({ ...current, detail: event.target.value }))}
                  rows={4}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#16875f] focus:bg-white"
                />
              </label>

              <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#16875f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0c704d] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sprout className="h-4 w-4" />}
                  {isSubmitting ? "Saving..." : editingCrop ? "Update crop" : "Create crop"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
