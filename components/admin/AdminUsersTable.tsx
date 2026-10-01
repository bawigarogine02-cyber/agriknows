"use client";

import { Search, ShieldAlert, Trash2, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "farmer" | "researcher" | "admin";
  status: "active" | "suspended";
  createdAt: string;
};

export default function AdminUsersTable() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const pageSize = 10;

  async function loadUsers() {
    try {
      const response = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`);
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Unable to load users.");
        return;
      }
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch {
      setError("Failed to fetch user accounts.");
    }
  }

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/users?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`)
      .then(async (response) => ({ response, data: await response.json() }))
      .then(({ response, data }) => {
        if (cancelled) return;
        if (!response.ok) {
          setError(data.error ?? "Unable to load users.");
          return;
        }
        setUsers(data.users || []);
        setTotal(data.total || 0);
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load users.");
      });
    return () => {
      cancelled = true;
    };
  }, [page, search]);

  async function updateUser(id: string, changes: Partial<AdminUser>) {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...changes }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? "Unable to update user.");
        return;
      }
      await loadUsers();
    } catch {
      setError("Failed to update user status.");
    }
  }

  async function deleteUser(user: AdminUser) {
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? "Unable to delete user.");
        return;
      }
      await loadUsers();
    } catch {
      setError("Failed to delete user account.");
    }
  }

  const displayedUsers = users.filter((u) => {
    if (roleFilter === "all") return true;
    return u.role === roleFilter;
  });

  return (
    <>
      <section className="rounded-xl bg-white shadow-xs border border-slate-200">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-xl font-bold text-[#123d35]">User Accounts & Governance</h3>
            <p className="mt-1 text-xs font-semibold text-slate-500">{total} registered system accounts</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-11 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 outline-none"
            >
              <option value="all">All Roles</option>
              <option value="farmer">Farmer Accounts</option>
              <option value="researcher">Researcher Accounts</option>
              <option value="admin">Admin Accounts</option>
            </select>

            <label className="flex h-11 w-full items-center gap-3 rounded-lg border border-slate-200 px-3 text-slate-400 sm:w-64">
              <Search size={18} />
              <input
                value={search}
                onChange={(event) => {
                  setPage(1);
                  setSearch(event.target.value);
                }}
                aria-label="Search users"
                placeholder="Search name or email..."
                className="w-full text-xs text-slate-800 outline-none"
              />
            </label>
          </div>
        </div>

        {error && <p role="alert" className="m-5 rounded-lg bg-[#fff5ef] px-4 py-3 text-xs text-[#9a3c20]">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="bg-[#f8faf7] text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role & RBAC</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                    <p className="mt-0.5 text-slate-500">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block rounded-md px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : user.role === "researcher"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {user.role}
                      </span>
                      <select
                        value={user.role}
                        onChange={(event) => void updateUser(user.id, { role: event.target.value as AdminUser["role"] })}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold bg-white outline-none"
                      >
                        <option value="farmer">Farmer</option>
                        <option value="researcher">Researcher</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => void updateUser(user.id, { status: user.status === "active" ? "suspended" : "active" })}
                      className={`rounded-full px-3 py-1 text-xs font-bold capitalize transition ${
                        user.status === "active" ? "bg-[#e0f5eb] text-[#25805e] hover:bg-emerald-200" : "bg-[#fff5dd] text-[#8b6517] hover:bg-amber-200"
                      }`}
                    >
                      {user.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => setUserToDelete(user)}
                      aria-label={`Delete ${user.name}`}
                      className="rounded-lg p-2 text-slate-400 hover:bg-[#fff5ef] hover:text-[#9a3c20]"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {displayedUsers.length === 0 && <p className="p-8 text-center text-slate-500">No user accounts match your search/filter.</p>}

        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-xs font-semibold text-slate-600">
          <span>
            Page {page} of {Math.max(1, Math.ceil(total / pageSize))}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40 hover:bg-slate-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= Math.ceil(total / pageSize)}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-5">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-user-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 id="delete-user-title" className="text-xl font-bold text-[#123d35]">
              Delete user account?
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This will permanently delete <strong>{userToDelete.name}</strong> ({userToDelete.email}) and related records. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const selected = userToDelete;
                  setUserToDelete(null);
                  await deleteUser(selected);
                }}
                className="rounded-lg bg-[#9a3c20] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#80311a]"
              >
                Delete account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
