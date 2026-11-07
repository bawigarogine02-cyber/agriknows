import ResearchStudiesPageClient from "@/components/consultations/ResearchStudiesPageClient";
import { getSession } from "@/lib/auth/session";
import { getCrops, getPublications } from "@/lib/db/repository";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ResearchStudiesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/research-studies");
  }
  if (session.role !== "researcher" && session.role !== "admin") {
    redirect("/consultations");
  }

  const [publications, crops] = await Promise.all([getPublications(), getCrops()]);

  return (
    <section className="space-y-6">
      <header className="rounded-2xl bg-gradient-to-r from-[#e4f4e5] to-[#e0f5eb] p-6 sm:p-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#16875f]">
          Research workspace
        </span>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#064b3b] sm:text-3xl">
          My Research &amp; Studies
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#45675e]">
          Publish agricultural studies and share your findings with farmers and the research community.
        </p>
      </header>

      <ResearchStudiesPageClient
        crops={crops}
        publications={publications}
        userRole={session.role}
      />
    </section>
  );
}
