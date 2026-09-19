"use client";

import { AuditLog } from "@/lib/db/repository";
import { Activity, Clock, Database, Globe, Monitor, Search, ShieldAlert, User } from "lucide-react";
import { useEffect, useState } from "react";

interface AdminAuditFeedProps {
  initialLogs?: AuditLog[];
}

export default function AdminAuditFeed({ initialLogs = [] }: AdminAuditFeedProps) {
  const [logs, setLogs] = useState<AuditLog[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [targetFilter, setTargetFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/audit");
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    if (initialLogs.length === 0) {
      void fetchLogs();
    }
  }, [initialLogs]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.action && log.action.toLowerCase().includes(search.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(search.toLowerCase())) ||
      (log.user_name && log.user_name.toLowerCase().includes(search.toLowerCase()));
    const matchesTarget = targetFilter === "all" || log.target_table === targetFilter;
    return matchesSearch && matchesTarget;
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xl font-bold text-[#123d35]">Activity Audit Log Feed</h3>
          <p className="mt-0.5 text-xs text-slate-500">Real-time compliance audit trail of user actions & system events.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-400 sm:w-64">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search action or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs font-medium text-slate-800 outline-none bg-transparent"
            />
          </div>

          <select
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="all">All Target Tables</option>
            <option value="recommendations">recommendations</option>
            <option value="farms">farms</option>
            <option value="fields">fields</option>
            <option value="consultations">consultations</option>
            <option value="research_publications">research_publications</option>
            <option value="users">users</option>
          </select>
        </div>
      </div>

      {/* Log Feed Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#f8faf7] text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Action Event</th>
              <th className="p-4">Target Entity</th>
              <th className="p-4">Event Details</th>
              <th className="p-4">IP / Device Info</th>
              <th className="p-4">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/70">
                <td className="p-4">
                  <span className="flex items-center gap-1.5 font-bold text-[#123d35]">
                    <User size={14} className="text-[#16875f]" />
                    {log.user_name || "Active User"}
                  </span>
                  <span className="block text-[11px] text-slate-400">{log.user_email || "user@agrikms.org"}</span>
                </td>
                <td className="p-4">
                  <span className="rounded-md bg-[#e0f5eb] px-2.5 py-1 font-bold text-[#16875f]">
                    {log.action}
                  </span>
                </td>
                <td className="p-4">
                  <span className="flex items-center gap-1 font-mono text-[11px] text-slate-600">
                    <Database size={13} className="text-slate-400" />
                    {log.target_table}
                  </span>
                </td>
                <td className="p-4 text-slate-700 max-w-xs truncate">{log.details}</td>
                <td className="p-4">
                  <span className="block text-slate-700 font-medium">{log.ip_address}</span>
                  <span className="block text-[10px] text-slate-400 truncate max-w-[140px]">{log.device_info}</span>
                </td>
                <td className="p-4 text-slate-400 font-medium whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
