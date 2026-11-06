import { NextResponse } from "next/server";
import { getSession, sessionCookie } from "@/lib/auth/session";
import { addAuditLog } from "@/lib/db/repository";

export async function POST() {
  const session = await getSession();
  if (session) {
    try {
      await addAuditLog(session.id, "Logged Out", "users", "User signed out");
    } catch (auditError) {
      console.error("Logout audit event could not be saved:", auditError);
    }
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookie.name, "", { ...sessionCookie.options, maxAge: 0 });
  return response;
}
