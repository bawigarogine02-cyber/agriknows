import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import PlantingAdvisor from "@/components/planting/PlantingAdvisor";

export default async function PlantingAdvisorPage() {
  const user = await getSession();
  if (!user) redirect("/login?next=/planting-advisor");
  return <PlantingAdvisor userName={user.name} />;
}
