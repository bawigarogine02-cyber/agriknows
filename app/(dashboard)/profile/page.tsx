import ProfileEditor from "@/components/profile/ProfileEditor";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getSession();
  if (!user) redirect("/login?next=/profile");

  return <ProfileEditor user={user} />;
}
