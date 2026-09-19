import DecisionEngine from "@/components/decision-support/DecisionEngine";
import { getSession } from "@/lib/auth/session";
import { getFields, getRecommendations } from "@/lib/db/repository";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DecisionSupportPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/decision-support");
  }

  const [fields, recommendations] = await Promise.all([
    getFields(session.id),
    getRecommendations(session.id)
  ]);

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-gradient-to-r from-[#e4f4e5] to-[#e0f5eb] p-6 sm:p-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#16875f]">
          AgriKMS Module 2
        </span>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#064b3b] sm:text-3xl">
          Decision Support Engine
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#45675e]">
          Match your logged farm parameters against predefined agricultural rule matrices to generate specific N-P-K fertilizer schedules and irrigation volume guidance.
        </p>
      </header>

      <DecisionEngine fields={fields} recentRecommendations={recommendations} />
    </div>
  );
}
