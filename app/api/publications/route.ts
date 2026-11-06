import { requireResearcher } from "@/lib/auth/authorization";
import { createPublication, getPublications } from "@/lib/db/repository";
import { NextResponse } from "next/server";

export async function GET() {
  const publications = await getPublications();
  return NextResponse.json({ publications });
}

export async function POST(request: Request) {
  const access = await requireResearcher();
  if (access.response) return access.response;
  const session = access.user;

  let body: {
    title?: string;
    abstract?: string;
    pdf_url?: string;
    crop_type?: string;
    soil_type?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON input" }, { status: 400 });
  }

  if (!body.title?.trim() || !body.abstract?.trim() || !body.crop_type?.trim()) {
    return NextResponse.json({ error: "Provide study title, abstract summary, and target crop type." }, { status: 400 });
  }
  if (body.pdf_url?.trim()) {
    try {
      const url = new URL(body.pdf_url.trim());
      if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Unsupported URL protocol.");
    } catch {
      return NextResponse.json({ error: "Provide a valid HTTP or HTTPS publication URL." }, { status: 400 });
    }
  }

  const publication = await createPublication(session.id, session.name, {
    title: body.title.trim(),
    abstract: body.abstract.trim(),
    pdf_url: body.pdf_url?.trim() || "",
    crop_type: body.crop_type.trim(),
    soil_type: body.soil_type?.trim() || "All Soil Types"
  });

  return NextResponse.json({ publication }, { status: 201 });
}
