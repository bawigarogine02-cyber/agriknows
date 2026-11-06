import DashboardHome from "@/components/dashboard/DashboardHome";
import { getSession } from "@/lib/auth/session";
import {
  getArticles,
  getCrops,
  getFields,
  getLatestWeatherSnapshot,
  getRecommendations,
} from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const [fields, recommendations, articles, crops, weather] = await Promise.all([
    getFields(session.id),
    getRecommendations(session.id),
    getArticles(),
    getCrops(),
    getLatestWeatherSnapshot(session.id),
  ]);

  return (
    <DashboardHome
      initialFields={fields}
      recommendations={recommendations}
      articles={articles}
      initialCrops={crops}
      weatherSnapshot={weather}
    />
  );
}
