import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/authorization";
import { getDb } from "@/lib/db/pool";
import { addAuditLog } from "@/lib/db/repository";

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
  let body: { settings?: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
  }
  const allowed = new Set(["site_title", "site_description", "canonical_url"]);
  if (!body.settings || Object.keys(body.settings).some((key) => !allowed.has(key))) return NextResponse.json({ error: "Unsupported setting." }, { status: 400 });
  if (Object.values(body.settings).some((value) => typeof value !== "string" || value.length > 2000)) {
    return NextResponse.json({ error: "Setting values must be text no longer than 2,000 characters." }, { status: 400 });
  }
  for (const [key, value] of Object.entries(body.settings)) {
    await db.execute("INSERT INTO site_settings (setting_key, setting_value, updated_by) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_by = VALUES(updated_by)", [key, value.trim(), access.user.id]);
  }
  await addAuditLog(access.user.id, "Updated Site Settings", "site_settings", `Updated ${Object.keys(body.settings).length} site setting(s)`);
  return NextResponse.json({ ok: true });
}
