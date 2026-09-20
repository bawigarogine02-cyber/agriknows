import { NextResponse } from "next/server";
import { getSession, type SessionUser } from "@/lib/auth/session";

export type AllowedRole = "farmer" | "researcher" | "admin";

export async function requireAuth(): Promise<
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

  if (user.status === "suspended") {
    return {
      user: null,
      response: NextResponse.json({ error: "Account suspended. Access denied." }, { status: 403 }),
    };
  }

  return { user, response: null };
}

export async function requireRole(allowedRoles: AllowedRole[]): Promise<
  | { user: SessionUser; response: null }
  | { user: null; response: NextResponse }
> {
  const auth = await requireAuth();
  if (auth.response) return auth;

  if (!allowedRoles.includes(auth.user.role)) {
    return {
      user: null,
      response: NextResponse.json(
        { error: `Forbidden. Requires one of the following roles: ${allowedRoles.join(", ")}.` },
        { status: 403 }
      ),
    };
  }

  return { user: auth.user, response: null };
}

export async function requireFarmer(): Promise<
  | { user: SessionUser; response: null }
  | { user: null; response: NextResponse }
> {
  return requireRole(["farmer", "admin"]);
}

export async function requireResearcher(): Promise<
  | { user: SessionUser; response: null }
  | { user: null; response: NextResponse }
> {
  return requireRole(["researcher", "admin"]);
}

export async function requireAdmin(): Promise<
  | { user: SessionUser; response: null }
  | { user: null; response: NextResponse }
> {
  return requireRole(["admin"]);
}
