"use client";

import { BarChart3, ChartColumnBig, Clock3, Sprout } from "lucide-react";
import type { Recommendation } from "@/lib/db/repository";

export default function AdminRecommendationActivity({ recommendations }: { recommendations: Recommendation[] }) {
  const totals = {
    total: recommendations.length,
    fertilizer: recommendations.filter((item) => item.type === "fertilizer").length,
    irrigation: recommendations.filter((item) => item.type === "irrigation").length,
    general: recommendations.filter((item) => item.type === "general").length,
  };

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Total</p>
            <BarChart3 className="h-5 w-5 text-[#16875f]" />
          </div>
          <p className="mt-4 text-3xl font-extrabold text-[#064b3b]">{totals.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Fertilizer</p>
            <Sprout className="h-5 w-5 text-[#16875f]" />
          </div>
          <p className="mt-4 text-3xl font-extrabold text-[#064b3b]">{totals.fertilizer}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Irrigation</p>
            <Clock3 className="h-5 w-5 text-[#16875f]" />
          </div>
          <p className="mt-4 text-3xl font-extrabold text-[#064b3b]">{totals.irrigation}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">General</p>
            <ChartColumnBig className="h-5 w-5 text-[#16875f]" />
          </div>
          <p className="mt-4 text-3xl font-extrabold text-[#064b3b]">{totals.general}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-xl font-bold text-[#123d35]">Recent recommendations</h2>
          <p className="mt-1 text-sm text-slate-500">Latest crop advisory activity seen by the system.</p>
        </div>

        {recommendations.length === 0 ? (
          <div className="px-6 py-14 text-center text-slate-500">
            <BarChart3 className="mx-auto h-9 w-9 text-slate-300" />
            <p className="mt-3 text-lg font-semibold text-slate-700">No recommendations generated yet</p>
            <p className="mt-1 text-sm">New advisory runs will appear here for admin review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-[#f8faf7] text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Field</th>
                  <th className="px-5 py-4">Crop</th>
                  <th className="px-5 py-4">Rule</th>
                  <th className="px-5 py-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recommendations.map((recommendation) => (
                  <tr key={recommendation.id} className="align-top">
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-emerald-700">
                        {recommendation.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">{recommendation.field_name || "—"}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{recommendation.crop_name || "—"}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{recommendation.rule_applied || "—"}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {new Date(recommendation.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
