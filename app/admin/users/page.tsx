import AdminUsersTable from "@/components/admin/AdminUsersTable";

export default function AdminUsersPage() {
  return <section className="space-y-6"><header className="rounded-2xl bg-[#e4f4e5] p-7 sm:p-9"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#27715d]">User management</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-[#064b3b]">Manage accounts and access.</h2><p className="mt-3 max-w-2xl text-base leading-7 text-[#45675e]">Review account status and roles. Changes are enforced by the protected admin API.</p></header><AdminUsersTable /></section>;
}
