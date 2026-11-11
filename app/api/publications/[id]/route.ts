import { requireResearcher } from "@/lib/auth/authorization";
import { deletePublication, updatePublication } from "@/lib/db/repository";
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

function parsePublication(body: Record<string, unknown>) {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const abstract = typeof body.abstract === "string" ? body.abstract.trim() : "";
  const cropType = typeof body.crop_type === "string" ? body.crop_type.trim() : "";
  const soilType = typeof body.soil_type === "string" ? body.soil_type.trim() : "";
  const pdfUrl = typeof body.pdf_url === "string" ? body.pdf_url.trim() : "";

  if (!title || !abstract || !cropType) {
    return { error: "Provide study title, abstract summary, and target crop type." };
  }
  if (title.length > 255 || cropType.length > 120 || soilType.length > 100 || pdfUrl.length > 500) {
    return { error: "One or more publication fields exceed the allowed length." };
  }
  if (pdfUrl) {
    try {
      const url = new URL(pdfUrl);
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        return { error: "Provide a valid HTTP or HTTPS publication URL." };
      }
    } catch {
      return { error: "Provide a valid HTTP or HTTPS publication URL." };
    }
  }

  return {
    value: {
      title,
      abstract,
      crop_type: cropType,
      soil_type: soilType || "All Soil Types",
      pdf_url: pdfUrl,
    },
  };
}

export async function PATCH(request: Request, context: RouteContext) {
  const access = await requireResearcher();
  if (access.response) return access.response;

  const { id } = await context.params;
  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Invalid JSON input." }, { status: 400 });
  const parsed = parsePublication(body);
  if (!parsed.value) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    if (!(await updatePublication(access.user.id, id, parsed.value))) {
      return NextResponse.json({ error: "Research paper not found or you do not own it." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Research paper update failed:", error);
    return NextResponse.json({ error: "Unable to update the research paper." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const access = await requireResearcher();
  if (access.response) return access.response;

  const { id } = await context.params;
  try {
    if (!(await deletePublication(access.user.id, id))) {
      return NextResponse.json({ error: "Research paper not found or you do not own it." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Research paper deletion failed:", error);
    return NextResponse.json({ error: "Unable to delete the research paper." }, { status: 500 });
  }
}
