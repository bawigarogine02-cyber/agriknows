import { requireAdmin } from "@/lib/auth/authorization";
import {
  addAuditLog,
  approveKnowledgeArticle,
  approvePestDisease,
  declineKnowledgeArticle,
  declinePestDisease,
} from "@/lib/db/repository";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON input." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid approval request." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const kind = record.kind;
  const id = typeof record.id === "string" ? record.id.trim() : "";
  const status = record.status;
  if (
    !/^\d+$/.test(id) ||
    (kind !== "pest" && kind !== "article") ||
    (status !== "approved" && status !== "declined")
  ) {
    return NextResponse.json({ error: "Provide a valid entry, type, and approval decision." }, { status: 400 });
  }

  try {
    const updated = kind === "pest"
      ? status === "approved" ? await approvePestDisease(id) : await declinePestDisease(id)
      : status === "approved" ? await approveKnowledgeArticle(id) : await declineKnowledgeArticle(id);
    if (!updated) {
      return NextResponse.json({ error: "Pending knowledge entry not found." }, { status: 404 });
    }

    await addAuditLog(
      access.user.id,
      status === "approved"
        ? kind === "pest" ? "Approved Pest or Disease Entry" : "Approved Knowledge Article"
        : kind === "pest" ? "Declined Pest or Disease Entry" : "Declined Knowledge Article",
      kind === "pest" ? "pests_diseases" : "knowledge_articles",
      `${status === "approved" ? "Approved" : "Declined"} ${kind === "pest" ? "pest or disease" : "guide or article"} #${id}`
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Knowledge entry review failed:", error);
    return NextResponse.json({ error: "Unable to update the knowledge entry status." }, { status: 500 });
  }
}
