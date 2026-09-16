import { NextResponse } from "next/server";
import { createSessionValue, sessionCookie } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { getDb } from "@/lib/db/pool";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Send a valid JSON request." }, { status: 400 });
  }
  if (!body.email || !body.password || body.password.length < 6) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }
  const email = body.email.trim().toLowerCase();
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Authentication is not configured. Add DATABASE_URL and run the database migration." }, { status: 503 });
  const [rows] = await db.query("SELECT id, name, email, role, status, password_hash AS passwordHash FROM users WHERE email = ? LIMIT 1", [email]);
  const record = (rows as Array<{ id: string; name: string; email: string; role: "admin" | "user"; status: "active" | "suspended"; passwordHash: string }>)[0];
  if (!record || !(await verifyPassword(body.password, record.passwordHash))) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  if (record.status !== "active") return NextResponse.json({ error: "This account is suspended." }, { status: 403 });
  const user = { id: record.id, email: record.email, name: record.name, role: record.role, status: record.status };
  const response = NextResponse.json({ user });
  response.cookies.set(sessionCookie.name, createSessionValue(user), sessionCookie.options);
  return response;
}
