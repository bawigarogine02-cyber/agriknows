import CropsPageClient from "@/components/crops/CropsPageClient";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function CropsPage() {
  const session = await getSession();

  return (
    <CropsPageClient
      canAddCrop={session?.role === "researcher"}
      canDeleteCrop={session?.role === "admin"}
    />
  );
}
