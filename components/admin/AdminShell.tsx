"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminShell({ children, user }: { children: React.ReactNode; user: { name: string; email: string } }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6] text-[#123d35]">
      {open && <button type="button" aria-label="Close admin navigation" onClick={() => setOpen(false)} className="fixed inset-0 z-20 bg-slate-900/30 lg:hidden" />}
      <AdminSidebar isOpen={open} onClose={() => setOpen(false)} onLogout={logout} />
      <div className="lg:pl-[260px]">
        <AdminHeader user={user} onOpenNavigation={() => setOpen(true)} />
        <main className="mx-auto max-w-[1440px] space-y-6 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
