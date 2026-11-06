"use client";

import { useEffect, useState } from "react";
import { Bell, Check, MapPin, Save } from "lucide-react";
import type { Farm, UserPreferences } from "@/lib/db/repository";

export default function SettingsPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load settings.");
        setFarms(result.farms);
        setPreferences(result.preferences);
      })
      .catch((error: unknown) => {
        setErrorMessage(error instanceof Error ? error.message : "Unable to load settings.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!preferences) return;
    setErrorMessage("");
    setSavedMessage("");
    setIsSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save settings.");
      setPreferences(result.preferences);
      setSavedMessage("Settings saved successfully.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedFarm = farms.find((farm) => farm.id === preferences?.default_farm_id);

  return (
    <section className="mx-auto w-full max-w-[1420px] space-y-6">
      <header className="rounded-2xl bg-[#e4f4e5] p-7 shadow-sm sm:p-9">
        <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#27715d]">System Preferences</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#064b3b] sm:text-4xl">
          Settings & Preferences
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#45675e]">
          Manage preferences saved to your account and choose a farm from your database records.
        </p>
      </header>

      {errorMessage && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-800">
          {errorMessage}
        </div>
      )}
      {savedMessage && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
          <Check size={16} /> {savedMessage}
        </div>
      )}

      {isLoading ? (
        <p className="rounded-xl bg-white p-6 text-sm text-slate-500">Loading settings from your account...</p>
      ) : preferences ? (
        <form onSubmit={handleSave} className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-base font-bold text-[#123d35]">
              <MapPin size={18} className="text-[#16875f]" /> Farm & Location
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <label htmlFor="default-farm" className="block font-bold text-slate-700">Default farm</label>
                <select
                  id="default-farm"
                  value={preferences.default_farm_id || ""}
                  onChange={(event) => setPreferences({ ...preferences, default_farm_id: event.target.value || null })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                >
                  <option value="">No default farm</option>
                  {farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
                </select>
                <p className="mt-2 text-slate-500">
                  Location: {selectedFarm?.location || "No location recorded for this farm"}
                </p>
                {farms.length === 0 && <p className="mt-2 text-slate-500">Create a farm record to select a default location.</p>}
              </div>

              <div>
                <label htmlFor="units" className="block font-bold text-slate-700">Measurement units</label>
                <select
                  id="units"
                  value={preferences.units}
                  onChange={(event) => setPreferences({ ...preferences, units: event.target.value as UserPreferences["units"] })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                >
                  <option value="metric">Metric (°C, mm, km/h)</option>
                  <option value="imperial">Imperial (°F, inches, mph)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-base font-bold text-[#123d35]">
              <Bell size={18} className="text-[#16875f]" /> Notification Preferences
            </h2>
            <div className="space-y-4 text-xs">
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
                <span>
                  <strong className="block text-slate-800">Extreme weather alerts</strong>
                  <span className="text-slate-500">Receive weather and risk alerts</span>
                </span>
                <input
                  type="checkbox"
                  checked={preferences.notify_weather}
                  onChange={(event) => setPreferences({ ...preferences, notify_weather: event.target.checked })}
                  className="h-5 w-5 rounded accent-[#16875f]"
                />
              </label>
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
                <span>
                  <strong className="block text-slate-800">Recommendation updates</strong>
                  <span className="text-slate-500">Receive crop advisory updates</span>
                </span>
                <input
                  type="checkbox"
                  checked={preferences.notify_recommendations}
                  onChange={(event) => setPreferences({ ...preferences, notify_recommendations: event.target.checked })}
                  className="h-5 w-5 rounded accent-[#16875f]"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end md:col-span-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-[#16875f] px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-[#0c704d] disabled:opacity-60"
            >
              <Save size={16} /> {isSaving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
