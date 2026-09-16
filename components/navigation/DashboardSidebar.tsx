"use client";

import {
  BookOpen,
  ChevronRight,
  Cloud,
  Flower2,
  Gauge,
  House,
  Lightbulb,
  MapPinned,
  Settings,
  Sprout,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type NavigationItem = {
  label: string;
  href: string;
  icon: typeof House;
};

const navigationItems: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: House },
  { label: "Crop Information", href: "/crop-information", icon: Flower2 },
  { label: "Agricultural Knowledge", href: "/agricultural-knowledge", icon: BookOpen },
  { label: "Smart Recommendations", href: "/smart-recommendations", icon: Lightbulb },
  { label: "Planting Advisor", href: "/planting-advisor", icon: MapPinned },
  { label: "Analysis History", href: "/planting-advisor/history", icon: Gauge },
  { label: "Weather", href: "/weather", icon: Cloud },
  { label: "Reports", href: "/reports", icon: Gauge },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();

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
              <p className="mt-1 text-base leading-[1.35] text-emerald-100/75">
                Agricultural Knowledge
                <br />
                Management System
              </p>
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
        {navigationItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;

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
            <h2 className="mt-3 text-base font-bold">Need help?</h2>
            <p className="mt-2 text-base leading-6 text-emerald-50/75">
              Explore farming guides and get support from our agricultural experts.
            </p>
            <button
              type="button"
              className="mt-4 flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-base font-semibold text-white hover:bg-white/20"
            >
              Visit Help Center
              <ChevronRight size={13} />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
