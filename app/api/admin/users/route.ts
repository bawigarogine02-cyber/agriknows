import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/authorization";
import { getDb } from "@/lib/db/pool";

export async function GET(request: Request) {
  const access = await requireAdmin();
  if (access.response) return access.response;
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  const params = new URL(request.url).searchParams;
  const search = params.get("search")?.trim() ?? "";
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(5, Number(params.get("pageSize") ?? 10)));
  const like = `%${search}%`;
  const [countRows] = await db.query("SELECT COUNT(*) AS total FROM users WHERE name LIKE ? OR email LIKE ?", [like, like]);
  const [users] = await db.query("SELECT id, name, email, role, status, created_at AS createdAt FROM users WHERE name LIKE ? OR email LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?", [like, like, pageSize, (page - 1) * pageSize]);
  return NextResponse.json({ users, total: Number((countRows as Array<{ total: number }>)[0]?.total ?? 0), page, pageSize });
}

export async function PATCH(request: Request) {
  const access = await requireAdmin();
  if (access.response) return access.response;
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const body = (await request.json()) as { id?: string; role?: "admin" | "user"; status?: "active" | "suspended" };
  if (!body.id || (!body.role && !body.status)) return NextResponse.json({ error: "A user id and update are required." }, { status: 400 });
  if (body.id === access.user.id && body.status === "suspended") return NextResponse.json({ error: "You cannot suspend your own account." }, { status: 400 });
  await db.execute("UPDATE users SET role = COALESCE(?, role), status = COALESCE(?, status) WHERE id = ?", [body.role ?? null, body.status ?? null, body.id]);
  return NextResponse.json({ ok: true });
}