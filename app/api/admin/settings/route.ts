import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/authorization";
import { getDb } from "@/lib/db/pool";

export async function GET() {
  const access = await requireAdmin();
  if (access.response) return access.response;
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const queryResult = await db.query("SELECT setting_key AS settingKey, setting_value AS settingValue FROM site_settings ORDER BY setting_key");
  const rows = Array.isArray(queryResult) && Array.isArray(queryResult[0]) ? queryResult[0] : [];
  return NextResponse.json({ settings: rows });
}

export async function PATCH(request: Request) {
  const access = await requireAdmin();
  if (access.response) return access.response;
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const body = (await request.json()) as { settings?: Record<string, string> };
  const allowed = new Set(["site_title", "site_description", "canonical_url"]);
  if (!body.settings || Object.keys(body.settings).some((key) => !allowed.has(key))) return NextResponse.json({ error: "Unsupported setting." }, { status: 400 });
  for (const [key, value] of Object.entries(body.settings)) await db.execute("INSERT INTO site_settings (setting_key, setting_value, updated_by) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_by = VALUES(updated_by)", [key, value.trim(), access.user.id]);
  return NextResponse.json({ ok: true });
}
