import { requireAdmin } from "@/lib/auth/authorization";
import {
  addAuditLog,
  deletePestDisease,
  getCrops,
  updatePestDisease,
  type PestDiseaseInput,
} from "@/lib/db/repository";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) return null;
    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

function parsePest(body: Record<string, unknown>): PestDiseaseInput | string {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const type = typeof body.type === "string" ? body.type.trim() : "";
  const cropId = typeof body.crop_id === "string" ? body.crop_id.trim() : "";
  const symptoms = typeof body.symptoms === "string" ? body.symptoms.trim() : "";
  const prevention = typeof body.prevention === "string" ? body.prevention.trim() : "";
  const treatment = typeof body.treatment === "string" ? body.treatment.trim() : "";

  if (!name || !type || !symptoms || !prevention || !treatment) {
    return "Name, classification, symptoms, prevention, and treatment are required.";
  }
  if (name.length > 160 || type.length > 80) {
    return "Name or classification exceeds the allowed length.";
  }
  if ([symptoms, prevention, treatment].some((value) => value.length > 65535)) {
    return "Pest and disease descriptions must be 65,535 characters or fewer.";
  }
  if (cropId && !/^\d+$/.test(cropId)) {
    return "Choose a valid crop or select All Crops.";
  }

  return {
    crop_id: cropId || null,
    name,
    type,
    symptoms,
    prevention,
    treatment,
  };
}

export async function PATCH(request: Request, context: RouteContext) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  const { id } = await context.params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "A valid pest or disease ID is required." }, { status: 400 });
  }
  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Invalid JSON input." }, { status: 400 });
  const pest = parsePest(body);
  if (typeof pest === "string") return NextResponse.json({ error: pest }, { status: 400 });

  try {
    if (pest.crop_id && !(await getCrops()).some((crop) => crop.id === pest.crop_id)) {
      return NextResponse.json({ error: "The selected crop could not be found." }, { status: 400 });
    }
    if (!(await updatePestDisease(id, pest))) {
      return NextResponse.json({ error: "Pest or disease entry not found." }, { status: 404 });
    }
    await addAuditLog(
      access.user.id,
      "Updated Pest or Disease Entry",
      "pests_diseases",
      `Updated '${pest.name}'`
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Pest or disease update failed:", error);
    return NextResponse.json({ error: "Unable to update the pest or disease entry." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  const { id } = await context.params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "A valid pest or disease ID is required." }, { status: 400 });
  }

  try {
    if (!(await deletePestDisease(id))) {
      return NextResponse.json({ error: "Pest or disease entry not found." }, { status: 404 });
    }
    await addAuditLog(
      access.user.id,
      "Deleted Pest or Disease Entry",
      "pests_diseases",
      `Deleted pest or disease #${id}`
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Pest or disease deletion failed:", error);
    return NextResponse.json({ error: "Unable to delete the pest or disease entry." }, { status: 500 });
  }
}
