"use client";

import { Field, Recommendation } from "@/lib/db/repository";
import { BarChart3, Download, FileSpreadsheet, Filter, Layers, Printer, Sprout } from "lucide-react";
import { useState } from "react";

interface ReportsAnalyticsProps {
  fields: Field[];
  recommendations: Recommendation[];
}

export default function ReportsAnalytics({ fields, recommendations }: ReportsAnalyticsProps) {
  const [dateRange, setDateRange] = useState("30");
  const [advisoryType, setAdvisoryType] = useState("all");
  const [cropCategory, setCropCategory] = useState("all");

  const filteredRecommendations = recommendations.filter((r) => {
    const matchesType = advisoryType === "all" || r.type === advisoryType;
    const matchesCrop = cropCategory === "all" || (r.crop_name && r.crop_name.toLowerCase().includes(cropCategory.toLowerCase()));
    return matchesType && matchesCrop;
  });

  // Calculate summary stat cards
  const totalFields = fields.length;
  const totalArea = fields.reduce((acc, f) => acc + (f.area || 0), 0);
  const totalAdvisories = recommendations.length;

  // Find top cultivated crop
  const cropCounts: Record<string, number> = {};
  fields.forEach((f) => {
    const crop = f.crop_name || "Unspecified";
    cropCounts[crop] = (cropCounts[crop] || 0) + 1;
  });
  const topCrop = Object.entries(cropCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Maize (Corn)";

  function handlePrintPDF() {
    window.print();
  }

  return (
    <div className="space-y-8">
      {/* Summary Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e0f5eb] text-[#16875f]">
            <Layers size={22} />
          </div>
          <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Field Plots</p>
          <strong className="mt-1 block text-3xl font-extrabold text-[#123d35]">{totalFields} Plots</strong>
          <span className="mt-1 block text-xs font-medium text-slate-400">Total Land Area: {totalArea.toFixed(1)} ha</span>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
            <Sprout size={22} />
          </div>
          <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Top Cultivated Crop</p>
          <strong className="mt-1 block text-2xl font-extrabold text-[#123d35] truncate">{topCrop}</strong>
          <span className="mt-1 block text-xs font-medium text-slate-400">Primary Canopy Cover</span>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
            <BarChart3 size={22} />
          </div>
          <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Advisory Outputs Generated</p>
          <strong className="mt-1 block text-3xl font-extrabold text-[#123d35]">{totalAdvisories} Outputs</strong>
          <span className="mt-1 block text-xs font-medium text-slate-400">Fertilizer & Irrigation Plans</span>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-800">
            <FileSpreadsheet size={22} />
          </div>
          <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Report Status</p>
          <strong className="mt-1 block text-2xl font-extrabold text-[#123d35]">Ready for Export</strong>
          <span className="mt-1 block text-xs font-medium text-slate-400">CSV & PDF Print Enabled</span>
        </article>
      </div>

      {/* Filter & Action Controls */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Filter size={16} />
            Filters:
          </div>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="30">Last 30 Days</option>
            <option value="90">Last Quarter (90 Days)</option>
            <option value="365">Year to Date (365 Days)</option>
            <option value="all">All Time History</option>
          </select>

          <select
            value={advisoryType}
            onChange={(e) => setAdvisoryType(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="all">All Advisory Types</option>
            <option value="fertilizer">Fertilizer Plans</option>
            <option value="irrigation">Irrigation Schedules</option>
          </select>

          <select
            value={cropCategory}
            onChange={(e) => setCropCategory(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="all">All Crop Categories</option>
            <option value="maize">Maize (Corn)</option>
            <option value="rice">Rice (Paddy)</option>
            <option value="wheat">Wheat</option>
            <option value="soybean">Soybean</option>
          </select>
        </div>

        {/* Export Actions */}
        <div className="flex items-center gap-3">
          <a
            href="/api/reports/export"
            download
            className="flex items-center gap-2 rounded-xl bg-[#16875f] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#064b3b]"
          >
            <Download size={15} />
            Download CSV Data
          </a>
          <button
            type="button"
            onClick={handlePrintPDF}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            <Printer size={15} />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Exportable Data Table */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs print:shadow-none print:border-none">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-xl font-bold tracking-tight text-[#123d35]">Historical Recommendations & Crop Distribution Table</h3>
          <span className="text-xs font-semibold text-slate-400">Exportable System Dataset</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8faf7] text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5 rounded-l-xl">Field Plot</th>
                <th className="p-3.5">Crop</th>
                <th className="p-3.5">Advisory Type</th>
                <th className="p-3.5">Growth Stage</th>
                <th className="p-3.5">Rule Applied</th>
                <th className="p-3.5">Advisory Output Detail</th>
                <th className="p-3.5 rounded-r-xl">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecommendations.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60">
                  <td className="p-3.5 font-bold text-[#123d35]">{r.field_name || "North Maize Plot"}</td>
                  <td className="p-3.5 font-semibold text-slate-700">{r.crop_name || "Maize"}</td>
                  <td className="p-3.5">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 font-extrabold capitalize ${
                        r.type === "fertilizer"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {r.type}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600 capitalize">{r.crop_stage || "Vegetative"}</td>
                  <td className="p-3.5 text-slate-600 font-medium">{r.rule_applied || "Heuristic Protocol"}</td>
                  <td className="p-3.5 text-slate-700 max-w-xs truncate">{r.output_text?.replace(/\*/g, "")}</td>
                  <td className="p-3.5 text-slate-400">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
