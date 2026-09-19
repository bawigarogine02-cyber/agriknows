"use client";

import { Consultation } from "@/lib/db/repository";
import { CheckCircle2, Clock, MessageSquare, Send, User } from "lucide-react";
import { useState } from "react";

interface InquiryThreadListProps {
  consultations: Consultation[];
  onReplyAdded: () => void;
}

export default function InquiryThreadList({ consultations, onReplyAdded }: InquiryThreadListProps) {
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(consultations[0] || null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedConsultation || !replyMessage.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/consultations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultation_id: selectedConsultation.id,
          message: replyMessage.trim()
        })
      });

      if (res.ok) {
        setReplyMessage("");
        onReplyAdded();
      }
    } catch {
      // ignore
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
      {/* Thread List Column */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-[#123d35]">Farmer Inquiries ({consultations.length})</h3>

        <div className="space-y-3">
          {consultations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
              No farmer inquiries submitted yet. Click "Ask an Expert" above to create an inquiry.
            </div>
          ) : (
            consultations.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setSelectedConsultation(c)}
                className={`w-full text-left rounded-2xl border p-4 transition ${
                  selectedConsultation?.id === c.id
                    ? "border-[#16875f] bg-[#e0f5eb]/40 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                    {c.crop_name}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold capitalize ${
                      c.status === "Answered"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {c.status === "Answered" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {c.status}
                  </span>
                </div>

                <h4 className="mt-2 text-sm font-bold text-[#123d35] line-clamp-1">{c.subject}</h4>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">{c.description}</p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{c.farmer_name}</span>
                  <span>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Selected Thread Replies Detail Column */}
      {selectedConsultation ? (
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div>
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="rounded-md bg-[#e4f4e5] px-2.5 py-1 text-xs font-extrabold text-[#16875f]">
                  {selectedConsultation.crop_name} Inquiry
                </span>
                <h3 className="mt-2 text-xl font-bold text-[#123d35]">{selectedConsultation.subject}</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Asked by {selectedConsultation.farmer_name} on {new Date(selectedConsultation.created_at).toLocaleString()}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  selectedConsultation.status === "Answered"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {selectedConsultation.status}
              </span>
            </div>

            {selectedConsultation.image_url && (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <img
                  src={selectedConsultation.image_url}
                  alt="Symptom Diagnostic"
                  className="max-h-56 w-full object-cover"
                />
              </div>
            )}

            {/* Conversation Messages Feed */}
            <div className="mt-6 space-y-4 max-h-[360px] overflow-y-auto pr-1">
              {(selectedConsultation.replies || []).map((reply) => {
                const isResearcher = reply.sender_role === "researcher" || reply.sender_role === "admin";
                return (
                  <div
                    key={reply.id}
                    className={`flex flex-col rounded-xl p-4 text-xs leading-relaxed ${
                      isResearcher
                        ? "bg-[#e0f5eb] border border-emerald-200 text-emerald-950"
                        : "bg-slate-50 border border-slate-200 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <User size={14} className={isResearcher ? "text-[#16875f]" : "text-slate-500"} />
                        {reply.sender_name} {isResearcher ? "(Researcher Expert)" : ""}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">{reply.message}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendReply} className="mt-6 border-t border-slate-100 pt-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your reply or expert recommendation..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#16875f]"
              />
              <button
                type="submit"
                disabled={isSending || !replyMessage.trim()}
                className="flex items-center gap-1.5 shrink-0 rounded-xl bg-[#16875f] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#064b3b] disabled:opacity-50"
              >
                <Send size={14} />
                Reply
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <MessageSquare size={32} className="text-slate-300" />
          <p className="mt-2 text-xs font-semibold text-slate-500">Select an inquiry thread on the left to view response details.</p>
        </div>
      )}
    </div>
  );
}
