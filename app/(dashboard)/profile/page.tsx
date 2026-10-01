import { Shield, UserCircle } from "lucide-react";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getSession();

  const name = user?.name || "Juan Dela Cruz";
  const email = user?.email || "farmer@agrikms.ph";
  const roleLabel =
    user?.role === "admin"
      ? "System Administrator"
      : user?.role === "researcher"
      ? "Agricultural Researcher / Scientist"
      : "Lead Farmer / Agricultural Operator";
  const status = user?.status || "active";
  const address = user?.address || "Primary Farm Workspace";

  return (
    <section className="mx-auto w-full max-w-[1420px] space-y-6">
      <header className="rounded-2xl bg-[#e4f4e5] p-7 sm:p-9 shadow-xs">
        <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#27715d]">WORKSPACE ACCOUNT</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#064b3b] sm:text-4xl">Your Account Details</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#45675e]">View the account credentials, address, and role permissions connected to your AgriKMS profile.</p>
      </header>
      <article className="max-w-2xl rounded-2xl bg-white p-6 shadow-xs border border-slate-100 sm:p-8">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e0f5eb] text-[#288b69]">
            <UserCircle size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#123d35]">{name}</h2>
            <p className="mt-0.5 text-xs font-semibold text-[#16875f]">{roleLabel}</p>
          </div>
        </div>
        <dl className="mt-6 grid gap-5 sm:grid-cols-2 text-xs">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <dt className="font-bold text-slate-500">Email Address</dt>
            <dd className="mt-1 font-bold text-slate-800 text-sm">{email}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <dt className="font-bold text-slate-500">Account Status</dt>
            <dd className="mt-1 font-bold capitalize text-emerald-700 text-sm flex items-center gap-1">
              <Shield size={14} /> {status}
            </dd>
          </div>
          <div className="col-span-2 rounded-xl bg-slate-50 p-4 border border-slate-100">
            <dt className="font-bold text-slate-500">Farm / Station Address</dt>
            <dd className="mt-1 font-bold text-slate-800 text-sm">{address}</dd>
          </div>
        </dl>
      </article>
    </section>
  );
}