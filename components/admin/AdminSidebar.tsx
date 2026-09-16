"use client";

import { BarChart3, BookOpen, FileText, Leaf, LogOut, Settings, ShieldCheck, Sprout, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  { label: "Overview", href: "/admin", icon: BarChart3 },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Crops", href: "/admin/crops", icon: Sprout },
  { label: "Farms & Fields", href: "/admin/farms", icon: Leaf },
  { label: "Knowledge Articles", href: "/admin/knowledge", icon: BookOpen },
  { label: "Recommendations", href: "/admin/recommendations", icon: ShieldCheck },
  { label: "Reports", href: "/admin/reports", icon: FileText },
  { label: "SEO & Settings", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function AdminSidebar({ isOpen, onClose, onLogout }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`fixed inset-y-0 left-0 z-30 flex w-[260px] flex-col bg-[#064b3b] p-5 text-white transition-transform ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-extrabold tracking-[-0.04em]">AgriKMS</p>
          <p className="mt-1 text-sm leading-5 text-emerald-100/75">Administration workspace</p>
        </div>
        <button type="button" aria-label="Close navigation" onClick={onClose} className="lg:hidden">
          <X size={20} />
        </button>
      </div>

      <div className="mt-8 border-b border-white/10 pb-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f3cf43]">Admin panel</p>
        <p className="mt-2 text-sm text-white/70">Manage the agricultural knowledge system.</p>
      </div>

      <nav aria-label="Admin navigation" className="mt-5 space-y-1">
        {sections.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${active ? "bg-[#199668] text-white" : "text-emerald-50/80 hover:bg-white/10 hover:text-white"}`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <button type="button" onClick={onLogout} className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-lg bg-white/10 px-3 py-3 text-sm font-semibold text-white hover:bg-white/20">
        <LogOut size={18} />
        Sign out
      </button>
    </aside>
  );
}
