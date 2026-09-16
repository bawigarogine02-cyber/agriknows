"use client";

import { useState } from "react";
import {
  Check,
  Mail,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";

type Member = {
  id: string;
  name: string;
  role: "Farmer" | "Agronomist" | "Land Manager" | "Collaborator";
  email: string;
  status: "Active" | "Pending";
  joined: string;
};

const initialMembers: Member[] = [
  {
    id: "1",
    name: "Juan Dela Cruz",
    role: "Farmer",
    email: "juan.delacruz@agrikms.ph",
    status: "Active",
    joined: "Sep 2024",
  },
  {
    id: "2",
    name: "Maria Santos",
    role: "Agronomist",
    email: "maria.santos@agrikms.ph",
    status: "Active",
    joined: "Oct 2024",
  },
  {
    id: "3",
    name: "Alex Rivera",
    role: "Land Manager",
    email: "alex.rivera@agrikms.ph",
    status: "Active",
    joined: "Nov 2024",
  },
];

export default function UsersPage() {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMemberModal, setSelectedMemberModal] = useState<Member | null>(null);

  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "Farmer" as Member["role"],
  });

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name.trim() || !newMember.email.trim()) return;
    const member: Member = {
      id: String(Date.now()),
      name: newMember.name.trim(),
      email: newMember.email.trim(),
      role: newMember.role,
      status: "Active",
      joined: "Just now",
    };
    setMembers([member, ...members]);
    setNewMember({ name: "", email: "", role: "Farmer" });
    setShowAddModal(false);
  };

  const deleteMember = (id: string) => {
    if (!confirm("Remove this member from your team?")) return;
    setMembers((prev) => prev.filter((m) => m.id !== id));
    if (selectedMemberModal?.id === id) setSelectedMemberModal(null);
  };

  return (
    <section className="mx-auto w-full max-w-[1420px] space-y-6">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 rounded-2xl bg-[#e4f4e5] p-7 sm:flex-row sm:items-end sm:p-9 shadow-sm">
        <div>
          <p className="text-[10px] font-bold tracking-[1.5px] text-[#27715d] uppercase">TEAM WORKSPACE</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#064b3b] sm:text-4xl">
            Team & Collaborators
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#45675e]">
            Manage the people who collaborate on your agricultural knowledge and field workspace.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#16875f] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#0c704d]"
        >
          <UserPlus size={18} /> Invite Team Member
        </button>
      </header>

      {/* Search Bar */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm border border-slate-100 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex h-11 flex-1 items-center gap-3 rounded-xl border border-slate-200 px-3.5 text-slate-400 focus-within:border-[#16875f]">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team members by name, email, or role..."
            className="w-full text-sm outline-none text-[#123d35] placeholder:text-slate-400"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          )}
        </label>
      </div>

      {/* Members Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => {
          const initials = member.name
            .split(" ")
            .map((p) => p[0])
            .join("");
          return (
            <article
              key={member.id}
              className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#b8a36c] text-base font-bold text-white shadow-sm">
                    {initials}
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    {member.status}
                  </span>
                </div>

                <h2 className="mt-4 text-base font-bold text-[#123d35]">{member.name}</h2>
                <p className="mt-0.5 text-xs font-semibold text-[#16875f]">{member.role}</p>
                <p className="mt-2 text-xs text-slate-500 truncate">{member.email}</p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedMemberModal(member)}
                  className="text-xs font-bold text-[#18765b] hover:underline"
                >
                  View member →
                </button>
                <button
                  type="button"
                  onClick={() => deleteMember(member.id)}
                  aria-label={`Remove ${member.name}`}
                  className="p-1.5 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Invite Member Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Invite Team Member Modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-[#123d35] flex items-center gap-2">
                <UserPlus className="text-[#16875f]" size={22} /> Invite Team Member
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700">Full Name *</label>
                <input
                  required
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="e.g. Juan Dela Cruz"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="e.g. juan@agrikms.ph"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Role</label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value as Member["role"] })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#16875f]"
                >
                  <option value="Farmer">Farmer</option>
                  <option value="Agronomist">Agronomist</option>
                  <option value="Land Manager">Land Manager</option>
                  <option value="Collaborator">Collaborator</option>
                </select>
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
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Details Modal */}
      {selectedMemberModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Member Details Modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setSelectedMemberModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-[#123d35]">Member Profile</h2>
              <button
                type="button"
                onClick={() => setSelectedMemberModal(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#b8a36c] font-bold text-white">
                  {selectedMemberModal.name.split(" ").map((p) => p[0]).join("")}
                </div>
                <div>
                  <strong className="block text-sm text-[#123d35]">{selectedMemberModal.name}</strong>
                  <span className="text-xs font-semibold text-[#16875f]">{selectedMemberModal.role}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p><strong>Email:</strong> {selectedMemberModal.email}</p>
                <p><strong>Status:</strong> {selectedMemberModal.status}</p>
                <p><strong>Joined:</strong> {selectedMemberModal.joined}</p>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedMemberModal(null)}
                className="rounded-xl bg-[#16875f] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0c704d]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
