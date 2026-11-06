import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { addAuditLog, createAdminNotifications, createUserRecord, findUserByEmail } from "@/lib/db/repository";

function isDuplicateEmailError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;

  return ("code" in err && err.code === "ER_DUP_ENTRY") || ("errno" in err && err.errno === 1062);
}

export async function POST(request: Request) {
  let body: { name?: string; email?: string; password?: string; confirmPassword?: string; role?: string; address?: string };
  try {
    body = (await request.json()) as { name?: string; email?: string; password?: string; confirmPassword?: string; role?: string; address?: string };
  } catch {
    return NextResponse.json({ error: "Send a valid JSON request." }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const confirmPassword = body.confirmPassword;
  const address = body.address?.trim() || "";

  if (!name || !email || !password || password.length < 6 || password !== confirmPassword) {
    return NextResponse.json({ error: "Provide a name, valid email, matching passwords, and at least six characters." }, { status: 400 });
  }

  const roleInput = body.role?.toLowerCase();
  const assignedRole: "farmer" | "researcher" = roleInput === "researcher" ? "researcher" : "farmer";

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: "That email address is already registered." }, { status: 409 });
    }

    const userId = randomUUID();
    const password_hash = await hashPassword(password);
    await createUserRecord({
      id: userId,
      name,
      email,
      role: assignedRole,
      status: "pending",
      password_hash,
      address,
    });
    try {
      await addAuditLog(userId, "Registered Account", "users", `Registered a pending ${assignedRole} account`);
    } catch (auditError) {
      console.error("Registration audit event could not be saved:", auditError);
    }
    try {
      await createAdminNotifications(
        "Account awaiting approval",
        `${name} registered as a ${assignedRole} and needs account review.`
      );
    } catch (notificationError) {
      console.error("Registration notification could not be saved:", notificationError);
    }

    return NextResponse.json(
      { status: "pending", message: "Your account was created and is awaiting administrator approval." },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (isDuplicateEmailError(err)) {
      return NextResponse.json({ error: "That email address is already registered." }, { status: 409 });
    }

    console.error("Account registration failed:", err);
    return NextResponse.json(
      { error: "We couldn't save your account. Please try again later." },
      { status: 500 }
    );
  }
}
