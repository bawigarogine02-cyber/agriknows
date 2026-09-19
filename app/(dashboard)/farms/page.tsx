import FarmCardGrid from "@/components/farms/FarmCardGrid";
import { getSession } from "@/lib/auth/session";
import { getCrops, getFarms, getFields } from "@/lib/db/repository";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FarmsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/farms");
  }

  const [farms, fields, crops] = await Promise.all([
    getFarms(session.id),
    getFields(session.id),
    getCrops()
  ]);

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-gradient-to-r from-[#e4f4e5] to-[#e0f5eb] p-6 sm:p-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#16875f]">
          AgriKMS Module 1
        </span>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#064b3b] sm:text-3xl">
          Farm & Field Management
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#45675e]">
          Maintain land parcels, crop cycles, soil parameters, and water sources. These inputs form the exact data baseline evaluated by the Decision Support Engine.
        </p>
      </header>

      <FarmCardGrid initialFarms={farms} initialFields={fields} crops={crops} />
    </div>
  );
}
