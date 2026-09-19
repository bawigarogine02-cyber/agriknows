"use client";

interface CropCycleToggleProps {
  filter: "all" | "active" | "harvested";
  onChange: (filter: "all" | "active" | "harvested") => void;
  activeCount: number;
  harvestedCount: number;
}

export default function CropCycleToggle({ filter, onChange, activeCount, harvestedCount }: CropCycleToggleProps) {
  return (
    <div className="flex items-center rounded-xl bg-slate-200/60 p-1.5 text-xs font-bold">
      <button
        type="button"
        onClick={() => onChange("all")}
        className={`rounded-lg px-3.5 py-1.5 transition ${
          filter === "all" ? "bg-white text-[#123d35] shadow-xs" : "text-slate-600 hover:text-slate-900"
        }`}
      >
        All Plots ({activeCount + harvestedCount})
      </button>
      <button
        type="button"
        onClick={() => onChange("active")}
        className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition ${
          filter === "active" ? "bg-[#16875f] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
        }`}
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        Active Cycle ({activeCount})
      </button>
      <button
        type="button"
        onClick={() => onChange("harvested")}
        className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition ${
          filter === "harvested" ? "bg-[#b88c14] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
        }`}
      >
        <span className="h-2 w-2 rounded-full bg-amber-300" />
        Harvested ({harvestedCount})
      </button>
    </div>
  );
}
