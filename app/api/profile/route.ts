import { getSession } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { findUserByEmail, updateUserPassword, updateUserProfile } from "@/lib/db/repository";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: {
    name?: string;
    address?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  try {
    if (body.currentPassword !== undefined || body.newPassword !== undefined || body.confirmPassword !== undefined) {
      if (!body.currentPassword || !body.newPassword || !body.confirmPassword) {
        return NextResponse.json({ error: "Enter your current password and confirm the new password." }, { status: 400 });
      }
      if (body.currentPassword.length > 128) {
        return NextResponse.json({ error: "Current password is invalid." }, { status: 400 });
      }
      if (body.newPassword.length < 8 || body.newPassword.length > 128) {
        return NextResponse.json({ error: "New password must be between 8 and 128 characters." }, { status: 400 });
      }
      if (body.newPassword !== body.confirmPassword) {
        return NextResponse.json({ error: "The new passwords do not match." }, { status: 400 });
      }
      const account = await findUserByEmail(session.email);
      if (!account || !(await verifyPassword(body.currentPassword, account.password_hash))) {
        return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
      }
      if (!(await updateUserPassword(session.id, await hashPassword(body.newPassword)))) {
        return NextResponse.json({ error: "Account not found or no longer active." }, { status: 404 });
      }
      return NextResponse.json({ ok: true });
    }

    const name = body.name?.trim();
    const address = body.address?.trim() || "";
    if (!name || name.length > 160) {
      return NextResponse.json({ error: "Enter a name between 1 and 160 characters." }, { status: 400 });
    }
    if (address.length > 255) {
      return NextResponse.json({ error: "Address must be 255 characters or fewer." }, { status: 400 });
    }
    if (!(await updateUserProfile(session.id, { name, address }))) {
      return NextResponse.json({ error: "Account not found or no longer active." }, { status: 404 });
    }
    return NextResponse.json({ user: { name, address } });
  } catch (error) {
    console.error("Profile update failed:", error);
    return NextResponse.json({ error: "Unable to update your profile." }, { status: 500 });
  }
}
