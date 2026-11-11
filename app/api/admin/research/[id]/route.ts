import { requireAdmin } from "@/lib/auth/authorization";
import {
  addAuditLog,
  deleteAdminPublication,
  setPublicationStatus,
  updateAdminPublication,
} from "@/lib/db/repository";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  const { id } = await context.params;
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return NextResponse.json({ error: "Invalid research update." }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid research update." }, { status: 400 });
  }

  try {
    if ("status" in body) {
      if (body.status !== "approved" && body.status !== "declined") {
        return NextResponse.json({ error: "Choose approved or declined status." }, { status: 400 });
      }
      const status = body.status;
      if (!(await setPublicationStatus(id, status))) {
        return NextResponse.json({ error: "Pending research paper not found." }, { status: 404 });
      }
      await addAuditLog(
        access.user.id,
        status === "approved" ? "Approved Research Paper" : "Declined Research Paper",
        "research_publications",
        `${status === "approved" ? "Approved" : "Declined"} research paper #${id}`
      );
      return NextResponse.json({ ok: true });
    }

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const abstract = typeof body.abstract === "string" ? body.abstract.trim() : "";
    const cropType = typeof body.crop_type === "string" ? body.crop_type.trim() : "";
    const soilType = typeof body.soil_type === "string" ? body.soil_type.trim() : "";
    const pdfUrl = typeof body.pdf_url === "string" ? body.pdf_url.trim() : "";
    if (!title || !abstract || !cropType) {
      return NextResponse.json({ error: "Provide study title, abstract summary, and crop type." }, { status: 400 });
    }
    if (title.length > 255 || cropType.length > 120 || soilType.length > 100 || pdfUrl.length > 500) {
      return NextResponse.json({ error: "One or more publication fields exceed the allowed length." }, { status: 400 });
    }
    if (pdfUrl) {
      try {
        const url = new URL(pdfUrl);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          return NextResponse.json({ error: "Provide a valid HTTP or HTTPS publication URL." }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ error: "Provide a valid HTTP or HTTPS publication URL." }, { status: 400 });
      }
    }
    const updated = await updateAdminPublication(id, {
      title,
      abstract,
      crop_type: cropType,
      soil_type: soilType || "All Soil Types",
      pdf_url: pdfUrl,
    });
    if (!updated) {
      return NextResponse.json({ error: "Research paper not found." }, { status: 404 });
    }
    await addAuditLog(
      access.user.id,
      "Updated Research Paper",
      "research_publications",
      `Updated research paper #${id}: '${title}'`
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Research paper review failed:", error);
    return NextResponse.json({ error: "Unable to update the research paper." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  const { id } = await context.params;
  try {
    if (!(await deleteAdminPublication(id))) {
      return NextResponse.json({ error: "Research paper not found." }, { status: 404 });
    }
    await addAuditLog(
      access.user.id,
      "Deleted Research Paper",
      "research_publications",
      `Deleted research paper #${id}`
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Research paper deletion failed:", error);
    return NextResponse.json({ error: "Unable to delete the research paper." }, { status: 500 });
  }
}
