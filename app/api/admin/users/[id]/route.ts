import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/authorization";
import { addAuditLog, deleteUserRecord } from "@/lib/db/repository";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  const { id } = await params;
  if (id === access.user.id) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }

  if (!(await deleteUserRecord(id))) {
    return NextResponse.json({ error: "User account not found." }, { status: 404 });
  }
  await addAuditLog(access.user.id, "Deleted User Account", "users", `Deleted user account '${id}'`);
  return NextResponse.json({ ok: true });
}