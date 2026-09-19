"use client";

import { Crop } from "@/lib/db/repository";
import { Image, MessageSquare, Send, X } from "lucide-react";
import { useState } from "react";

interface AskExpertFormProps {
  isOpen: boolean;
  crops: Crop[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function AskExpertForm({ isOpen, crops, onClose, onSuccess }: AskExpertFormProps) {
  const [cropName, setCropName] = useState(crops[0]?.name || "Maize (Corn)");
  const [isCustomCrop, setIsCustomCrop] = useState(false);
  const [customCropName, setCustomCropName] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalCropName = isCustomCrop ? customCropName.trim() : cropName;
    if (!finalCropName || !subject.trim() || !description.trim()) {
      setError("Please specify the crop, subject, and issue description.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop_name: finalCropName,
          subject: subject.trim(),
          description: description.trim(),
          image_url: imageUrl.trim() || undefined
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit inquiry.");
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
              <MessageSquare size={22} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#123d35]">Ask an Agricultural Expert</h2>
              <p className="text-xs text-slate-500">Connect directly with verified agronomists & researchers.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        {error && <div className="mt-4 rounded-xl bg-[#fff5ef] p-3 text-sm text-[#9a3c20]">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Affected Crop *</label>
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
                placeholder="Type new crop name (e.g. Bush Green Beans, Dragon Fruit, Cacao)"
                value={customCropName}
                onChange={(e) => setCustomCropName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-[#16875f]"
              />
            ) : (
              <select
                value={cropName}
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setIsCustomCrop(true);
                  } else {
                    setCropName(e.target.value);
                  }
                }}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-[#16875f]"
              >
                {crops.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
                <option value="__custom__">+ Input new crop...</option>
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Inquiry Subject *</label>
            <input
              type="text"
              placeholder="e.g. Yellowing leaf tips on lower canopy during vegetative stage"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#16875f]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Detailed Problem Description *</label>
            <textarea
              rows={4}
              placeholder="Describe plant symptoms, recent weather, soil pH, and any applied fertilizers or pesticides..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-[#16875f]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Diagnostic Image URL (Optional)</label>
            <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-slate-400">
              <Image size={18} />
              <input
                type="url"
                placeholder="https://example.com/field-symptom.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 outline-none bg-transparent"
              />
            </div>
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
              <Send size={16} />
              {isSubmitting ? "Submitting..." : "Submit Inquiry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
