import AdminFarmsTable from "@/components/admin/AdminFarmsTable";
import { getFarms } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function AdminFarmsPage() {
  const farms = await getFarms("admin");

  return (
    <section className="space-y-6">
      <header className="rounded-2xl bg-[#e4f4e5] p-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#27715d]">Data management</p>
        <h2 className="mt-3 text-3xl font-extrabold text-[#064b3b]">Farms and fields</h2>
        <p className="mt-3 text-base text-[#45675e]">Review registered farms and their related field counts.</p>
      </header>
      <AdminFarmsTable initialFarms={farms} />
    </section>
  );
}
