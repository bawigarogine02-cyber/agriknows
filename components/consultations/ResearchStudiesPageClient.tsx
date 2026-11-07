"use client";

import type { Crop, ResearchPublication } from "@/lib/db/repository";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PublishResearchModal from "./PublishResearchModal";
import ResearchPublicationsFeed from "./ResearchPublicationsFeed";

interface ResearchStudiesPageClientProps {
  crops: Crop[];
  publications: ResearchPublication[];
  userRole: string;
}

export default function ResearchStudiesPageClient({
  crops,
  publications,
  userRole,
}: ResearchStudiesPageClientProps) {
  const router = useRouter();
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  return (
    <>
      <ResearchPublicationsFeed
        publications={publications}
        userRole={userRole}
        onOpenPublishModal={() => setIsPublishModalOpen(true)}
      />
      <PublishResearchModal
        isOpen={isPublishModalOpen}
        crops={crops}
        onClose={() => setIsPublishModalOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
