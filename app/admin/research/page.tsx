import { getCrops, getPublications } from "@/lib/db/repository";
import AdminResearchReview from "@/components/admin/AdminResearchReview";

export const dynamic = "force-dynamic";

export default async function AdminResearchPage() {
  const [publications, crops] = await Promise.all([
    getPublications({ includePending: true }),
    getCrops(),
  ]);

  return (
    <section className="space-y-6">
      <header className="rounded-2xl bg-[#e4f4e5] p-7 sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#27715d]">
          Research management
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#064b3b]">
          Researcher publications
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#45675e]">
          Review agricultural studies submitted by researchers.
        </p>
      </header>

      <AdminResearchReview publications={publications} crops={crops} />
    </section>
  );
}
