import { requireAdmin } from "@/lib/auth/authorization";
import { getAuditLogs } from "@/lib/db/repository";
import { NextResponse } from "next/server";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const logs = await getAuditLogs();
  return NextResponse.json({ logs });
}
