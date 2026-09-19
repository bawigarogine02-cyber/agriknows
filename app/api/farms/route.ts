import { getSession } from "@/lib/auth/session";
import { createFarm, getFarms } from "@/lib/db/repository";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  const farms = await getFarms(session.id);
  return NextResponse.json({ farms });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: { name?: string; location?: string; soil_type?: string; total_area?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON input" }, { status: 400 });
  }

  if (!body.name?.trim() || !body.location?.trim() || !body.total_area || body.total_area <= 0) {
    return NextResponse.json({ error: "Provide a valid farm name, location, and positive area in hectares." }, { status: 400 });
  }

  const farm = await createFarm(session.id, {
    name: body.name.trim(),
    location: body.location.trim(),
    soil_type: body.soil_type?.trim() || "Loam",
    total_area: Number(body.total_area)
  });

  return NextResponse.json({ farm }, { status: 201 });
}
