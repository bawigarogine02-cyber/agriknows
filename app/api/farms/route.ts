import { getSession } from "@/lib/auth/session";
import { createFarm, deleteFarm, getFarms, updateFarm } from "@/lib/db/repository";
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

  const totalArea = Number(body.total_area);
  if (!body.name?.trim() || body.name.trim().length > 160 || !body.location?.trim() || body.location.trim().length > 255 || !Number.isFinite(totalArea) || totalArea <= 0) {
    return NextResponse.json({ error: "Provide a valid farm name, location, and positive area in hectares." }, { status: 400 });
  }

  try {
    const farm = await createFarm(session.id, {
      name: body.name.trim(),
      location: body.location.trim(),
      soil_type: body.soil_type?.trim() || "Loam",
      total_area: totalArea
    });
    return NextResponse.json({ farm }, { status: 201 });
  } catch (error) {
    console.error("Farm creation failed:", error);
    return NextResponse.json({ error: "Unable to create the farm parcel." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: { id?: string; name?: string; location?: string; soil_type?: string; total_area?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON input" }, { status: 400 });
  }

  const totalArea = Number(body.total_area);
  if (!body.id || !body.name?.trim() || body.name.trim().length > 160 || !body.location?.trim() || body.location.trim().length > 255 || !Number.isFinite(totalArea) || totalArea <= 0) {
    return NextResponse.json({ error: "Provide a farm ID, name, location, and positive total area." }, { status: 400 });
  }
  try {
    const updated = await updateFarm(session.id, body.id, {
      name: body.name.trim(),
      location: body.location.trim(),
      soil_type: body.soil_type?.trim() || "Loam",
      total_area: totalArea,
    });
    if (!updated) return NextResponse.json({ error: "Farm not found or its area is smaller than its fields." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Farm area cannot")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Farm update failed:", error);
    return NextResponse.json({ error: "Unable to update the farm parcel." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON input" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "Farm ID is required." }, { status: 400 });
  try {
    if (!(await deleteFarm(session.id, body.id))) {
      return NextResponse.json({ error: "Farm parcel not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Farm deletion failed:", error);
    return NextResponse.json({ error: "Unable to delete the farm parcel." }, { status: 500 });
  }
}
