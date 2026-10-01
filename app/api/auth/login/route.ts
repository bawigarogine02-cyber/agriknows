import { NextResponse } from "next/server";
import { createSessionValue, sessionCookie, SessionUser } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { findUserByEmail } from "@/lib/db/repository";

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

  try {
    const record = await findUserByEmail(email);

    if (!record || !(await verifyPassword(body.password, record.password_hash))) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }

    if (record.status !== "active") {
      return NextResponse.json({ error: "This account is suspended." }, { status: 403 });
    }

    const assignedRole: "farmer" | "researcher" | "admin" = ["farmer", "researcher", "admin"].includes(record.role)
      ? (record.role as "farmer" | "researcher" | "admin")
      : "farmer";

    const sessionUser: SessionUser = {
      id: record.id,
      email: record.email,
      name: record.name,
      role: assignedRole,
      status: record.status,
      address: record.address || "",
    };

    const response = NextResponse.json({ user: sessionUser });
    response.cookies.set(sessionCookie.name, createSessionValue(sessionUser), sessionCookie.options);
    return response;
  } catch (err: unknown) {
    console.error("Login server error:", err);
    return NextResponse.json({ error: "Authentication failed. Please check database connection." }, { status: 500 });
  }
}
