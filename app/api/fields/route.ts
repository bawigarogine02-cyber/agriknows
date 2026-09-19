import { getSession } from "@/lib/auth/session";
import { createField, getFields, toggleFieldHarvest } from "@/lib/db/repository";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  const fields = await getFields(session.id);
  return NextResponse.json({ fields });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: {
    farm_id?: string;
    name?: string;
    area?: number;
    current_crop_id?: string;
    crop_name?: string;
    planting_date?: string;
    soil_ph?: number;
    organic_matter?: number;
    water_source?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON input" }, { status: 400 });
  }

  if (!body.farm_id || !body.name?.trim() || !body.area || body.area <= 0) {
    return NextResponse.json({ error: "Select a valid farm parcel, provide a field name, and valid field area." }, { status: 400 });
  }

  const field = await createField(session.id, {
    farm_id: body.farm_id,
    name: body.name.trim(),
    area: Number(body.area),
    current_crop_id: body.current_crop_id,
    crop_name: body.crop_name,
    planting_date: body.planting_date || new Date().toISOString().split("T")[0],
    soil_ph: body.soil_ph ? Number(body.soil_ph) : 6.5,
    organic_matter: body.organic_matter ? Number(body.organic_matter) : 2.5,
    water_source: body.water_source || "Rainfed"
  });

  return NextResponse.json({ field }, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: { field_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON input" }, { status: 400 });
  }

  if (!body.field_id) {
    return NextResponse.json({ error: "Missing field_id" }, { status: 400 });
  }

  const field = await toggleFieldHarvest(session.id, body.field_id);
  if (!field) {
    return NextResponse.json({ error: "Field record not found" }, { status: 404 });
  }

  return NextResponse.json({ field });
}
