import { redirect } from "next/navigation";
import AnalysisHistory from "@/components/planting/AnalysisHistory";
import { getSession } from "@/lib/auth/session";

export default async function PlantingAdvisorHistoryPage() {
  const user = await getSession();
  if (!user) redirect("/login?next=/planting-advisor/history");
  return <AnalysisHistory />;
}
