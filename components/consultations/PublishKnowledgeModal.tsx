"use client";

import type { Article, Crop, PestDisease } from "@/lib/db/repository";
import { BookOpen, Bug, LoaderCircle, Upload, X } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { parseGuideSteps, serializeGuideSteps } from "@/lib/knowledge/guide-content";

interface PublishKnowledgeModalProps {
  isOpen: boolean;
  kind: "pest" | "guide" | "article";
  crops: Crop[];
  userRole?: string;
  initialArticle?: Article | null;
  initialPest?: PestDisease | null;
  onClose: () => void;
  onSuccess: () => void;
}

const initialForm = {
  name: "",
  crop_id: "",
  pest_type: "insect",
  custom_pest_type: "",
  symptoms: "",
  prevention: "",
  treatment: "",
  title: "",
  category: "",
  summary: "",
  body: "",
  steps: [""],
  evidence_note: "",
  source_url: "",
};

export default function PublishKnowledgeModal({
  isOpen,
  kind,
  crops,
  userRole,
  initialArticle = null,
  initialPest = null,
  onClose,
  onSuccess,
}: PublishKnowledgeModalProps) {
  const [form, setForm] = useState(() => {
    if (initialPest) {
      const standardTypes = ["insect", "fungus", "bacterial", "virus"];
      const isStandardType = standardTypes.includes(initialPest.type);
      return {
        ...initialForm,
        name: initialPest.name,
        crop_id: initialPest.crop_id ?? "",
        pest_type: isStandardType ? initialPest.type : "__custom__",
        custom_pest_type: isStandardType ? "" : initialPest.type,
        symptoms: initialPest.symptoms,
        prevention: initialPest.prevention,
        treatment: initialPest.treatment,
      };
    }
    if (!initialArticle) return initialForm;
    const guideSteps = parseGuideSteps(initialArticle.body);
    return {
      ...initialForm,
      title: initialArticle.title,
      category: initialArticle.category.replace(/^Guide:\s*/, ""),
      summary: initialArticle.summary,
      body: initialArticle.body,
      steps: guideSteps?.length ? guideSteps : [initialArticle.body],
      evidence_note: initialArticle.evidence_note ?? "",
      source_url: initialArticle.source_url ?? "",
    };
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const isPestEntry = kind === "pest";
  const isGuideEntry = kind === "guide";
  const isAdmin = userRole === "admin";

  function closeModal() {
    if (isSubmitting) return;
    setForm(initialForm);
    setError("");
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const payload = initialPest
        ? {
            kind,
            id: initialPest.id,
            name: form.name,
            crop_id: form.crop_id,
            type: form.pest_type === "__custom__" ? form.custom_pest_type : form.pest_type,
            symptoms: form.symptoms,
            prevention: form.prevention,
            treatment: form.treatment,
          }
        : initialArticle
        ? {
            kind,
            id: initialArticle.id,
            title: form.title,
            category: isGuideEntry ? `Guide: ${form.category}` : form.category,
            summary: form.summary,
            ...(isGuideEntry
              ? isAdmin
                ? { body: serializeGuideSteps(form.steps) }
                : { steps: form.steps }
              : { body: form.body }),
            evidence_note: form.evidence_note,
            source_url: form.source_url,
            published: true,
          }
        : isPestEntry
          ? {
              kind,
              name: form.name,
              crop_id: form.crop_id,
              type: form.pest_type === "__custom__" ? form.custom_pest_type : form.pest_type,
              symptoms: form.symptoms,
              prevention: form.prevention,
              treatment: form.treatment,
            }
          : isGuideEntry
            ? {
                kind,
                title: form.title,
                category: form.category,
                summary: form.summary,
                steps: form.steps,
                evidence_note: form.evidence_note,
                source_url: form.source_url,
              }
            : {
                kind,
                title: form.title,
                category: form.category,
                summary: form.summary,
                body: form.body,
                evidence_note: form.evidence_note,
                source_url: form.source_url,
              };

      const response = await fetch(
        initialPest
          ? isAdmin ? `/api/admin/pests/${initialPest.id}` : "/api/research/knowledge"
          : initialArticle
            ? isAdmin ? "/api/admin/knowledge-articles" : "/api/research/knowledge"
            : "/api/research/knowledge",
        {
          method: initialPest || initialArticle ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data: { error?: string } = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to publish this knowledge entry.");

      setForm(initialForm);
      onSuccess();
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to publish this knowledge entry."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClassName =
    "mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#16875f]";
  const labelClassName = "block text-xs font-bold uppercase tracking-wider text-slate-600";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`knowledge-entry-title-${kind}`}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e0f5eb] text-[#16875f]">
              {isPestEntry ? <Bug size={21} /> : <BookOpen size={21} />}
            </div>
            <div>
              <h2 id={`knowledge-entry-title-${kind}`} className="text-xl font-extrabold text-[#123d35]">
                {isPestEntry
                  ? `${initialPest ? "Edit" : "Add"} Pest or Disease`
                  : isGuideEntry
                    ? `${initialArticle ? "Edit" : "Add"} Farming Guide`
                    : `${initialArticle ? "Edit" : "Add"} Article`}
              </h2>
              <p className="text-xs text-slate-500">
                {initialPest
                  ? "Update this pest or disease entry; its approval status will be preserved."
                  : initialArticle
                  ? "Update this knowledge entry; approved content remains available to farmers."
                  : isAdmin
                  ? "Your approved entry will be available to farmers."
                  : "Your submission will be reviewed by an administrator before it appears to farmers."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            disabled={isSubmitting}
            aria-label="Close"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-[#fff5ef] p-3 text-sm text-[#9a3c20]">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {isPestEntry ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className={labelClassName}>
                  Pest or disease name *
                  <input
                    required
                    maxLength={160}
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    className={inputClassName}
                    placeholder="e.g. Fall armyworm"
                  />
                </label>
                <label className={labelClassName}>
                  Classification *
                  <select
                    value={form.pest_type}
                    onChange={(event) => setForm((current) => ({ ...current, pest_type: event.target.value }))}
                    className={`${inputClassName} bg-slate-50`}
                  >
                    <option value="insect">Insect pest</option>
                    <option value="fungus">Fungal disease</option>
                    <option value="bacterial">Bacterial disease</option>
                    <option value="virus">Viral disease</option>
                    <option value="__custom__">Add new classification...</option>
                  </select>
                </label>
              </div>

              {form.pest_type === "__custom__" && (
                <label className={labelClassName}>
                  New classification *
                  <input
                    required
                    maxLength={80}
                    value={form.custom_pest_type}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, custom_pest_type: event.target.value }))
                    }
                    className={inputClassName}
                    placeholder="e.g. Nematode"
                  />
                </label>
              )}

              <label className={labelClassName}>
                Affected crop
                <select
                  value={form.crop_id}
                  onChange={(event) => setForm((current) => ({ ...current, crop_id: event.target.value }))}
                  className={`${inputClassName} bg-slate-50`}
                >
                  <option value="">All crops / not crop-specific</option>
                  {crops.map((crop) => (
                    <option key={crop.id} value={crop.id}>
                      {crop.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClassName}>
                Symptoms and identification *
                <textarea
                  required
                  maxLength={65535}
                  rows={3}
                  value={form.symptoms}
                  onChange={(event) => setForm((current) => ({ ...current, symptoms: event.target.value }))}
                  className={inputClassName}
                />
              </label>
              <label className={labelClassName}>
                Prevention *
                <textarea
                  required
                  maxLength={65535}
                  rows={3}
                  value={form.prevention}
                  onChange={(event) => setForm((current) => ({ ...current, prevention: event.target.value }))}
                  className={inputClassName}
                />
              </label>
              <label className={labelClassName}>
                Treatment and intervention *
                <textarea
                  required
                  maxLength={65535}
                  rows={3}
                  value={form.treatment}
                  onChange={(event) => setForm((current) => ({ ...current, treatment: event.target.value }))}
                  className={inputClassName}
                />
              </label>
            </>
          ) : isGuideEntry ? (
            <>
              <div className="rounded-xl border border-slate-200 p-4">
                <h3 className="text-sm font-bold text-[#123d35]">Guide information</h3>
                <div className="mt-3 space-y-4">
                  <label className={labelClassName}>
                    Guide title *
                    <input
                      required
                      maxLength={255}
                      value={form.title}
                      onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                      className={inputClassName}
                      placeholder="e.g. Prepare soil for planting maize"
                    />
                  </label>
                  <label className={labelClassName}>
                    Topic *
                    <input
                      required
                      maxLength={90}
                      value={form.category}
                      onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                      className={inputClassName}
                      placeholder="e.g. Soil Preparation"
                    />
                  </label>
                  <label className={labelClassName}>
                    Guide overview *
                    <textarea
                      required
                      maxLength={65535}
                      rows={3}
                      value={form.summary}
                      onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
                      className={inputClassName}
                      placeholder="Explain what this guide helps the farmer accomplish."
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#123d35]">Steps</h3>
                    <p className="mt-1 text-xs text-slate-500">Enter each action in the order it should be done.</p>
                  </div>
                  <button
                    type="button"
                    disabled={form.steps.length >= 20}
                    onClick={() => setForm((current) => ({ ...current, steps: [...current.steps, ""] }))}
                    className="shrink-0 rounded-lg border border-[#16875f] px-3 py-2 text-xs font-bold text-[#16875f] hover:bg-[#e0f5eb] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Add step
                  </button>
                </div>
                <ol className="mt-4 space-y-3">
                  {form.steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="mt-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e0f5eb] text-xs font-bold text-[#16875f]">
                        {index + 1}
                      </span>
                      <label className="min-w-0 flex-1">
                        <span className={labelClassName}>Step {index + 1} *</span>
                        <textarea
                          required
                          maxLength={4000}
                          rows={2}
                          value={step}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              steps: current.steps.map((currentStep, currentIndex) =>
                                currentIndex === index ? event.target.value : currentStep
                              ),
                            }))
                          }
                          className={inputClassName}
                          placeholder="Describe this action."
                        />
                      </label>
                      {form.steps.length > 1 && (
                        <button
                          type="button"
                          aria-label={`Remove step ${index + 1}`}
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              steps: current.steps.filter((_, currentIndex) => currentIndex !== index),
                            }))
                          }
                          className="mt-6 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className={labelClassName}>
                  Additional information (optional)
                  <textarea
                    maxLength={65535}
                    rows={3}
                    value={form.evidence_note}
                    onChange={(event) => setForm((current) => ({ ...current, evidence_note: event.target.value }))}
                    className={inputClassName}
                  />
                </label>
                <label className={labelClassName}>
                  Source URL (optional)
                  <input
                    type="url"
                    maxLength={1000}
                    value={form.source_url}
                    onChange={(event) => setForm((current) => ({ ...current, source_url: event.target.value }))}
                    className={inputClassName}
                    placeholder="https://..."
                  />
                </label>
              </div>
            </>
          ) : (
            <>
              <label className={labelClassName}>
                Article title *
                <input
                  required
                  maxLength={255}
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  className={inputClassName}
                  placeholder="e.g. Benefits of crop rotation"
                />
              </label>
              <label className={labelClassName}>
                Topic *
                <input
                  required
                  maxLength={90}
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                  className={inputClassName}
                  placeholder="e.g. Sustainable Agriculture"
                />
              </label>
              <label className={labelClassName}>
                Summary *
                <textarea
                  required
                  maxLength={65535}
                  rows={3}
                  value={form.summary}
                  onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
                  className={inputClassName}
                  placeholder="Write a brief summary of the article."
                />
              </label>
              <label className={labelClassName}>
                Article content *
                <textarea
                  required
                  maxLength={100000}
                  rows={8}
                  value={form.body}
                  onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
                  className={inputClassName}
                  placeholder="Write the full article."
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className={labelClassName}>
                  Evidence note (optional)
                  <textarea
                    maxLength={65535}
                    rows={3}
                    value={form.evidence_note}
                    onChange={(event) => setForm((current) => ({ ...current, evidence_note: event.target.value }))}
                    className={inputClassName}
                  />
                </label>
                <label className={labelClassName}>
                  Source URL (optional)
                  <input
                    type="url"
                    maxLength={1000}
                    value={form.source_url}
                    onChange={(event) => setForm((current) => ({ ...current, source_url: event.target.value }))}
                    className={inputClassName}
                    placeholder="https://..."
                  />
                </label>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#16875f] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#064b3b] disabled:opacity-50"
            >
              {isSubmitting ? <LoaderCircle size={16} className="animate-spin" /> : <Upload size={16} />}
              {isSubmitting
                ? "Publishing..."
                : isPestEntry
                  ? "Publish Pest or Disease"
                  : isGuideEntry
                    ? "Publish Guide"
                    : "Publish Article"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
