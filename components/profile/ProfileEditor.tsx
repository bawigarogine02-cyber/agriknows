"use client";

import type { SessionUser } from "@/lib/auth/session";
import { KeyRound, Shield, UserCircle } from "lucide-react";
import { useState } from "react";

export default function ProfileEditor({ user }: { user: SessionUser }) {
  const [name, setName] = useState(user.name);
  const [address, setAddress] = useState(user.address || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const roleLabel = user.role === "admin"
    ? "System Administrator"
    : user.role === "researcher"
      ? "Agricultural Researcher / Scientist"
      : "Lead Farmer / Agricultural Operator";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to update your profile.");
      setName(result.user.name);
      setAddress(result.user.address);
      setSuccess("Profile updated.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update your profile.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    setIsChangingPassword(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to update your password.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Password changed successfully.");
    } catch (saveError) {
      setPasswordError(saveError instanceof Error ? saveError.message : "Unable to update your password.");
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-[1420px] space-y-6">
      <header className="rounded-2xl bg-[#e4f4e5] p-7 shadow-xs sm:p-9">
        <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#27715d]">Workspace account</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#064b3b] sm:text-4xl">Your Account Details</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#45675e]">Update your name and address. Email and role changes require administrator action.</p>
      </header>
      <article className="max-w-2xl rounded-2xl border border-slate-100 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e0f5eb] text-[#288b69]">
            <UserCircle size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#123d35]">{user.name}</h2>
            <p className="mt-0.5 text-xs font-semibold text-[#16875f]">{roleLabel}</p>
          </div>
        </div>

        {error && <p role="alert" className="mt-5 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
        {success && <p role="status" className="mt-5 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{success}</p>}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="profile-name" className="block text-sm font-bold text-slate-700">Full name</label>
            <input id="profile-name" required maxLength={160} value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#16875f]" />
          </div>
          <div>
            <label htmlFor="profile-email" className="block text-sm font-bold text-slate-700">Email address</label>
            <input id="profile-email" value={user.email} disabled className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500" />
          </div>
          <div>
            <label htmlFor="profile-address" className="block text-sm font-bold text-slate-700">Farm / station address</label>
            <input id="profile-address" maxLength={255} value={address} onChange={(event) => setAddress(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#16875f]" />
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="flex items-center gap-2 text-sm font-semibold capitalize text-slate-600"><Shield size={16} /> Account {user.status}</span>
            <button type="submit" disabled={isSaving} className="rounded-xl bg-[#16875f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#064b3b] disabled:opacity-60">
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </article>
      <article className="max-w-2xl rounded-2xl border border-slate-100 bg-white p-6 shadow-xs sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[#123d35]"><KeyRound size={19} /> Change password</h2>
        {passwordError && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{passwordError}</p>}
        {passwordSuccess && <p role="status" className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{passwordSuccess}</p>}
        <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
          <label className="block text-sm font-bold text-slate-700">Current password
            <input required type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-normal outline-none focus:border-[#16875f]" />
          </label>
          <label className="block text-sm font-bold text-slate-700">New password
            <input required minLength={8} maxLength={128} type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-normal outline-none focus:border-[#16875f]" />
          </label>
          <label className="block text-sm font-bold text-slate-700">Confirm new password
            <input required minLength={8} maxLength={128} type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-normal outline-none focus:border-[#16875f]" />
          </label>
          <div className="flex justify-end border-t border-slate-100 pt-4">
            <button type="submit" disabled={isChangingPassword} className="rounded-xl bg-[#16875f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#064b3b] disabled:opacity-60">
              {isChangingPassword ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </article>
    </section>
  );
}
