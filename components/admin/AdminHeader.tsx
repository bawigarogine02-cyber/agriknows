"use client";

import { Menu } from "lucide-react";
import UserProfileMenu from "@/components/navigation/UserProfileMenu";

interface AdminHeaderProps {
  user: { name: string; email: string };
  onOpenNavigation: () => void;
}

export default function AdminHeader({ user, onOpenNavigation }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
      <button type="button" aria-label="Open admin navigation" onClick={onOpenNavigation} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden">
        <Menu size={21} />
      </button>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#27715d]">Administration</p>
        <h1 className="mt-1 text-lg font-bold">System control center</h1>
      </div>
      <UserProfileMenu user={user} profileHref="/admin" settingsHref="/admin/settings" compact />
    </header>
  );
}
