import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { createSessionValue, sessionCookie } from "@/lib/auth/session";
import { getDb } from "@/lib/db/pool";

export async function POST(request: Request) {
  let body: { name?: string; email?: string; password?: string; confirmPassword?: string };
  try {
    body = (await request.json()) as { name?: string; email?: string; password?: string; confirmPassword?: string };
  } catch {
    return NextResponse.json({ error: "Send a valid JSON request." }, { status: 400 });
  }
  if (!body.name?.trim() || !body.email?.trim() || !body.password || body.password.length < 6 || body.password !== body.confirmPassword) return NextResponse.json({ error: "Provide a name, valid email, matching passwords, and at least six characters." }, { status: 400 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Registration is not configured. Add DATABASE_URL and run the database migration." }, { status: 503 });
  const user = { id: randomUUID(), name: body.name.trim(), email: body.email.trim().toLowerCase(), role: "user" as const, status: "active" as const };
  try {
    await db.execute("INSERT INTO users (id, name, email, role, status, password_hash) VALUES (?, ?, ?, ?, ?, ?)", [user.id, user.name, user.email, user.role, user.status, await hashPassword(body.password)]);
  } catch {
    return NextResponse.json({ error: "That email is already registered or could not be saved." }, { status: 409 });
  }
  const response = NextResponse.json({ user }, { status: 201 });
  response.cookies.set(sessionCookie.name, createSessionValue(user), sessionCookie.options);
  return response;
}
