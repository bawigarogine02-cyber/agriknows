import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/authorization";
import { getUsersFromDbOrMemory, updateUserRoleOrStatus } from "@/lib/db/repository";

export async function GET(request: Request) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  const params = new URL(request.url).searchParams;
  const search = params.get("search")?.trim() ?? "";
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(5, Number(params.get("pageSize") ?? 10)));

  const result = await getUsersFromDbOrMemory(search, page, pageSize);
  return NextResponse.json(result);
}

export async function PATCH(request: Request) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  let body: { id?: string; role?: "farmer" | "researcher" | "admin"; status?: "active" | "suspended" };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!body.id || (!body.role && !body.status)) {
    return NextResponse.json({ error: "A user id and update role/status are required." }, { status: 400 });
  }

  if (body.id === access.user.id && body.status === "suspended") {
    return NextResponse.json({ error: "You cannot suspend your own account." }, { status: 400 });
  }

  await updateUserRoleOrStatus(body.id, body.role, body.status);
  return NextResponse.json({ ok: true });
}