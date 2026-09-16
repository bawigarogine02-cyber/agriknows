import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/authorization";
import { getDb } from "@/lib/db/pool";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireAdmin();
  if (access.response) return access.response;
  const { id } = await params;
  if (id === access.user.id) return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  await db.execute("DELETE FROM users WHERE id = ?", [id]);
  return NextResponse.json({ ok: true });
}