import AdminRecommendationActivity from "@/components/admin/AdminRecommendationActivity";
import { getRecommendations } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function AdminRecommendationsPage() {
  const recommendations = await getRecommendations("admin");

  return (
    <section className="space-y-6">
      <header className="rounded-2xl bg-[#e4f4e5] p-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#27715d]">Data management</p>
        <h2 className="mt-3 text-3xl font-extrabold text-[#064b3b]">Crop advisor activity</h2>
        <p className="mt-3 text-base text-[#45675e]">Review recent advisory events, crop recommendations, and system-generated guidance across all fields.</p>
      </header>
      <AdminRecommendationActivity recommendations={recommendations} />
    </section>
  );
}
