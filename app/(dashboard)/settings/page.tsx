"use client";

import { useState } from "react";
import {
  Bell,
  Check,
  Globe,
  MapPin,
  Save,
  Shield,
  Sliders,
  User,
} from "lucide-react";

export default function SettingsPage() {
  const [farmName, setFarmName] = useState("San Jose Farm Plot 1");
  const [defaultCity, setDefaultCity] = useState("San Jose, Nueva Ecija");
  const [units, setUnits] = useState("metric");
  const [notifyWeather, setNotifyWeather] = useState(true);
  const [notifyRecommendations, setNotifyRecommendations] = useState(true);
  const [savedMessage, setSavedMessage] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage("Settings saved successfully!");
    setTimeout(() => setSavedMessage(""), 3000);
  };

  return (
    <section className="mx-auto w-full max-w-[1420px] space-y-6">
      {/* Header */}
      <header className="rounded-2xl bg-[#e4f4e5] p-7 sm:p-9 shadow-sm">
        <p className="text-[10px] font-bold tracking-[1.5px] text-[#27715d] uppercase">SYSTEM PREFERENCES</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#064b3b] sm:text-4xl">
          Settings & Preferences
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#45675e]">
          Manage your farm location, measurement units, notification alerts, and account preferences.
        </p>
      </header>

      {savedMessage && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
          <Check size={16} /> {savedMessage}
        </div>
      )}

      <form onSubmit={handleSave} className="grid gap-6 md:grid-cols-2">
        {/* Farm & Location Preferences */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-base font-bold text-[#123d35] flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin size={18} className="text-[#16875f]" /> Farm & Location Settings
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700">Workspace / Farm Name</label>
              <input
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700">Default Weather & Advisory Location</label>
              <input
                value={defaultCity}
                onChange={(e) => setDefaultCity(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700">Measurement Units</label>
              <select
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
              >
                <option value="metric">Metric (°C, mm rain, km/h wind)</option>
                <option value="imperial">Imperial (°F, inches rain, mph wind)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications & Alerts */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-base font-bold text-[#123d35] flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell size={18} className="text-[#16875f]" /> Notification Controls
          </h2>

          <div className="space-y-4 text-xs">
            <label className="flex items-center justify-between cursor-pointer rounded-xl bg-slate-50 p-3 border border-slate-100">
              <div>
                <strong className="block text-slate-800">Extreme Weather & Risk Alerts</strong>
                <span className="text-slate-500">Receive warnings for heat stress, typhoons, and heavy rain</span>
              </div>
              <input
                type="checkbox"
                checked={notifyWeather}
                onChange={(e) => setNotifyWeather(e.target.checked)}
                className="h-5 w-5 rounded accent-[#16875f]"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer rounded-xl bg-slate-50 p-3 border border-slate-100">
              <div>
                <strong className="block text-slate-800">Crop Recommendation Updates</strong>
                <span className="text-slate-500">Alert when weather improves crop suitability for planting</span>
              </div>
              <input
                type="checkbox"
                checked={notifyRecommendations}
                onChange={(e) => setNotifyRecommendations(e.target.checked)}
                className="h-5 w-5 rounded accent-[#16875f]"
              />
            </label>
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-[#16875f] px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-[#0c704d]"
          >
            <Save size={16} /> Save All Preferences
          </button>
        </div>
      </form>
    </section>
  );
}
