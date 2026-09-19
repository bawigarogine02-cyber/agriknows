import { getSession } from "@/lib/auth/session";
import { addConsultationReply, createConsultation, getConsultations } from "@/lib/db/repository";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  const consultations = await getConsultations();
  return NextResponse.json({ consultations });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: {
    crop_name?: string;
    subject?: string;
    description?: string;
    image_url?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON input" }, { status: 400 });
  }

  if (!body.crop_name?.trim() || !body.subject?.trim() || !body.description?.trim()) {
    return NextResponse.json({ error: "Provide crop name, subject, and detailed description." }, { status: 400 });
  }

  const consultation = await createConsultation(session.id, session.name, {
    crop_name: body.crop_name.trim(),
    subject: body.subject.trim(),
    description: body.description.trim(),
    image_url: body.image_url?.trim()
  });

  return NextResponse.json({ consultation }, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: { consultation_id?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON input" }, { status: 400 });
  }

  if (!body.consultation_id || !body.message?.trim()) {
    return NextResponse.json({ error: "Provide consultation_id and a reply message." }, { status: 400 });
  }

  const reply = await addConsultationReply(session.id, session.name, session.role, body.consultation_id, body.message.trim());
  if (!reply) {
    return NextResponse.json({ error: "Consultation thread not found" }, { status: 404 });
  }

  return NextResponse.json({ reply });
}
