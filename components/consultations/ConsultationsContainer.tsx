"use client";

import { Consultation, Crop, ResearchPublication } from "@/lib/db/repository";
import { BookOpen, MessageSquare, Plus } from "lucide-react";
import { useState } from "react";
import AskExpertForm from "./AskExpertForm";
import InquiryThreadList from "./InquiryThreadList";
import PublishResearchModal from "./PublishResearchModal";
import ResearchPublicationsFeed from "./ResearchPublicationsFeed";

interface ConsultationsContainerProps {
  initialConsultations: Consultation[];
  initialPublications: ResearchPublication[];
  crops: Crop[];
  userRole?: string;
}

export default function ConsultationsContainer({
  initialConsultations,
  initialPublications,
  crops,
  userRole,
}: ConsultationsContainerProps) {
  const [activeTab, setActiveTab] = useState<"inquiries" | "publications">("inquiries");
  const [consultations, setConsultations] = useState<Consultation[]>(initialConsultations);
  const [publications, setPublications] = useState<ResearchPublication[]>(initialPublications);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  async function reloadConsultations() {
    try {
      const res = await fetch("/api/consultations");
      if (res.ok) {
        const data = await res.json();
        setConsultations(data.consultations);
      }
    } catch {
      // ignore
    }
  }

  async function reloadPublications() {
    try {
      const res = await fetch("/api/publications");
      if (res.ok) {
        const data = await res.json();
        setPublications(data.publications);
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center rounded-xl bg-slate-100 p-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("inquiries")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 transition ${
              activeTab === "inquiries" ? "bg-[#16875f] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare size={16} />
            Farmer Inquiries & Q&A ({consultations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("publications")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 transition ${
              activeTab === "publications" ? "bg-[#16875f] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen size={16} />
            Research Publications Feed ({publications.length})
          </button>
        </div>

        {activeTab === "inquiries" && (
          <button
            type="button"
            onClick={() => setIsAskModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#16875f] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#064b3b]"
          >
            <Plus size={16} />
            Ask an Expert (Farmer View)
          </button>
        )}
      </div>

      {/* Active Tab View */}
      {activeTab === "inquiries" ? (
        <InquiryThreadList consultations={consultations} onReplyAdded={reloadConsultations} />
      ) : (
        <ResearchPublicationsFeed
          publications={publications}
          userRole={userRole}
          onOpenPublishModal={() => setIsPublishModalOpen(true)}
        />
      )}

      {/* Ask Expert Modal */}
      <AskExpertForm
        isOpen={isAskModalOpen}
        crops={crops}
        onClose={() => setIsAskModalOpen(false)}
        onSuccess={reloadConsultations}
      />

      {/* Publish Research Paper Modal */}
      <PublishResearchModal
        isOpen={isPublishModalOpen}
        crops={crops}
        onClose={() => setIsPublishModalOpen(false)}
        onSuccess={reloadPublications}
      />
    </div>
  );
}
