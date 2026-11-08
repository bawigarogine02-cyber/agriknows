import { getPublications } from "@/lib/db/repository";
import { ExternalLink, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminResearchPage() {
  const publications = await getPublications();

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

      <section className="rounded-xl bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-xl font-bold text-[#123d35]">Published studies</h2>
          <p className="mt-1 text-sm text-slate-500">
            {publications.length} {publications.length === 1 ? "study" : "studies"}
          </p>
        </div>

        {publications.length === 0 ? (
          <p className="p-8 text-slate-500">No researcher studies have been published yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {publications.map((publication) => (
              <article key={publication.id} className="space-y-4 p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold leading-snug text-[#123d35]">
                      {publication.title}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-[#16875f]">
                      Researcher: {publication.researcher_name}
                    </p>
                  </div>
                  <time
                    className="shrink-0 text-sm text-slate-500"
                    dateTime={publication.publication_date}
                  >
                    {publication.publication_date}
                  </time>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
                    Crop: {publication.crop_type}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
                    Soil: {publication.soil_type}
                  </span>
                </div>

                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {publication.abstract}
                </p>

                {publication.pdf_url && (
                  <a
                    href={publication.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <FileText size={16} />
                    View publication
                    <ExternalLink size={14} />
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
