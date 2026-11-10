"use client";

import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import type { CropItem } from "./crop-types";

type AddCropModalProps = {
  onClose: () => void;
  onCreated: (crop: CropItem) => void;
};

export default function AddCropModal({ onClose, onCreated }: AddCropModalProps) {
  const [form, setForm] = useState({ name: "", type: "", category: "", notes: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/crops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          type: form.type.trim(),
          category: form.category.trim(),
          detail: form.notes.trim(),
          season: "Wet Season",
          growth_days: 90,
          ideal_ph_min: 6,
          ideal_ph_max: 7.5,
          water_requirement: "400 - 600 mm",
          climate: "Warm Subtropical",
          companion_crops: "Legumes, Basil",
          soil: "Well-drained loamy soil",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save the crop.");
      if (!result.crop || typeof result.crop.id !== "string") {
        throw new Error("The server did not return the saved crop.");
      }

      onCreated(result.crop as CropItem);
      setSuccess(`Successfully added "${result.crop.name}" to the crop library.`);
      window.setTimeout(onClose, 1000);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save the crop.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add Crop to Library"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4"
      onClick={isSaving ? undefined : onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="my-8 w-full max-w-lg space-y-5 rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="flex items-center gap-2 text-xl font-bold text-[#123d35]">
            <Plus className="text-[#16875f]" size={22} /> Add Crop to Library
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close"
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {success && (
          <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
            <Check size={16} /> {success}
          </p>
        )}
        {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label htmlFor="crop-name" className="block font-bold text-slate-700">Crop Variety Name *</label>
            <input
              id="crop-name"
              required
              autoFocus
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Crop name"
              className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
            />
          </div>
          <div>
            <label htmlFor="crop-type" className="block font-bold text-slate-700">Crop Type *</label>
            <input
              id="crop-type"
              required
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value })}
              placeholder="Enter the crop type"
              className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
            />
          </div>
          <div>
            <label htmlFor="crop-category" className="block font-bold text-slate-700">Category</label>
            <input
              id="crop-category"
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              placeholder="Enter the crop category"
              className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
            />
          </div>
          <div>
            <label htmlFor="crop-notes" className="block font-bold text-slate-700">Notes</label>
            <textarea
              id="crop-notes"
              rows={2}
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              placeholder="Optional notes"
              className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || Boolean(success)}
              className="rounded-xl bg-[#16875f] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0c704d] disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Crop"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
