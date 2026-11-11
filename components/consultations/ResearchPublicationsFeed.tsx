"use client";

import { ResearchPublication } from "@/lib/db/repository";
import { ExternalLink, Eye, FileText, LoaderCircle, Pencil, Plus, Trash2, UserCheck, X } from "lucide-react";
import { useState } from "react";
import ConfirmActionDialog from "@/components/ui/ConfirmActionDialog";

interface ResearchPublicationsFeedProps {
  publications: ResearchPublication[];
  userRole?: string;
  currentUserId: string;
  onOpenPublishModal: () => void;
  onEditPublication: (publication: ResearchPublication) => void;
  onRefresh: () => void;
  showPublishButton?: boolean;
}

export default function ResearchPublicationsFeed({
  publications,
  userRole,
  currentUserId,
  onOpenPublishModal,
  onEditPublication,
  onRefresh,
  showPublishButton = true,
}: ResearchPublicationsFeedProps) {
  const isResearcherOrAdmin = userRole === "researcher" || userRole === "admin";
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<ResearchPublication | null>(null);
  const [selectedPublication, setSelectedPublication] = useState<ResearchPublication | null>(null);
  const ownPublications = publications.filter((publication) => publication.researcher_id === currentUserId);
  const otherPublications = publications.filter((publication) => publication.researcher_id !== currentUserId);

  async function deletePublication(publication: ResearchPublication) {
    setDeletingId(publication.id);
    try {
      const response = await fetch(`/api/publications/${publication.id}`, { method: "DELETE" });
      const data: { error?: string } = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to delete the research paper.");
      onRefresh();
    } finally {
      setDeletingId(null);
    }
  }

  function renderPublication(publication: ResearchPublication, isOwner: boolean) {
    return (
      <article key={publication.id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
        <div>
          <div className="flex items-center justify-between">
            <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
              publication.status === "approved"
                ? "bg-[#e0f5eb] text-[#16875f]"
                : publication.status === "declined"
                  ? "bg-rose-50 text-rose-800"
                  : "bg-amber-50 text-amber-800"
            }`}>
              <UserCheck size={14} />
              {publication.status === "approved"
                ? "Approved Study"
                : publication.status === "declined"
                  ? "Declined — update and resubmit"
                  : "Pending Approval"}
            </span>
            <span className="text-xs font-semibold text-slate-400">{publication.publication_date}</span>
          </div>

          <h4 className="mt-3 text-lg font-bold leading-snug text-[#123d35]">{publication.title}</h4>
          <p className="mt-1 text-xs font-semibold text-[#16875f]">Author: {publication.researcher_name}</p>

          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-700">Crop: {publication.crop_type}</span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-700">Soil: {publication.soil_type}</span>
          </div>

          <p className="mt-3 line-clamp-4 text-xs leading-relaxed text-slate-600">{publication.abstract}</p>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          {publication.pdf_url ? (
            <a
              href={publication.pdf_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-[#16875f] hover:text-white"
            >
              <FileText size={15} />
              Access Publication / PDF Link
              <ExternalLink size={13} />
            </a>
          ) : <span />}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedPublication(publication)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <Eye size={14} />
              View full details
            </button>
            {isOwner && isResearcherOrAdmin && (
              <>
              <button
                type="button"
                onClick={() => onEditPublication(publication)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <Pencil size={14} />
                Update
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(publication)}
                disabled={deletingId === publication.id}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
              >
                {deletingId === publication.id ? <LoaderCircle size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete
              </button>
              </>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-[#123d35]">Peer-Reviewed Agricultural Studies</h3>
          <p className="mt-0.5 text-xs text-slate-500">Research papers become visible to farmers after admin approval.</p>
        </div>

        {isResearcherOrAdmin && showPublishButton && (
          <button
            type="button"
            onClick={onOpenPublishModal}
            className="flex items-center gap-2 rounded-xl bg-[#16875f] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#064b3b]"
          >
            <Plus size={16} />
            Publish Study (Agricultural Researcher)
          </button>
        )}
      </div>

      {userRole !== "farmer" && (
        <section className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-[#123d35]">My Research</h3>
            <p className="mt-0.5 text-xs text-slate-500">Studies you have published.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {ownPublications.length > 0
              ? ownPublications.map((publication) => renderPublication(publication, true))
              : <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600 sm:col-span-2">No available data</p>}
          </div>
        </section>
      )}

      <section className="space-y-4">
        {userRole !== "farmer" && (
          <div>
            <h3 className="text-lg font-bold text-[#123d35]">Other Researchers&apos; Studies</h3>
            <p className="mt-0.5 text-xs text-slate-500">Published agricultural research from the community.</p>
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          {otherPublications.length > 0
            ? otherPublications.map((publication) => renderPublication(publication, false))
            : <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600 sm:col-span-2">No available data</p>}
        </div>
      </section>
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
      {selectedPublication && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          onClick={() => setSelectedPublication(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="research-publication-detail-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                  selectedPublication.status === "approved"
                    ? "bg-[#e0f5eb] text-[#16875f]"
                    : selectedPublication.status === "declined"
                      ? "bg-rose-50 text-rose-800"
                      : "bg-amber-50 text-amber-800"
                }`}>
                  {selectedPublication.status === "approved"
                    ? "Approved Study"
                    : selectedPublication.status === "declined"
                      ? "Declined — update and resubmit"
                      : "Pending Approval"}
                </span>
                <h2 id="research-publication-detail-title" className="mt-3 text-xl font-extrabold text-[#123d35]">
                  {selectedPublication.title}
                </h2>
                <p className="mt-1 text-sm font-semibold text-[#16875f]">
                  Author: {selectedPublication.researcher_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPublication(null)}
                aria-label="Close research details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span className="rounded-md bg-slate-100 px-3 py-1.5 font-bold text-slate-700">
                Crop: {selectedPublication.crop_type}
              </span>
              <span className="rounded-md bg-slate-100 px-3 py-1.5 font-bold text-slate-700">
                Soil: {selectedPublication.soil_type}
              </span>
              <span className="rounded-md bg-slate-100 px-3 py-1.5 font-bold text-slate-700">
                Published: {selectedPublication.publication_date}
              </span>
            </div>
            <div className="mt-6">
              <h3 className="font-bold text-slate-800">Abstract</h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {selectedPublication.abstract}
              </p>
            </div>
            {selectedPublication.pdf_url && (
              <a
                href={selectedPublication.pdf_url}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#16875f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#064b3b]"
              >
                <FileText size={16} />
                Open publication
                <ExternalLink size={14} />
              </a>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
