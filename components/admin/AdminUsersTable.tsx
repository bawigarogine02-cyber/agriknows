"use client";

import { Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

type AdminUser = { id: string; name: string; email: string; role: "admin" | "user"; status: "active" | "suspended"; createdAt: string };

export default function AdminUsersTable() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const pageSize = 10;

  async function loadUsers() {
    const response = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`);
    const data = await response.json();
    if (!response.ok) { setError(data.error ?? "Unable to load users."); return; }
    setUsers(data.users);
    setTotal(data.total);
  }

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/users?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`)
      .then(async (response) => ({ response, data: await response.json() }))
      .then(({ response, data }) => {
        if (cancelled) return;
        if (!response.ok) { setError(data.error ?? "Unable to load users."); return; }
        setUsers(data.users);
        setTotal(data.total);
      })
      .catch(() => { if (!cancelled) setError("Unable to load users."); });
    return () => { cancelled = true; };
  }, [page, search]);

  async function updateUser(id: string, changes: Partial<AdminUser>) {
    const response = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...changes }) });
    if (!response.ok) { const data = await response.json(); setError(data.error ?? "Unable to update user."); return; }
    await loadUsers();
  }

  async function deleteUser(user: AdminUser) {
    const response = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    if (!response.ok) { const data = await response.json(); setError(data.error ?? "Unable to delete user."); return; }
    await loadUsers();
  }

  return <><section className="rounded-xl bg-white shadow-sm"><div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center"><div><h3 className="text-xl font-bold">User accounts</h3><p className="mt-1 text-sm text-slate-500">{total} registered accounts</p></div><label className="flex h-11 w-full items-center gap-3 rounded-lg border border-slate-200 px-3 text-slate-400 sm:max-w-xs"><Search size={18} /><input value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} aria-label="Search users" placeholder="Search name or email" className="w-full text-sm outline-none" /></label></div>{error && <p role="alert" className="m-5 rounded-lg bg-[#fff5ef] px-4 py-3 text-sm text-[#9a3c20]">{error}</p>}<div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead className="bg-[#f8faf7] text-sm text-slate-500"><tr><th className="px-6 py-4 font-semibold">User</th><th className="px-6 py-4 font-semibold">Role</th><th className="px-6 py-4 font-semibold">Status</th><th className="px-6 py-4 font-semibold">Joined</th><th className="px-6 py-4 font-semibold">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{users.map((user) => <tr key={user.id}><td className="px-6 py-4"><p className="font-semibold">{user.name}</p><p className="mt-1 text-sm text-slate-500">{user.email}</p></td><td className="px-6 py-4"><select value={user.role} onChange={(event) => void updateUser(user.id, { role: event.target.value as AdminUser["role"] })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm"><option value="user">User</option><option value="admin">Admin</option></select></td><td className="px-6 py-4"><button type="button" onClick={() => void updateUser(user.id, { status: user.status === "active" ? "suspended" : "active" })} className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${user.status === "active" ? "bg-[#e0f5eb] text-[#25805e]" : "bg-[#fff5dd] text-[#8b6517]"}`}>{user.status}</button></td><td className="px-6 py-4 text-sm text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td><td className="px-6 py-4"><button type="button" onClick={() => setUserToDelete(user)} aria-label={`Delete ${user.name}`} className="rounded-lg p-2 text-slate-400 hover:bg-[#fff5ef] hover:text-[#9a3c20]"><Trash2 size={18} /></button></td></tr>)}</tbody></table></div>{users.length === 0 && <p className="p-8 text-center text-slate-500">No users match this search.</p>}<div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-sm"><span className="text-slate-500">Page {page} of {Math.max(1, Math.ceil(total / pageSize))}</span><div className="flex gap-2"><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-40">Previous</button><button type="button" disabled={page >= Math.ceil(total / pageSize)} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-40">Next</button></div></div></section>{userToDelete && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-5"><div role="dialog" aria-modal="true" aria-labelledby="delete-user-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 id="delete-user-title" className="text-xl font-bold text-[#123d35]">Delete user account?</h2><p className="mt-3 text-base leading-6 text-slate-600">This will permanently delete <strong>{userToDelete.name}</strong> and related records. This action cannot be undone.</p><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setUserToDelete(null)} className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold">Cancel</button><button type="button" onClick={async () => { const selected = userToDelete; setUserToDelete(null); await deleteUser(selected); }} className="rounded-lg bg-[#9a3c20] px-4 py-3 text-sm font-bold text-white">Delete account</button></div></div></div>}</>;
}
