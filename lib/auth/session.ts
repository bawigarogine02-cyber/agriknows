import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db/pool";

const COOKIE_NAME = "agriknow_session";
const SESSION_SECRET = process.env.SESSION_SECRET;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "farmer" | "researcher" | "admin";
  status: "active" | "suspended";
  address?: string;
  needsOnboarding?: boolean;
};
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

function sign(value: string) {
  if (!SESSION_SECRET) {
    throw new Error("SESSION_SECRET is required for authentication.");
  }
  return createHmac("sha256", SESSION_SECRET).update(value).digest("hex");
}

export function createSessionValue(user: SessionUser) {
  const payload = Buffer.from(JSON.stringify({ ...user, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionValue(value: string | undefined): SessionUser | null {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as SessionUser & { exp?: number };
    if (!parsed.id || !parsed.email || !parsed.name || !parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null;
    const validRole: "farmer" | "researcher" | "admin" = ["farmer", "researcher", "admin"].includes(parsed.role)
      ? (parsed.role as "farmer" | "researcher" | "admin")
      : "farmer";
    return {
      id: parsed.id,
      email: parsed.email,
      name: parsed.name,
      role: validRole,
      status: parsed.status === "suspended" ? "suspended" : "active",
      address: parsed.address || "",
      needsOnboarding: Boolean(parsed.needsOnboarding),
    };
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = verifySessionValue(cookieStore.get(COOKIE_NAME)?.value);
  if (!session) return null;

  const db = getDb();
  const [rows] = await db.query(
    "SELECT id, name, email, role, status, address FROM users WHERE id = ? LIMIT 1",
    [session.id]
  );
  const account = (rows as Array<Record<string, unknown>>)[0];
  if (!account || account.status !== "active") return null;

  const role = ["farmer", "researcher", "admin"].includes(String(account.role))
    ? (String(account.role) as SessionUser["role"])
    : "farmer";
  return {
    ...session,
    id: String(account.id),
    name: String(account.name),
    email: String(account.email),
    role,
    status: "active" as const,
    address: account.address ? String(account.address) : "",
  };
}

export const sessionCookie = { name: COOKIE_NAME, options: { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_TTL_SECONDS } };
