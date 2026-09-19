"use client";

import { ResearchPublication } from "@/lib/db/repository";
import { BookOpen, ExternalLink, FileText, Plus, UserCheck } from "lucide-react";

interface ResearchPublicationsFeedProps {
  publications: ResearchPublication[];
  userRole?: string;
  onOpenPublishModal: () => void;
}

export default function ResearchPublicationsFeed({
  publications,
  userRole,
  onOpenPublishModal,
}: ResearchPublicationsFeedProps) {
  const isResearcherOrAdmin = userRole === "researcher" || userRole === "admin";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-[#123d35]">Peer-Reviewed Agricultural Studies</h3>
          <p className="mt-0.5 text-xs text-slate-500">Research papers contributed by verified scientists & agronomists.</p>
        </div>

        {isResearcherOrAdmin && (
          <button
            type="button"
            onClick={onOpenPublishModal}
            className="flex items-center gap-2 rounded-xl bg-[#16875f] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#064b3b]"
          >
            <Plus size={16} />
            Publish Study (Researcher View)
          </button>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {publications.map((pub) => (
          <article key={pub.id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 rounded-full bg-[#e0f5eb] px-3 py-1 text-xs font-bold text-[#16875f]">
                  <UserCheck size={14} />
                  Verified Study
                </span>
                <span className="text-xs font-semibold text-slate-400">{pub.publication_date}</span>
              </div>

              <h4 className="mt-3 text-lg font-bold text-[#123d35] leading-snug">{pub.title}</h4>
              <p className="mt-1 text-xs font-semibold text-[#16875f]">Author: {pub.researcher_name}</p>

              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-700">Crop: {pub.crop_type}</span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-700">Soil: {pub.soil_type}</span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-slate-600 line-clamp-4">{pub.abstract}</p>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <a
                href={pub.pdf_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-[#16875f] hover:text-white"
              >
                <FileText size={15} />
                Access Publication / PDF Link
                <ExternalLink size={13} />
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
