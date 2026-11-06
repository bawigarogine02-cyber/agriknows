import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/authorization";
import { hashPassword } from "@/lib/auth/password";
import {
  addAuditLog,
  createNotification,
  createUserRecord,
  findUserByEmail,
  getUsers,
  updateUserRoleOrStatus,
  type UserAccountRole,
  type UserAccountStatus,
} from "@/lib/db/repository";
import { getRoleLabel } from "@/lib/utils/role-label";

export async function GET(request: Request) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  const params = new URL(request.url).searchParams;
  const search = params.get("search")?.trim() ?? "";
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(5, Number(params.get("pageSize") ?? 10)));
  const statusValue = params.get("status");
  const roleValue = params.get("role");
  if (statusValue && !["pending", "active", "suspended", "rejected"].includes(statusValue)) {
    return NextResponse.json({ error: "Invalid account status filter." }, { status: 400 });
  }
  if (roleValue && !["farmer", "researcher", "admin"].includes(roleValue)) {
    return NextResponse.json({ error: "Invalid account role filter." }, { status: 400 });
  }
  const status = statusValue as UserAccountStatus | null;
  const role = roleValue as UserAccountRole | null;

  const result = await getUsers(search, page, pageSize, status || undefined, role || undefined);
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
    status?: "active" | "suspended" | "pending" | "rejected";
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
  if (body.role && !["farmer", "researcher", "admin"].includes(body.role)) {
    return NextResponse.json({ error: "Role must be farmer, agricultural researcher, or administrator." }, { status: 400 });
  }
  const role = body.role || "farmer";
  if (body.status && !["active", "suspended", "pending", "rejected"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid account status." }, { status: 400 });
  }
  const status = body.status || "active";
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

    await addAuditLog(
      access.user.id,
      "Created User Account",
      "users",
      `Admin created user account '${name}' (${email}) with role '${getRoleLabel(role)}'`
    );
    try {
      await createNotification(
        newUser.id,
        "Your account is ready",
        `An administrator created your ${getRoleLabel(role).toLowerCase()} account.`
      );
    } catch (notificationError) {
      console.error("New account notification could not be saved:", notificationError);
    }

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

  let body: {
    id?: string;
    role?: "farmer" | "researcher" | "admin";
    status?: "active" | "suspended" | "pending" | "rejected";
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!body.id || (!body.role && !body.status)) {
    return NextResponse.json({ error: "A user id and update role/status are required." }, { status: 400 });
  }

  if (body.role && !["farmer", "researcher", "admin"].includes(body.role)) {
    return NextResponse.json({ error: "Role must be farmer, agricultural researcher, or administrator." }, { status: 400 });
  }
  if (body.status && !["active", "suspended", "pending", "rejected"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid account status." }, { status: 400 });
  }
  if (body.id === access.user.id && body.status && body.status !== "active") {
    return NextResponse.json({ error: "You cannot deactivate your own account." }, { status: 400 });
  }

  const updated = await updateUserRoleOrStatus(body.id, body.role, body.status);
  if (!updated) return NextResponse.json({ error: "User account not found." }, { status: 404 });
  if (body.role || body.status) {
    await addAuditLog(
      access.user.id,
      body.status === "active" ? "Approved User Account" : body.status === "rejected" ? "Rejected User Account" : "Updated User Account",
      "users",
      `Updated account ${body.id}${body.role ? ` role to '${getRoleLabel(body.role)}'` : ""}${body.status ? ` status to '${body.status}'` : ""}`
    );
    if (body.status === "active" || body.status === "rejected" || body.status === "suspended") {
      const title = body.status === "active"
        ? "Your account has been approved"
        : body.status === "rejected"
          ? "Your account application was declined"
          : "Your account has been suspended";
      try {
        await createNotification(body.id, title, `An administrator changed your account status to ${body.status}.`);
      } catch (notificationError) {
        console.error("Account status notification could not be saved:", notificationError);
      }
    }
  }
  return NextResponse.json({ ok: true });
}