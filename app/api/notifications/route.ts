import { getSession } from "@/lib/auth/session";
import { getUserNotifications, markUserNotificationRead } from "@/lib/db/repository";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const result = await getUserNotifications(session.id);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  } catch (error) {
    console.error("Notification fetch failed:", error);
    return NextResponse.json({ error: "Unable to load notifications." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
  }
  if (
    typeof body !== "object" ||
    body === null ||
    !("markAll" in body || ("id" in body && typeof body.id === "string" && body.id.trim()))
  ) {
    return NextResponse.json({ error: "Provide a notification ID or markAll=true." }, { status: 400 });
  }
  const markAll = "markAll" in body && body.markAll === true;
  const id = "id" in body && typeof body.id === "string" ? body.id.trim() : "";
  if (!markAll && !id) {
    return NextResponse.json({ error: "Provide a notification ID or markAll=true." }, { status: 400 });
  }

  try {
    await markUserNotificationRead(session.id, markAll ? undefined : id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Notification update failed:", error);
    return NextResponse.json({ error: "Unable to update notifications." }, { status: 500 });
  }
}
