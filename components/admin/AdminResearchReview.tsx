"use client";

import type { Crop, ResearchPublication } from "@/lib/db/repository";
import { ExternalLink, FileText, LoaderCircle, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PublishResearchModal from "@/components/consultations/PublishResearchModal";
import ConfirmActionDialog from "@/components/ui/ConfirmActionDialog";

interface AdminResearchReviewProps {
  crops: Crop[];
  publications: ResearchPublication[];
}

export default function AdminResearchReview({ crops, publications }: AdminResearchReviewProps) {
  const router = useRouter();
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingPublication, setEditingPublication] = useState<ResearchPublication | null>(null);
  const [confirmingDecline, setConfirmingDecline] = useState<ResearchPublication | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<ResearchPublication | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "declined">("pending");
  const pendingPublications = publications.filter((publication) => publication.status === "pending");
  const approvedPublications = publications.filter((publication) => publication.status === "approved");
  const declinedPublications = publications.filter((publication) => publication.status === "declined");
  const visiblePublications = activeTab === "pending"
    ? pendingPublications
    : activeTab === "approved"
      ? approvedPublications
      : declinedPublications;
  const tabClass = (tab: typeof activeTab) =>
    `rounded-lg px-4 py-2.5 text-sm font-bold transition ${
      activeTab === tab
        ? "bg-[#16875f] text-white shadow-sm"
        : "text-slate-600 hover:bg-white hover:text-[#123d35]"
    }`;

  async function submitReview(publication: ResearchPublication, status: "approved" | "declined") {
    setApprovingId(publication.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/research/${publication.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data: { error?: string } = await response.json();
      if (!response.ok) throw new Error(data.error || `Unable to ${status === "approved" ? "approve" : "decline"} the research paper.`);
      router.refresh();
    } finally {
      setApprovingId(null);
    }
  }

  async function approve(publication: ResearchPublication) {
    try {
      await submitReview(publication, "approved");
    } catch (approvalError) {
      setError(approvalError instanceof Error ? approvalError.message : "Unable to approve the research paper.");
    }
  }

  async function deletePublication(publication: ResearchPublication) {
    setDeletingId(publication.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/research/${publication.id}`, { method: "DELETE" });
      const data: { error?: string } = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to delete the research paper.");
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  function renderPublication(publication: ResearchPublication) {
    const isPending = publication.status === "pending";
    return (
      <article key={publication.id} className="space-y-4 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-bold leading-snug text-[#123d35]">{publication.title}</h3>
            <p className="mt-1 text-sm font-semibold text-[#16875f]">Researcher: {publication.researcher_name}</p>
            <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
              publication.status === "pending"
                ? "bg-amber-50 text-amber-800"
                : publication.status === "declined"
                  ? "bg-rose-50 text-rose-800"
                  : "bg-emerald-50 text-emerald-800"
            }`}>
              {publication.status === "pending" ? "Pending approval" : publication.status === "declined" ? "Declined" : "Approved"}
            </span>
          </div>
          <time className="shrink-0 text-sm text-slate-500" dateTime={publication.publication_date}>
            {publication.publication_date}
          </time>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-md bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">Crop: {publication.crop_type}</span>
          <span className="rounded-md bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">Soil: {publication.soil_type}</span>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{publication.abstract}</p>

        <div className="flex flex-wrap items-center gap-3">
          {publication.pdf_url && (
            <a
              href={publication.pdf_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <FileText size={16} />
              View publication
              <ExternalLink size={14} />
            </a>
          )}
          {isPending && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void approve(publication)}
                disabled={approvingId !== null}
                className="inline-flex items-center gap-2 rounded-lg bg-[#16875f] px-4 py-2 text-sm font-bold text-white hover:bg-[#064b3b] disabled:opacity-60"
              >
                {approvingId === publication.id && <LoaderCircle size={15} className="animate-spin" />}
                Approve research
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDecline(publication)}
                disabled={approvingId !== null}
                className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
              >
                Decline
              </button>
            </div>
          )}
          <div className="ml-auto flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setEditingPublication(publication)}
              disabled={approvingId !== null || deletingId !== null}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              aria-label={`Edit ${publication.title}`}
            >
              <Pencil size={15} />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(publication)}
              disabled={approvingId !== null || deletingId !== null}
              className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
              aria-label={`Delete ${publication.title}`}
            >
              {deletingId === publication.id ? <LoaderCircle size={15} className="animate-spin" /> : <Trash2 size={15} />}
              Delete
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="space-y-6">
      {error && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
      <section className="rounded-xl bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <div role="tablist" aria-label="Research publication status" className="flex flex-wrap gap-2 rounded-xl bg-slate-100 p-1.5">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "pending"}
              aria-controls="research-publications-panel"
              onClick={() => setActiveTab("pending")}
              className={tabClass("pending")}
            >
              Pending ({pendingPublications.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "approved"}
              aria-controls="research-publications-panel"
              onClick={() => setActiveTab("approved")}
              className={tabClass("approved")}
            >
              Approved ({approvedPublications.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "declined"}
              aria-controls="research-publications-panel"
              onClick={() => setActiveTab("declined")}
              className={tabClass("declined")}
            >
              Declined ({declinedPublications.length})
            </button>
          </div>
        </div>
        <div
          id="research-publications-panel"
          role="tabpanel"
          className="min-h-36"
        >
          {visiblePublications.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No available data</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {visiblePublications.map(renderPublication)}
            </div>
          )}
        </div>
      </section>
      {editingPublication && (
        <PublishResearchModal
          key={editingPublication.id}
          isOpen
          crops={crops}
          userRole="admin"
          initialPublication={editingPublication}
          onClose={() => setEditingPublication(null)}
          onSuccess={() => router.refresh()}
        />
      )}
      <ConfirmActionDialog
        isOpen={confirmingDecline !== null}
        title="Decline research submission?"
        description={confirmingDecline
          ? `Decline "${confirmingDecline.title}"? The researcher can edit it and resubmit for approval.`
          : ""}
        confirmLabel="Decline submission"
        tone="warning"
        onClose={() => setConfirmingDecline(null)}
        onConfirm={async () => {
          if (confirmingDecline) await submitReview(confirmingDecline, "declined");
          setConfirmingDecline(null);
        }}
      />
      <ConfirmActionDialog
        isOpen={confirmingDelete !== null}
        title="Delete research paper?"
        description={confirmingDelete
          ? `Delete "${confirmingDelete.title}"? This cannot be undone.`
          : ""}
        confirmLabel="Delete paper"
        onClose={() => setConfirmingDelete(null)}
        onConfirm={async () => {
          if (confirmingDelete) await deletePublication(confirmingDelete);
          setConfirmingDelete(null);
        }}
      />
    </div>
  );
}
