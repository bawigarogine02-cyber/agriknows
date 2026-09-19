import { getSession } from "@/lib/auth/session";
import { createPublication, getPublications } from "@/lib/db/repository";
import { NextResponse } from "next/server";

export async function GET() {
  const publications = await getPublications();
  return NextResponse.json({ publications });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

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

  const publication = await createPublication(session.id, session.name, {
    title: body.title.trim(),
    abstract: body.abstract.trim(),
    pdf_url: body.pdf_url?.trim() || "#",
    crop_type: body.crop_type.trim(),
    soil_type: body.soil_type?.trim() || "All Soil Types"
  });

  return NextResponse.json({ publication }, { status: 201 });
}
