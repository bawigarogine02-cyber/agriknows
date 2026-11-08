import { NextResponse } from "next/server";
import { addAuditLog, getCrops, createCrop, updateCrop, deleteCrop } from "@/lib/db/repository";
import { requireAdmin, requireRole } from "@/lib/auth/authorization";

export async function GET() {
  const crops = await getCrops();
  return NextResponse.json({ crops });
}

export async function POST(request: Request) {
  const auth = await requireRole(["farmer", "researcher", "admin"]);
  if (auth.response) return auth.response;

  let body: {
    name?: string;
    season?: string;
    ideal_ph_min?: number;
    ideal_ph_max?: number;
    water_requirement?: string;
    growth_days?: number;
    climate?: string;
    companion_crops?: string;
    type?: string;
    category?: string;
    stage?: string;
    detail?: string;
    soil?: string;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON request payload." }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Crop name is required." }, { status: 400 });
  }
  const phMin = Number(body.ideal_ph_min);
  const phMax = Number(body.ideal_ph_max);
  const growthDays = Number(body.growth_days);
  if (!Number.isFinite(phMin) || !Number.isFinite(phMax) || phMin < 0 || phMax > 14 || phMin > phMax) {
    return NextResponse.json({ error: "Provide a valid crop pH range between 0 and 14." }, { status: 400 });
  }
  if (!Number.isInteger(growthDays) || growthDays < 1) {
    return NextResponse.json({ error: "Growth duration must be a positive number of days." }, { status: 400 });
  }

  try {
    const crop = await createCrop({
      name,
      season: body.season?.trim() || "Wet Season",
      ideal_ph_min: phMin,
      ideal_ph_max: phMax,
      water_requirement: body.water_requirement?.trim() || "400 - 600 mm",
      growth_days: growthDays,
      climate: body.climate?.trim() || "Warm Subtropical",
      companion_crops: body.companion_crops?.trim() || "Legumes, Basil",
      type: body.type?.trim() || "Agricultural Variety",
      category: body.category?.trim() || "Legumes",
      stage: body.stage?.trim() || "Planting / Seedling",
      detail: body.detail?.trim() || "Cultivated variety managed in workspace field records.",
      soil: body.soil?.trim() || "",
    });

    await addAuditLog(auth.user.id, "Added Crop Catalog Entry", "crops", `Added crop '${crop.name}'`);
    return NextResponse.json({ crop }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create crop entry.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  let body: {
    id?: string;
    name?: string;
    season?: string;
    ideal_ph_min?: number;
    ideal_ph_max?: number;
    water_requirement?: string;
    growth_days?: number;
    climate?: string;
    companion_crops?: string;
    type?: string;
    category?: string;
    stage?: string;
    detail?: string;
    soil?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request payload." }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: "Crop ID is required." }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Crop name is required." }, { status: 400 });
  }
  const phMin = Number(body.ideal_ph_min);
  const phMax = Number(body.ideal_ph_max);
  const growthDays = Number(body.growth_days);
  if (!Number.isFinite(phMin) || !Number.isFinite(phMax) || phMin < 0 || phMax > 14 || phMin > phMax) {
    return NextResponse.json({ error: "Provide a valid crop pH range between 0 and 14." }, { status: 400 });
  }
  if (!Number.isInteger(growthDays) || growthDays < 1) {
    return NextResponse.json({ error: "Growth duration must be a positive number of days." }, { status: 400 });
  }

  try {
    const crop = await updateCrop(body.id, {
      name,
      season: body.season?.trim() || "Wet Season",
      ideal_ph_min: phMin,
      ideal_ph_max: phMax,
      water_requirement: body.water_requirement?.trim() || "400 - 600 mm",
      growth_days: growthDays,
      climate: body.climate?.trim() || "Warm Subtropical",
      companion_crops: body.companion_crops?.trim() || "Legumes, Basil",
      type: body.type?.trim() || "Agricultural Variety",
      category: body.category?.trim() || "Legumes",
      stage: body.stage?.trim() || "Planting / Seedling",
      detail: body.detail?.trim() || "Cultivated variety managed in workspace field records.",
      soil: body.soil?.trim() || "",
    });

    if (!crop) {
      return NextResponse.json({ error: "Crop record not found." }, { status: 404 });
    }

    await addAuditLog(auth.user.id, "Updated Crop Catalog Entry", "crops", `Updated crop '${crop.name}'`);
    return NextResponse.json({ crop });
  } catch (error) {
    console.error("Crop update failed:", error);
    return NextResponse.json({ error: "Unable to update the crop record." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request payload." }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "Crop ID is required." }, { status: 400 });

  try {
    const crop = (await getCrops()).find((item) => item.id === body.id);
    if (!(await deleteCrop(body.id))) {
      return NextResponse.json({ error: "Crop record not found." }, { status: 404 });
    }
    await addAuditLog(auth.user.id, "Deleted Crop Catalog Entry", "crops", `Deleted crop '${crop?.name || body.id}'`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Crop deletion failed:", error);
    return NextResponse.json({ error: "Unable to delete the crop record." }, { status: 500 });
  }
}
