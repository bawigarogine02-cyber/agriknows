"use client";

import { Bell, Menu, Search } from "lucide-react";
import type { SessionUser } from "@/lib/auth/session";
import UserProfileMenu from "@/components/navigation/UserProfileMenu";

interface DashboardHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  user: SessionUser;
}

export default function DashboardHeader({
  isSidebarOpen,
  onToggleSidebar,
  user,
}: DashboardHeaderProps) {
  return (
    <header
      className={`fixed left-0 right-0 top-0 z-20 flex h-[76px] items-center border-b border-slate-200 bg-white px-5 transition-[left] duration-300 sm:px-8 lg:px-9 ${
        isSidebarOpen ? "lg:left-[258px]" : "lg:left-[72px]"
      }`}
    >
      <button
        type="button"
        aria-label={isSidebarOpen ? "Collapse navigation" : "Expand navigation"}
        onClick={onToggleSidebar}
        className="shrink-0 rounded-lg p-2 text-[#526477] transition hover:bg-[#f1f5f7]"
      >
        <Menu size={23} strokeWidth={1.8} />
      </button>

      <label className="mx-auto flex h-[40px] w-full max-w-[470px] items-center gap-3 rounded-[9px] border border-[#d9e2ec] px-3.5 text-[#90a6c1] shadow-[0_1px_2px_rgba(31,61,86,0.03)]">
        <Search size={19} strokeWidth={1.8} />
        <input
          aria-label="Search"
          placeholder="Search for crops, articles, or recommendations..."
          className="min-w-0 flex-1 bg-transparent text-base text-slate-700 outline-none placeholder:text-[#8fa5c0]"
        />
      </label>

      <div className="ml-auto flex shrink-0 items-center gap-4 sm:gap-6">
        <button type="button" aria-label="Notifications" className="relative text-[#526477]">
          <Bell size={21} strokeWidth={1.7} />
          <span className="absolute -right-0.5 -top-0.5 h-[7px] w-[7px] rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <UserProfileMenu user={user} />
      </div>
    </header>
  );
}
