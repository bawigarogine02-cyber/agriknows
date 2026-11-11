import { requireAdmin } from "@/lib/auth/authorization";
import { getPestsDiseases } from "@/lib/db/repository";
import { NextResponse } from "next/server";

export async function GET() {
  const access = await requireAdmin();
  if (access.response) return access.response;

  try {
    return NextResponse.json({ pests: await getPestsDiseases({ includePending: true }) });
  } catch (error) {
    console.error("Pest and disease entries could not be loaded:", error);
    return NextResponse.json({ error: "Unable to load pest and disease entries." }, { status: 500 });
  }
}
