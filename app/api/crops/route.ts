import { NextResponse } from "next/server";
import { getCrops, createCrop } from "@/lib/db/repository";
import { requireAuth } from "@/lib/auth/authorization";

export async function GET() {
  const crops = await getCrops();
  return NextResponse.json({ crops });
}

export async function POST(request: Request) {
  const auth = await requireAuth();
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
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON request payload." }, { status: 400 });
  }

  if (!body.name || !body.name.trim()) {
    return NextResponse.json({ error: "Crop name is required." }, { status: 400 });
  }

  try {
    const crop = await createCrop({
      name: body.name.trim(),
      season: body.season?.trim() || "Wet Season",
      ideal_ph_min: Number(body.ideal_ph_min) || 6.0,
      ideal_ph_max: Number(body.ideal_ph_max) || 7.5,
      water_requirement: body.water_requirement?.trim() || "400 - 600 mm",
      growth_days: Number(body.growth_days) || 90,
      climate: body.climate?.trim() || "Warm Subtropical",
      companion_crops: body.companion_crops?.trim() || "Legumes, Basil",
      type: body.type?.trim() || "Agricultural Variety",
      category: body.category?.trim() || "Legumes",
      stage: body.stage?.trim() || "Planting / Seedling",
      detail: body.detail?.trim() || "Cultivated variety managed in workspace field records.",
    });

    return NextResponse.json({ crop }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create crop entry.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
