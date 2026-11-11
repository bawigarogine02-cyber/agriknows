"use client";

import type { Farm } from "@/lib/db/repository";
import { LoaderCircle, Pencil, Trash2, X } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

type FarmForm = {
  name: string;
  location: string;
  soil_type: string;
  total_area: string;
};

const emptyForm: FarmForm = {
  name: "",
  location: "",
  soil_type: "Loam",
  total_area: "",
};

export default function AdminFarmsTable({ initialFarms }: { initialFarms: Farm[] }) {
  const [farms, setFarms] = useState(initialFarms);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [farmPendingDelete, setFarmPendingDelete] = useState<Farm | null>(null);
  const [form, setForm] = useState<FarmForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function openEdit(farm: Farm) {
    setEditingFarm(farm);
    setForm({
      name: farm.name,
      location: farm.location,
      soil_type: farm.soil_type || "Loam",
      total_area: String(farm.total_area),
    });
    setError("");
  }

  function closeEdit() {
    if (isSaving) return;
    setEditingFarm(null);
    setForm(emptyForm);
    setError("");
  }

  async function saveFarm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingFarm) return;

    setIsSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/farms/${editingFarm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          location: form.location.trim(),
          soil_type: form.soil_type.trim(),
          total_area: Number(form.total_area),
        }),
      });
      const data: { error?: string } = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update the farm.");

      setFarms((current) => current.map((farm) =>
        farm.id === editingFarm.id
          ? {
              ...farm,
              name: form.name.trim(),
              location: form.location.trim(),
              soil_type: form.soil_type.trim() || "Loam",
              total_area: Number(form.total_area),
            }
          : farm
      ));
      setEditingFarm(null);
      setForm(emptyForm);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update the farm.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteFarm() {
    if (!farmPendingDelete) return;
    const farm = farmPendingDelete;
    setDeletingId(farm.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/farms/${farm.id}`, { method: "DELETE" });
      const data: { error?: string } = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to delete the farm.");
      setFarms((current) => current.filter((item) => item.id !== farm.id));
      setFarmPendingDelete(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete the farm.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <h3 className="text-xl font-bold text-[#123d35]">Farms</h3>
          <p className="mt-1 text-sm text-slate-500">{farms.length} records</p>
        </div>
        {error && !editingFarm && (
          <p role="alert" className="m-5 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{error}</p>
        )}
        {farms.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No available data</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-[#f8faf7] text-sm text-slate-500">
                <tr>
                  {["id", "name", "location", "soil_type", "total_area", "field_count", "actions"].map((column) => (
                    <th key={column} className="px-6 py-4 font-semibold">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {farms.map((farm) => (
                  <tr key={farm.id}>
                    <td className="px-6 py-4 text-sm">{farm.id}</td>
                    <td className="px-6 py-4 text-sm">{farm.name}</td>
                    <td className="px-6 py-4 text-sm">{farm.location || "-"}</td>
                    <td className="px-6 py-4 text-sm">{farm.soil_type || "-"}</td>
                    <td className="px-6 py-4 text-sm">{farm.total_area} ha</td>
                    <td className="px-6 py-4 text-sm">{farm.field_count ?? 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(farm)}
                          disabled={isSaving || deletingId !== null}
                          aria-label={`Edit ${farm.name}`}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFarmPendingDelete(farm);
                            setError("");
                          }}
                          disabled={isSaving || deletingId !== null}
                          aria-label={`Delete ${farm.name}`}
                          className="rounded-lg border border-rose-100 p-2 text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                        >
                          {deletingId === farm.id
                            ? <LoaderCircle size={16} className="animate-spin" />
                            : <Trash2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editingFarm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-farm-edit-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 id="admin-farm-edit-title" className="text-xl font-bold text-[#123d35]">Edit farm</h2>
              <button
                type="button"
                onClick={closeEdit}
                disabled={isSaving}
                aria-label="Close edit farm dialog"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-500">Update farm details. Total area cannot be less than the combined area of its fields.</p>
            {error && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
            <form onSubmit={saveFarm} className="mt-5 space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                Farm name
                <input
                  required
                  maxLength={160}
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-normal outline-none focus:border-[#16875f]"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Location
                <input
                  required
                  maxLength={255}
                  value={form.location}
                  onChange={(event) => setForm({ ...form, location: event.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-normal outline-none focus:border-[#16875f]"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Soil type
                  <input
                    maxLength={100}
                    value={form.soil_type}
                    onChange={(event) => setForm({ ...form, soil_type: event.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-normal outline-none focus:border-[#16875f]"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Total area (ha)
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.total_area}
                    onChange={(event) => setForm({ ...form, total_area: event.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-normal outline-none focus:border-[#16875f]"
                  />
                </label>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={isSaving}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#16875f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#064b3b] disabled:opacity-60"
                >
                  {isSaving && <LoaderCircle size={16} className="animate-spin" />}
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {farmPendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-farm-title"
            aria-describedby="delete-farm-description"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="delete-farm-title" className="text-lg font-bold text-[#123d35]">Delete farm?</h2>
                <p id="delete-farm-description" className="mt-2 text-sm leading-relaxed text-slate-600">
                  Delete <span className="font-semibold text-slate-800">{farmPendingDelete.name}</span> and its{" "}
                  {farmPendingDelete.field_count ?? 0} field plots? Related plantings will also be deleted. This cannot be undone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFarmPendingDelete(null)}
                disabled={deletingId !== null}
                aria-label="Close delete confirmation"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>
            {error && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setFarmPendingDelete(null)}
                disabled={deletingId !== null}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void deleteFarm()}
                disabled={deletingId !== null}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {deletingId === farmPendingDelete.id && <LoaderCircle size={16} className="animate-spin" />}
                {deletingId === farmPendingDelete.id ? "Deleting..." : "Delete farm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
