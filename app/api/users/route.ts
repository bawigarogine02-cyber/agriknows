import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/pool";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  const [rows] = await db.query("SELECT id, name, email, created_at AS createdAt FROM users ORDER BY name");
  return NextResponse.json({ users: rows });
}
