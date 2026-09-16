import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hashPassword } from "@/lib/auth/password";
import { createSessionValue, sessionCookie } from "@/lib/auth/session";
import { getDb } from "@/lib/db/pool";

type GoogleTokenResponse = { access_token?: string };
type GoogleProfile = { id?: string; email?: string; name?: string };

function getAppBaseUrl(request: Request): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  if (host && !host.includes("0.0.0.0")) {
    return `${proto}://${host}`;
  }
  return new URL(request.url).origin;
}

export async function GET(request: Request) {
  const baseUrl = getAppBaseUrl(request);
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const oauthError = requestUrl.searchParams.get("error");
  const returnedState = requestUrl.searchParams.get("state");
  const storedState = (await cookies()).get("agriknow_google_oauth_state")?.value;

  if (oauthError || !code || !returnedState || !storedState || returnedState !== storedState) {
    return NextResponse.redirect(`${baseUrl}/login?error=google_cancelled`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/auth/google/callback`;
  const db = getDb();

  if (!clientId || !clientSecret || !db) {
    return NextResponse.redirect(`${baseUrl}/login?error=google_unavailable`);
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }),
    });
    const tokens = (await tokenResponse.json()) as GoogleTokenResponse;
    if (!tokenResponse.ok || !tokens.access_token) throw new Error("Google token exchange failed");

    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${tokens.access_token}` } });
    const profile = (await profileResponse.json()) as GoogleProfile;
    if (!profileResponse.ok || !profile.email || !profile.name) throw new Error("Google profile is incomplete");

    const email = profile.email.trim().toLowerCase();
    const [rows] = await db.query("SELECT id, name, email, role, status FROM users WHERE email = ? LIMIT 1", [email]);
    let user = (rows as Array<{ id: string; name: string; email: string; role: "admin" | "user"; status: "active" | "suspended" }>)[0];

    if (!user) {
      user = { id: randomUUID(), name: profile.name.trim(), email, role: "user", status: "active" };
      await db.execute("INSERT INTO users (id, name, email, role, status, password_hash) VALUES (?, ?, ?, ?, ?, ?)", [user.id, user.name, user.email, user.role, user.status, await hashPassword(randomUUID())]);
    }

    if (user.status !== "active") return NextResponse.redirect(`${baseUrl}/login?error=account_suspended`);
    const response = NextResponse.redirect(`${baseUrl}/dashboard`);
    response.cookies.set(sessionCookie.name, createSessionValue(user), sessionCookie.options);
    response.cookies.set("agriknow_google_oauth_state", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production" || baseUrl.startsWith("https"),
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(`${baseUrl}/login?error=google_failed`);
  }
}