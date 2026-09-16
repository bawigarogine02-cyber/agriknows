import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/authorization";
import { getDb } from "@/lib/db/pool";

export async function GET() {
  const access = await requireAdmin();
  if (access.response) return access.response;
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  const [[users], [activeUsers], [crops], [analyses], [articles], [recommendations], [recentUsers]] = await Promise.all([
    db.query("SELECT COUNT(*) AS total FROM users"),
    db.query("SELECT COUNT(*) AS total FROM users WHERE status = 'active'"),
    db.query("SELECT COUNT(*) AS total FROM crops"),
    db.query("SELECT COUNT(*) AS total FROM analyses"),
    db.query("SELECT COUNT(*) AS total FROM knowledge_articles"),
    db.query("SELECT COUNT(*) AS total FROM recommendations WHERE status = 'ready'"),
    db.query("SELECT id, name, email, role, status, created_at AS createdAt FROM users ORDER BY created_at DESC LIMIT 5"),
  ]);

  const value = (rows: unknown) => Number((rows as Array<{ total: number }>)[0]?.total ?? 0);
  return NextResponse.json({
    metrics: { users: value(users), activeUsers: value(activeUsers), crops: value(crops), analyses: value(analyses), articles: value(articles), pendingRecommendations: value(recommendations) },
    recentUsers,
  });
}