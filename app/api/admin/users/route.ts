import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/authorization";
import { hashPassword } from "@/lib/auth/password";
import {
  addAuditLog,
  createUserRecord,
  findUserByEmail,
  getUsersFromDbOrMemory,
  updateUserRoleOrStatus,
} from "@/lib/db/repository";

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

export async function POST(request: Request) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  let body: {
    name?: string;
    email?: string;
    password?: string;
    role?: "farmer" | "researcher" | "admin";
    status?: "active" | "suspended";
    address?: string;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const role = body.role && ["farmer", "researcher", "admin"].includes(body.role) ? body.role : "farmer";
  const status = body.status && ["active", "suspended"].includes(body.status) ? body.status : "active";
  const address = body.address?.trim() || "";

  if (!name || !email || !password || password.length < 6) {
    return NextResponse.json(
      { error: "Name, valid email, and a password with at least 6 characters are required." },
      { status: 400 }
    );
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return NextResponse.json({ error: "A user account with this email address already exists." }, { status: 409 });
  }

  const userId = `u-${role}-${randomUUID().slice(0, 8)}`;
  const password_hash = await hashPassword(password);

  try {
    const newUser = await createUserRecord({
      id: userId,
      name,
      email,
      role,
      status,
      password_hash,
      address,
    });

    addAuditLog(
      access.user.id,
      "Created User Account",
      "users",
      `Admin created user account '${name}' (${email}) with role '${role}'`
    );

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
          createdAt: newUser.created_at,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create user account.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
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