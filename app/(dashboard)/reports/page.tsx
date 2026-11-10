import ReportsAnalytics from "@/components/reports/ReportsAnalytics";
import { getSession } from "@/lib/auth/session";
import { getFields, getRecommendations } from "@/lib/db/repository";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/reports");
  }
  if (session.role === "farmer") {
    redirect("/dashboard");
  }

  const [fields, recommendations] = await Promise.all([
    getFields(session.id),
    getRecommendations(session.id)
  ]);

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-gradient-to-r from-[#e4f4e5] to-[#e0f5eb] p-6 sm:p-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#16875f]">
          AgriKMS Module 5
        </span>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#064b3b] sm:text-3xl">
          Reports & Analytics
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#45675e]">
          Generate aggregated summary metrics, filter historical fertilizer & irrigation advisory outputs, and export structured dataset tables to CSV or PDF print.
        </p>
      </header>

      <ReportsAnalytics fields={fields} recommendations={recommendations} />
    </div>
  );
}