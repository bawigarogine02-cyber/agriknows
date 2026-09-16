"use client";

import { ChevronDown, LogOut, Settings, UserCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProfileUser {
  name: string;
  email: string;
}

interface UserProfileMenuProps {
  user: ProfileUser;
  profileHref?: string;
  settingsHref?: string;
  menuClassName?: string;
  compact?: boolean;
}

export default function UserProfileMenu({
  user,
  profileHref = "/profile",
  settingsHref = "/settings",
  menuClassName = "",
  compact = false,
}: UserProfileMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleLogout() {
    setIsLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Open profile menu for ${user.name}`}
        onClick={() => setIsOpen((current) => !current)}
        className="flex items-center gap-2.5 text-left"
      >
        <span className={`flex items-center justify-center rounded-full bg-[#b8a36c] font-semibold text-white shadow-sm ${compact ? "h-9 w-9 text-xs" : "h-9 w-9 text-sm"}`}>
          {initials}
        </span>
        <span className="hidden min-w-0 sm:block">
          <strong className={`block truncate font-bold ${compact ? "max-w-[190px] text-sm text-slate-700" : "max-w-[190px] text-base text-[#334155]"}`}>
            {user.name}
          </strong>
          <small className={`block truncate ${compact ? "max-w-[190px] text-xs text-slate-500" : "max-w-[190px] text-sm text-[#8ca1bb]"}`}>
            {user.email}
          </small>
        </span>
        <ChevronDown size={15} className={`transition-transform ${compact ? "text-slate-400" : "text-[#8ca1bb]"} ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <button type="button" aria-label="Close profile menu" onClick={closeMenu} className="fixed inset-0 z-30 cursor-default" />
          <div role="menu" className={`absolute right-0 top-12 z-40 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl ${menuClassName}`}>
            <Link href={profileHref} role="menuitem" onClick={closeMenu} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-[#f4f7f6]"><UserCircle size={17} /> My Profile</Link>
            <Link href={settingsHref} role="menuitem" onClick={closeMenu} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-[#f4f7f6]"><Settings size={17} /> Settings</Link>
            <button type="button" role="menuitem" onClick={handleLogout} disabled={isLoggingOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-[#9a3c20] hover:bg-[#fff5ef] disabled:opacity-60"><LogOut size={17} /> {isLoggingOut ? "Logging out..." : "Logout"}</button>
          </div>
        </>
      )}
    </div>
  );
}
