"use client";

import {
  BarChart3,
  BookOpen,
  ChevronRight,
  Compass,
  FileText,
  House,
  Leaf,
  MessageSquare,
  ShieldCheck,
  Sprout,
  Users,
  X,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: "farmer" | "researcher" | "admin" | string;
}

type NavigationItem = {
  label: string;
  href: string;
  icon: typeof House;
  allowedRoles?: Array<"farmer" | "researcher" | "admin">;
};

// Strict Role-Based Sidebar Navigation Configuration
const farmerNavItems: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: House },
  { label: "Crop Advisor", href: "/crop-advisor", icon: Sprout },
  { label: "Farms & Fields", href: "/farms", icon: Leaf },
  { label: "Decision Support", href: "/decision-support", icon: Compass },
  { label: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
  { label: "Consultations", href: "/consultations", icon: MessageSquare },
  { label: "Profile", href: "/profile", icon: FileText },
];

const researcherNavItems: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: House },
  { label: "My Research & Studies", href: "/agricultural-knowledge", icon: FileText },
  { label: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
  { label: "Farmer Consultations", href: "/consultations", icon: MessageSquare },
  { label: "Reports & Analytics", href: "/reports", icon: BarChart3 },
  { label: "Profile", href: "/profile", icon: FileText },
];

const adminNavItems: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: House },
  { label: "User Governance", href: "/admin/users", icon: Users },
  { label: "Research Management", href: "/admin/knowledge", icon: BookOpen },
  { label: "Crop Reference Data", href: "/admin/crops", icon: Sprout },
  { label: "Crop Advisor Activity", href: "/admin/recommendations", icon: Compass },
  { label: "Farm Parcels Oversight", href: "/admin/farms", icon: Leaf },
  { label: "Reports & Analytics", href: "/admin/reports", icon: BarChart3 },
  { label: "System Audit Logs", href: "/admin", icon: ShieldCheck },
  { label: "Site & SEO Settings", href: "/admin/settings", icon: ShieldCheck },
];

export default function DashboardSidebar({ isOpen, onClose, userRole }: DashboardSidebarProps) {
  const pathname = usePathname();

  const role = userRole === "admin" ? "admin" : userRole === "researcher" ? "researcher" : "farmer";

  const navItems = role === "admin" ? adminNavItems : role === "researcher" ? researcherNavItems : farmerNavItems;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-[#064b3b] py-5 text-white transition-all duration-300 ${
        isOpen
          ? "w-[258px] translate-x-0 px-4"
          : "w-[72px] -translate-x-full px-2 lg:translate-x-0"
      }`}
    >
      <div
        className={`mb-7 flex items-start ${
          isOpen ? "justify-between px-2" : "justify-center"
        }`}
      >
        <div>
          {isOpen ? (
            <>
              <p className="text-[23px] font-extrabold tracking-[-0.8px]">AgriKMS</p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="rounded-md bg-emerald-400/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 border border-emerald-300/30">
                  {role} Portal
                </span>
              </div>
            </>
          ) : (
            <Sprout className="h-8 w-8 text-emerald-100" aria-label="AgriKMS" />
          )}
        </div>

        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className={`rounded-md p-1 text-emerald-100 ${
            isOpen ? "lg:hidden" : "hidden"
          }`}
        >
          <X size={19} />
        </button>
      </div>

      <nav aria-label="Primary navigation" className="space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

          return (
            <Link
              key={label}
              href={href}
              title={isOpen ? undefined : label}
              onClick={onClose}
              className={`flex min-h-[48px] w-full items-center rounded-[9px] py-2.5 text-base font-medium leading-5 transition-colors ${
                isOpen ? "gap-3 px-3.5 text-left" : "justify-center px-2"
              } ${
                isActive
                  ? "bg-[#199668] font-semibold shadow-[inset_3px_0_0_#47d49e]"
                  : "text-emerald-50/90 hover:bg-white/10"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
              {isOpen && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div
        className={`mt-auto rounded-xl border border-emerald-200/25 bg-emerald-100/[0.08] ${
          isOpen ? "p-4" : "flex justify-center p-3"
        }`}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-300/20 text-emerald-100">
          <Sprout size={20} />
        </div>

        {isOpen && (
          <>
            <h2 className="mt-3 text-base font-bold">
              {role === "admin"
                ? "Admin Help & Docs"
                : role === "researcher"
                ? "Researcher Portal"
                : "Farmer Support"}
            </h2>
            <p className="mt-2 text-base leading-6 text-emerald-50/75">
              {role === "admin"
                ? "Manage system governance, user roles, and website SEO."
                : role === "researcher"
                ? "Publish crop & soil research to enrich recommendations."
                : "Get expert advice and soil recommendations."}
            </p>
            <Link
              href="/consultations"
              className="mt-4 flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-base font-semibold text-white hover:bg-white/20"
            >
              Consult an Expert
              <ChevronRight size={13} />
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}
