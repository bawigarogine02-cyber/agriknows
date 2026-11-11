import { requireAdmin } from "@/lib/auth/authorization";
import { addAuditLog, deleteAdminFarm, updateAdminFarm } from "@/lib/db/repository";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

function parseFarm(body: Record<string, unknown>) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const location = typeof body.location === "string" ? body.location.trim() : "";
  const soilType = typeof body.soil_type === "string" ? body.soil_type.trim() : "";
  const totalArea = Number(body.total_area);

  if (!name || name.length > 160 || !location || location.length > 255) {
    return { error: "Provide a valid farm name and location." };
  }
  if (soilType.length > 100 || !Number.isFinite(totalArea) || totalArea <= 0) {
    return { error: "Provide a valid soil type and positive total area in hectares." };
  }

  return {
    value: {
      name,
      location,
      soil_type: soilType || "Loam",
      total_area: totalArea,
    },
  };
}

export async function PATCH(request: Request, context: RouteContext) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  const { id } = await context.params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "A valid farm ID is required." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON input." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid farm update." }, { status: 400 });
  }

  const farm = parseFarm(body as Record<string, unknown>);
  if (!farm.value) return NextResponse.json({ error: farm.error }, { status: 400 });

  try {
    if (!(await updateAdminFarm(access.user.id, id, farm.value))) {
      return NextResponse.json({ error: "Farm not found or its area is smaller than the combined area of its fields." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Farm area cannot")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Admin farm update failed:", error);
    return NextResponse.json({ error: "Unable to update the farm parcel." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  const { id } = await context.params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "A valid farm ID is required." }, { status: 400 });
  }

  try {
    if (!(await deleteAdminFarm(id))) {
      return NextResponse.json({ error: "Farm parcel not found." }, { status: 404 });
    }
    await addAuditLog(
      access.user.id,
      "Deleted Farm Parcel",
      "farms",
      `Deleted farm parcel #${id}`
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin farm deletion failed:", error);
    return NextResponse.json({ error: "Unable to delete the farm parcel." }, { status: 500 });
  }
}
