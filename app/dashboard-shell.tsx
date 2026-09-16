"use client";

import { useState } from "react";
import DashboardHeader from "@/components/navigation/DashboardHeader";
import DashboardSidebar from "@/components/navigation/DashboardSidebar";
import type { SessionUser } from "@/lib/auth/session";

interface DashboardShellProps {
  children: React.ReactNode;
  user: SessionUser;
}

export default function DashboardShell({ children, user }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="h-screen overflow-hidden bg-[#f4f7f6] font-sans text-slate-800">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close menu overlay"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-slate-900/30 lg:hidden"
        />
      )}

      <div className="flex min-h-screen">
        <DashboardSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="min-w-0 flex-1">
          <DashboardHeader
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen((current) => !current)}
            user={user}
          />

          <main
            className={`h-screen space-y-6 overflow-y-auto pt-[76px] transition-[margin] duration-300 ${
              isSidebarOpen ? "lg:ml-[258px]" : "lg:ml-[72px]"
            }`}
          >
            <div className="mx-auto max-w-[1420px] space-y-6 p-5 sm:p-7 lg:p-9">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
