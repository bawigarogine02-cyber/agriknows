"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Boxes,
  Check,
  Filter,
  Minus,
  Plus,
  Search,
  Trash2,
  Wrench,
  X,
} from "lucide-react";

type InventoryItem = {
  id: string;
  name: string;
  category: "Seeds & Planting" | "Fertilizers & Soil" | "Tools & Equipment" | "Crop Care";
  quantity: number;
  unit: string;
  minAlert: number;
  notes: string;
};

const initialItems: InventoryItem[] = [
  {
    id: "1",
    name: "Bush Green Bean Seeds (Provider cultivar)",
    category: "Seeds & Planting",
    quantity: 15,
    unit: "kg",
    minAlert: 5,
    notes: "High germination rate bush bean seeds.",
  },
  {
    id: "2",
    name: "Organic Nitrogen Soil Compost",
    category: "Fertilizers & Soil",
    quantity: 40,
    unit: "bags (50kg)",
    minAlert: 10,
    notes: "Aged organic manure for raised beds.",
  },
  {
    id: "3",
    name: "Yardlong Sitaw Bamboo Support Poles (8ft)",
    category: "Tools & Equipment",
    quantity: 120,
    unit: "pcs",
    minAlert: 30,
    notes: "Vertical trellis support poles.",
  },
  {
    id: "4",
    name: "Drip Irrigation Hose & Emitter Line",
    category: "Tools & Equipment",
    quantity: 2,
    unit: "rolls (200m)",
    minAlert: 1,
    notes: "Low-pressure drip line for dry spells.",
  },
  {
    id: "5",
    name: "Neem Botanical Insecticide Extract",
    category: "Crop Care",
    quantity: 4,
    unit: "liters",
    minAlert: 5,
    notes: "Organic aphid spray control.",
  },
];

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showAddModal, setShowAddModal] = useState(false);

  const [newItem, setNewItem] = useState({
    name: "",
    category: "Seeds & Planting" as InventoryItem["category"],
    quantity: 10,
    unit: "kg",
    minAlert: 5,
    notes: "",
  });

  const categories = ["All", "Seeds & Planting", "Fertilizers & Soil", "Tools & Equipment", "Crop Care"];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.notes.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const deleteItem = (id: string) => {
    if (!confirm("Remove this item from inventory?")) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    const item: InventoryItem = {
      id: String(Date.now()),
      name: newItem.name.trim(),
      category: newItem.category,
      quantity: Number(newItem.quantity) || 1,
      unit: newItem.unit.trim() || "pcs",
      minAlert: Number(newItem.minAlert) || 2,
      notes: newItem.notes.trim() || "Added to farm supplies inventory.",
    };
    setItems([item, ...items]);
    setNewItem({
      name: "",
      category: "Seeds & Planting",
      quantity: 10,
      unit: "kg",
      minAlert: 5,
      notes: "",
    });
    setShowAddModal(false);
  };

  return (
    <section className="mx-auto w-full max-w-[1420px] space-y-6">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 rounded-2xl bg-[#e4f4e5] p-7 sm:flex-row sm:items-end sm:p-9 shadow-sm">
        <div>
          <p className="text-[10px] font-bold tracking-[1.5px] text-[#27715d] uppercase">FARM RESOURCE MANAGEMENT</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#064b3b] sm:text-4xl">Farm Inventory</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#45675e]">
            Track seeds, fertilizers, support poles, tools, and crop protection materials.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#16875f] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#0c704d]"
        >
          <Plus size={18} /> Add Supply Item
        </button>
      </header>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm border border-slate-100 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex h-11 flex-1 items-center gap-3 rounded-xl border border-slate-200 px-3.5 text-slate-400 focus-within:border-[#16875f]">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search supplies, seeds, fertilizers, equipment..."
            className="w-full text-sm outline-none text-[#123d35] placeholder:text-slate-400"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          )}
        </label>

        <div className="flex flex-wrap items-center gap-1.5">
          <Filter size={15} className="mr-1 text-slate-400" />
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                selectedCategory === cat
                  ? "bg-[#16875f] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Items Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => {
          const isLow = item.quantity <= item.minAlert;
          return (
            <article
              key={item.id}
              className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-md bg-[#e0f5eb] px-2.5 py-1 text-[11px] font-bold text-[#25805e]">
                    {item.category}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isLow ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {isLow ? <AlertTriangle size={12} /> : null}
                    {isLow ? "Low Stock" : "In Stock"}
                  </span>
                </div>

                <h2 className="mt-3 text-base font-bold text-[#123d35]">{item.name}</h2>
                <p className="mt-1 text-xs text-slate-500">{item.notes}</p>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <span className="text-xs text-slate-500">Available Quantity:</span>
                  <strong className="text-base font-extrabold text-[#123d35]">
                    {item.quantity} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                  </strong>
                </div>
              </div>

              {/* Quantity Controls & Delete */}
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, -1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-[#123d35]">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => deleteItem(item.id)}
                  aria-label={`Delete ${item.name}`}
                  className="p-1.5 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add Supply Item Modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-[#123d35] flex items-center gap-2">
                <Boxes className="text-[#16875f]" size={22} /> Add Inventory Supply Item
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700">Item Name *</label>
                <input
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g. Bush Green Bean Seeds"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as InventoryItem["category"] })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                  >
                    <option value="Seeds & Planting">Seeds & Planting</option>
                    <option value="Fertilizers & Soil">Fertilizers & Soil</option>
                    <option value="Tools & Equipment">Tools & Equipment</option>
                    <option value="Crop Care">Crop Care</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700">Unit Measure</label>
                  <input
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    placeholder="e.g. kg, bags, liters, pcs"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700">Quantity</label>
                  <input
                    type="number"
                    min={0}
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700">Low Stock Alert Min</label>
                  <input
                    type="number"
                    min={0}
                    value={newItem.minAlert}
                    onChange={(e) => setNewItem({ ...newItem, minAlert: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Notes & Usage Instructions</label>
                <textarea
                  rows={2}
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  placeholder="Usage notes..."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#16875f] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0c704d]"
                >
                  Add Supply Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
