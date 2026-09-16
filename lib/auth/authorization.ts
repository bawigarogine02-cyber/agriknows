import { NextResponse } from "next/server";
import { getSession, type SessionUser } from "@/lib/auth/session";

export async function requireAdmin(): Promise<
  | { user: SessionUser; response: null }
  | { user: null; response: NextResponse }
> {
  const user = await getSession();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: "Authentication required." }, { status: 401 }),
    };
  }

  if (user.role !== "admin" || user.status !== "active") {
    return {
      user: null,
      response: NextResponse.json({ error: "Administrator access required." }, { status: 403 }),
    };
  }

  return { user, response: null };
}
