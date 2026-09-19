import ConsultationsContainer from "@/components/consultations/ConsultationsContainer";
import { getSession } from "@/lib/auth/session";
import { getConsultations, getCrops, getPublications } from "@/lib/db/repository";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ConsultationsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/consultations");
  }

  const [consultations, publications, crops] = await Promise.all([
    getConsultations(),
    getPublications(),
    getCrops()
  ]);

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-gradient-to-r from-[#e4f4e5] to-[#e0f5eb] p-6 sm:p-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#16875f]">
          AgriKMS Module 4
        </span>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#064b3b] sm:text-3xl">
          Researcher Consultations & Publications
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#45675e]">
          Communication bridge connecting farmers directly to verified agricultural scientists. Submit diagnostic inquiries, track resolution threads, and read peer-reviewed field research papers.
        </p>
      </header>

      <ConsultationsContainer
        initialConsultations={consultations}
        initialPublications={publications}
        crops={crops}
        userRole={session.role}
      />
    </div>
  );
}
