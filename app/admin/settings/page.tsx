import AdminSettingsForm from "@/components/admin/AdminSettingsForm";

export default function AdminSettingsPage() {
  return <section className="space-y-6"><header className="rounded-2xl bg-[#e4f4e5] p-7 sm:p-9"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#27715d]">SEO and system settings</p><h2 className="mt-3 text-3xl font-extrabold text-[#064b3b]">Control how AgriKnow is presented.</h2><p className="mt-3 max-w-2xl text-base leading-7 text-[#45675e]">Update global title, description, and canonical URL values used by the public website metadata.</p></header><AdminSettingsForm /></section>;
}
