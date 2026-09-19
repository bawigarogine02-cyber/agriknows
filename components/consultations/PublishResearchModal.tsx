"use client";

import { Crop } from "@/lib/db/repository";
import { BookOpen, Upload, X } from "lucide-react";
import { useState } from "react";

interface PublishResearchModalProps {
  isOpen: boolean;
  crops: Crop[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function PublishResearchModal({ isOpen, crops, onClose, onSuccess }: PublishResearchModalProps) {
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [cropType, setCropType] = useState(crops[0]?.name || "Maize (Corn)");
  const [soilType, setSoilType] = useState("Loam / Clay Loam");
  const [pdfUrl, setPdfUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !abstract.trim() || !cropType) {
      setError("Please fill out study title, abstract summary, and crop type.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/publications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          abstract: abstract.trim(),
          crop_type: cropType,
          soil_type: soilType,
          pdf_url: pdfUrl.trim() || "#"
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to publish research paper.");
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
              <BookOpen size={22} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#123d35]">Publish Research Paper (Researcher View)</h2>
              <p className="text-xs text-slate-500">Contribute peer-reviewed agricultural findings.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        {error && <div className="mt-4 rounded-xl bg-[#fff5ef] p-3 text-sm text-[#9a3c20]">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Study Title *</label>
            <input
              type="text"
              placeholder="e.g. Comparative Analysis of Bio-Fertilization in Tropical Maize Cultivation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#16875f]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Target Crop Type *</label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-[#16875f]"
              >
                {crops.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Soil Type Tag</label>
              <input
                type="text"
                placeholder="e.g. Acidic Clay / Loam"
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#16875f]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Abstract Summary *</label>
            <textarea
              rows={4}
              placeholder="Provide a concise summary of your research methodology, field trials, and core findings..."
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-[#16875f]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">PDF / Publication Link (Optional)</label>
            <input
              type="url"
              placeholder="https://journal.agrikms.org/papers/bio-fertilization-2026.pdf"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#16875f]"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#16875f] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#064b3b] disabled:opacity-50"
            >
              <Upload size={16} />
              {isSubmitting ? "Publishing..." : "Publish Research"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
