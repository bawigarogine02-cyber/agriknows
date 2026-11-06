import { getSession } from "@/lib/auth/session";
import { createField, deleteField, getFields, toggleFieldHarvest, updateField } from "@/lib/db/repository";
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

  const area = Number(body.area);
  const soilPh = Number(body.soil_ph);
  const organicMatter = Number(body.organic_matter);
  if (!body.farm_id || !body.name?.trim() || body.name.trim().length > 160 || !Number.isFinite(area) || area <= 0) {
    return NextResponse.json({ error: "Select a valid farm parcel, provide a field name, and valid field area." }, { status: 400 });
  }
  if (!Number.isFinite(soilPh) || soilPh < 0 || soilPh > 14) {
    return NextResponse.json({ error: "Provide a valid soil pH between 0 and 14." }, { status: 400 });
  }
  if (!Number.isFinite(organicMatter) || organicMatter < 0 || organicMatter > 100) {
    return NextResponse.json({ error: "Provide an organic matter percentage between 0 and 100." }, { status: 400 });
  }
  if (!body.water_source?.trim()) {
    return NextResponse.json({ error: "Select the field's water source." }, { status: 400 });
  }
  if (body.water_source.trim().length > 100 || (body.crop_name?.length ?? 0) > 120) {
    return NextResponse.json({ error: "Water source must be 100 characters or fewer and crop name must be 120 characters or fewer." }, { status: 400 });
  }

  try {
    const field = await createField(session.id, {
      farm_id: body.farm_id,
      name: body.name.trim(),
      area,
      current_crop_id: body.current_crop_id,
      crop_name: body.crop_name,
      planting_date: body.planting_date || new Date().toISOString().split("T")[0],
      soil_ph: soilPh,
      organic_matter: organicMatter,
      water_source: body.water_source.trim()
    });
    return NextResponse.json({ field }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message.includes("Farm parcel not found") || error.message.includes("Combined field area"))) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Field creation failed:", error);
    return NextResponse.json({ error: "Unable to create the field plot." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: {
    field_id?: string;
    name?: string;
    area?: number;
    current_crop_id?: string | null;
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

  if (!body.field_id) {
    return NextResponse.json({ error: "Missing field_id" }, { status: 400 });
  }

  if (body.name !== undefined) {
    const area = Number(body.area);
    const soilPh = Number(body.soil_ph);
    const organicMatter = Number(body.organic_matter);
    const plantingDate = body.planting_date || "";
    if (!body.name.trim() || body.name.trim().length > 160 || (body.crop_name?.length ?? 0) > 120 || !Number.isFinite(area) || area <= 0) {
      return NextResponse.json({ error: "Provide a field name and positive area." }, { status: 400 });
    }
    if (!Number.isFinite(soilPh) || soilPh < 0 || soilPh > 14) {
      return NextResponse.json({ error: "Provide a valid soil pH between 0 and 14." }, { status: 400 });
    }
    if (!Number.isFinite(organicMatter) || organicMatter < 0 || organicMatter > 100) {
      return NextResponse.json({ error: "Provide organic matter between 0 and 100 percent." }, { status: 400 });
    }
    if (!plantingDate || Number.isNaN(Date.parse(plantingDate)) || !body.water_source?.trim() || body.water_source.trim().length > 100) {
      return NextResponse.json({ error: "Provide a valid planting date and water source." }, { status: 400 });
    }
    try {
      const updated = await updateField(session.id, body.field_id, {
        name: body.name.trim(),
        area,
        current_crop_id: body.current_crop_id,
        crop_name: body.crop_name?.trim(),
        planting_date: plantingDate,
        soil_ph: soilPh,
        organic_matter: organicMatter,
        water_source: body.water_source.trim(),
      });
      if (!updated) return NextResponse.json({ error: "Field not found or its area exceeds the farm area." }, { status: 404 });
      return NextResponse.json({ ok: true });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Combined field area")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      console.error("Field update failed:", error);
      return NextResponse.json({ error: "Unable to update the field plot." }, { status: 500 });
    }
  }

  const field = await toggleFieldHarvest(session.id, body.field_id);
  if (!field) return NextResponse.json({ error: "Field record not found." }, { status: 404 });
  return NextResponse.json({ field });
}

export async function DELETE(request: Request) {
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
  if (!body.field_id) return NextResponse.json({ error: "Field ID is required." }, { status: 400 });
  try {
    if (!(await deleteField(session.id, body.field_id))) {
      return NextResponse.json({ error: "Field plot not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Field deletion failed:", error);
    return NextResponse.json({ error: "Unable to delete the field plot." }, { status: 500 });
  }
}
