"use client";

import type { Crop } from "@/lib/db/repository";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PublishKnowledgeModal from "./PublishKnowledgeModal";
import PublishResearchModal from "./PublishResearchModal";

type KnowledgeTab = "research" | "pests" | "guides" | "articles";

interface ResearchPublishingActionsProps {
  crops: Crop[];
  userRole: string;
  onSelectTab?: (tab: KnowledgeTab) => void;
}

export default function ResearchPublishingActions({
  crops,
  userRole,
  onSelectTab,
}: ResearchPublishingActionsProps) {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<"pest" | "guide" | "article" | "research" | null>(null);

  function openModal(modal: NonNullable<typeof activeModal>) {
    if (modal === "pest" || modal === "guide" || modal === "article") {
      onSelectTab?.(modal === "pest" ? "pests" : modal === "guide" ? "guides" : "articles");
    }
    setActiveModal(modal);
  }

  function closeModal() {
    setActiveModal(null);
  }

  return (
    <>
      {(userRole === "researcher" || userRole === "admin") && (
        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => openModal("pest")}
            className="rounded-xl border border-[#16875f] px-4 py-2.5 text-xs font-bold text-[#16875f] hover:bg-[#e0f5eb]"
          >
            Add Pest or Disease
          </button>
          <button
            type="button"
            onClick={() => openModal("guide")}
            className="rounded-xl border border-[#16875f] px-4 py-2.5 text-xs font-bold text-[#16875f] hover:bg-[#e0f5eb]"
          >
            Add Guide
          </button>
          <button
            type="button"
            onClick={() => openModal("article")}
            className="rounded-xl border border-[#16875f] px-4 py-2.5 text-xs font-bold text-[#16875f] hover:bg-[#e0f5eb]"
          >
            Add Article
          </button>
          <button
            type="button"
            onClick={() => openModal("research")}
            className="rounded-xl bg-[#16875f] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#064b3b]"
          >
            Publish Study
          </button>
        </div>
      )}

      <PublishKnowledgeModal
        isOpen={activeModal === "pest"}
        kind="pest"
        crops={crops}
        userRole={userRole}
        onClose={closeModal}
        onSuccess={() => router.refresh()}
      />
      <PublishKnowledgeModal
        isOpen={activeModal === "guide"}
        kind="guide"
        crops={crops}
        userRole={userRole}
        onClose={closeModal}
        onSuccess={() => router.refresh()}
      />
      <PublishKnowledgeModal
        isOpen={activeModal === "article"}
        kind="article"
        crops={crops}
        userRole={userRole}
        onClose={closeModal}
        onSuccess={() => router.refresh()}
      />
      {activeModal === "research" && (
        <PublishResearchModal
          isOpen
          crops={crops}
          onClose={closeModal}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  );
}
