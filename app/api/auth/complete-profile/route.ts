import { NextResponse } from "next/server";
import { createSessionValue, getSession, sessionCookie, SessionUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/pool";

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
  }

  let body: { role?: string; address?: string };
  try {
    body = (await request.json()) as { role?: string; address?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  const roleInput = body.role?.trim().toLowerCase();
  const addressInput = body.address?.trim();

  if (!roleInput || (roleInput !== "farmer" && roleInput !== "researcher")) {
    return NextResponse.json({ error: "Please select a valid role (Farmer or Researcher)." }, { status: 400 });
  }

  if (!addressInput) {
    return NextResponse.json({ error: "Please enter your address." }, { status: 400 });
  }

  const normalizedRole = roleInput as "farmer" | "researcher";
  const db = getDb();

  if (db) {
    try {
      await db.execute("UPDATE users SET role = ?, address = ? WHERE id = ?", [normalizedRole, addressInput, user.id]);
    } catch (err) {
      console.error("Failed to update user profile in database:", err);
    }
  }

  const updatedUser: SessionUser = {
    ...user,
    role: normalizedRole,
    address: addressInput,
    needsOnboarding: false,
  };

  const response = NextResponse.json({ success: true, user: updatedUser, redirectUrl: "/dashboard" }, { status: 200 });
  response.cookies.set(sessionCookie.name, createSessionValue(updatedUser), sessionCookie.options);
  return response;
}
