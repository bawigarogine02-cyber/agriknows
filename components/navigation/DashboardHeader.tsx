"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, Menu, Search } from "lucide-react";
import type { SessionUser } from "@/lib/auth/session";
import UserProfileMenu from "@/components/navigation/UserProfileMenu";

interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  recommendation_id: string | null;
  read_at: string | null;
  created_at: string;
}

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
  const router = useRouter();
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const hoverCloseTimeout = useRef<number | null>(null);

  const loadNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    setNotificationsError("");
    try {
      const response = await fetch("/api/notifications", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load notifications.");
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
    } catch (error) {
      setNotificationsError(error instanceof Error ? error.message : "Unable to load notifications.");
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialTimeout = window.setTimeout(() => void loadNotifications(), 0);
    const interval = window.setInterval(() => void loadNotifications(), 60_000);
    return () => {
      window.clearTimeout(initialTimeout);
      window.clearInterval(interval);
      if (hoverCloseTimeout.current) window.clearTimeout(hoverCloseTimeout.current);
    };
  }, [loadNotifications]);

  function keepNotificationsOpen() {
    if (hoverCloseTimeout.current) {
      window.clearTimeout(hoverCloseTimeout.current);
      hoverCloseTimeout.current = null;
    }
    setNotificationsOpen(true);
  }

  function closeNotificationsAfterPointerLeaves() {
    if (hoverCloseTimeout.current) window.clearTimeout(hoverCloseTimeout.current);
    hoverCloseTimeout.current = window.setTimeout(() => {
      setNotificationsOpen(false);
      hoverCloseTimeout.current = null;
    }, 180);
  }

  async function markAsRead(id?: string) {
    const response = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id ? { id } : { markAll: true }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Unable to update notifications.");
    await loadNotifications();
  }

  async function openNotification(notification: DashboardNotification) {
    try {
      if (!notification.read_at) await markAsRead(notification.id);
      setNotificationsOpen(false);
      const title = notification.title.toLowerCase();
      const destination = notification.recommendation_id
        ? "/decision-support"
        : title.includes("consultation") || title.includes("farmer reply")
          ? "/consultations"
          : title.includes("account")
            ? user.role === "admin" ? "/admin/users" : "/profile"
            : "/dashboard";
      router.push(destination);
    } catch (error) {
      setNotificationsError(error instanceof Error ? error.message : "Unable to update notifications.");
    }
  }

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
        <div
          className="relative"
          onMouseEnter={() => {
            keepNotificationsOpen();
            void loadNotifications();
          }}
          onMouseLeave={closeNotificationsAfterPointerLeaves}
          onFocus={keepNotificationsOpen}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setNotificationsOpen(false);
            }
          }}
        >
          <button
            type="button"
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
            aria-expanded={notificationsOpen}
            aria-controls="dashboard-notifications"
            onClick={() => {
              const nextOpen = !notificationsOpen;
              setNotificationsOpen(nextOpen);
              if (nextOpen) void loadNotifications();
            }}
            className="relative rounded-lg p-2 text-[#526477] transition hover:bg-[#f1f5f7]"
          >
            <Bell size={21} strokeWidth={1.7} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <section
              id="dashboard-notifications"
              aria-label="Notifications"
              className="absolute right-0 top-full z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
              onMouseEnter={keepNotificationsOpen}
              onMouseLeave={closeNotificationsAfterPointerLeaves}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">Notifications</h2>
                  <p className="text-xs text-slate-500">{unreadCount} unread</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      void markAsRead().catch((error: unknown) =>
                        setNotificationsError(error instanceof Error ? error.message : "Unable to update notifications.")
                      );
                    }}
                    className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800"
                  >
                    <Check size={14} />
                    Mark all read
                  </button>
                )}
              </div>
              <div aria-live="polite" className="max-h-[min(420px,65vh)] overflow-y-auto">
                {notificationsLoading && (
                  <p className="px-4 py-6 text-center text-sm text-slate-500">Loading notifications...</p>
                )}
                {!notificationsLoading && notificationsError && (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-red-600">{notificationsError}</p>
                    <button
                      type="button"
                      onClick={() => void loadNotifications()}
                      className="mt-2 text-xs font-medium text-emerald-700 hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                )}
                {!notificationsLoading && !notificationsError && notifications.length === 0 && (
                  <p className="px-4 py-8 text-center text-sm text-slate-500">You are all caught up.</p>
                )}
                {!notificationsLoading && !notificationsError && notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => void openNotification(notification)}
                    className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50 ${
                      notification.read_at ? "bg-white" : "bg-emerald-50/60"
                    }`}
                  >
                    <span className="flex items-start gap-2">
                      {!notification.read_at && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-600" />}
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-800">{notification.title}</span>
                        <span className="mt-0.5 block text-xs leading-5 text-slate-600">{notification.message}</span>
                        <time className="mt-1 block text-[11px] text-slate-400">
                          {new Date(notification.created_at).toLocaleString()}
                        </time>
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        <UserProfileMenu user={user} />
      </div>
    </header>
  );
}
