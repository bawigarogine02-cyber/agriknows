import CropAdvisorClient from "@/components/crop-advisor/CropAdvisorClient";
import { getSession } from "@/lib/auth/session";
import { getCropAdvisorAnalyses } from "@/lib/db/repository";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Crop Advisor | AgriKMS",
  description: "AI-assisted soil and land suitability analysis combining vision models, agricultural research publications, and climate metrics.",
};

export default async function CropAdvisorPage() {
  const user = await getSession();

  if (!user) {
    redirect("/login?next=/crop-advisor");
  }

  const initialAnalyses = await getCropAdvisorAnalyses(user.id);

  return <CropAdvisorClient initialAnalyses={initialAnalyses} />;
}
