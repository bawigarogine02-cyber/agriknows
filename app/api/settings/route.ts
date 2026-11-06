import { getSession } from "@/lib/auth/session";
import {
  getFarms,
  getUserPreferences,
  saveUserPreferences,
  type UserPreferences,
} from "@/lib/db/repository";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const [preferences, farms] = await Promise.all([
      getUserPreferences(session.id),
      getFarms(session.id),
    ]);
    return NextResponse.json({ preferences, farms });
  } catch (error) {
    console.error("Settings fetch failed:", error);
    return NextResponse.json({ error: "Unable to load settings." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: Partial<UserPreferences>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request payload." }, { status: 400 });
  }

  if (
    (body.default_farm_id !== null && typeof body.default_farm_id !== "string") ||
    (body.units !== "metric" && body.units !== "imperial") ||
    typeof body.notify_weather !== "boolean" ||
    typeof body.notify_recommendations !== "boolean"
  ) {
    return NextResponse.json({ error: "Invalid settings values." }, { status: 400 });
  }

  try {
    const preferences = await saveUserPreferences(session.id, {
      default_farm_id: body.default_farm_id || null,
      units: body.units,
      notify_weather: body.notify_weather,
      notify_recommendations: body.notify_recommendations,
    });
    return NextResponse.json({ preferences });
  } catch (error) {
    if (error instanceof Error && error.message === "The selected farm does not belong to this account.") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Settings save failed:", error);
    return NextResponse.json({ error: "Unable to save settings." }, { status: 500 });
  }
}
