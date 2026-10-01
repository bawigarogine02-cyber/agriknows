import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { createSessionValue, sessionCookie, SessionUser } from "@/lib/auth/session";
import { createUserRecord, findUserByEmail } from "@/lib/db/repository";

export async function POST(request: Request) {
  let body: { name?: string; email?: string; password?: string; confirmPassword?: string; role?: string; address?: string };
  try {
    body = (await request.json()) as { name?: string; email?: string; password?: string; confirmPassword?: string; role?: string; address?: string };
  } catch {
    return NextResponse.json({ error: "Send a valid JSON request." }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const confirmPassword = body.confirmPassword;
  const address = body.address?.trim() || "";

  if (!name || !email || !password || password.length < 6 || password !== confirmPassword) {
    return NextResponse.json({ error: "Provide a name, valid email, matching passwords, and at least six characters." }, { status: 400 });
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return NextResponse.json({ error: "That email address is already registered." }, { status: 409 });
  }

  const roleInput = body.role?.toLowerCase();
  const assignedRole: "farmer" | "researcher" = roleInput === "researcher" ? "researcher" : "farmer";

  const userId = randomUUID();
  const password_hash = await hashPassword(password);

  try {
    await createUserRecord({
      id: userId,
      name,
      email,
      role: assignedRole,
      status: "active",
      password_hash,
      address,
    });

    const sessionUser: SessionUser = {
      id: userId,
      name,
      email,
      role: assignedRole,
      status: "active",
      address,
      needsOnboarding: false,
    };

    const response = NextResponse.json({ user: sessionUser }, { status: 201 });
    response.cookies.set(sessionCookie.name, createSessionValue(sessionUser), sessionCookie.options);
    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to complete account registration.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
