"use client";

import { useState } from "react";

type Props = {
  expense: { id: string; name: string };
  onClose: () => void;
  onAdded: () => void;
};

export default function AddConsumptionModal({ expense, onClose, onAdded }: Props) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const value = Number(amount);
    if (!value || value <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/consumptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expense_id: expense.id, amount: value, note: note || undefined }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Failed to add consumption");
      return;
    }

    onAdded();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl space-y-5"
      >
        <div>
          <h2 className="text-lg font-semibold text-white">Add consumption</h2>
          <p className="text-sm text-white/60">{expense.name}</p>
        </div>

        <div className="space-y-3">
          <input
            type="number"
            placeholder="Amount (DH)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
          <input
            type="text"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 text-white border border-white/10 transition"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            className="rounded-xl px-4 py-2 text-sm font-medium bg-white text-black hover:bg-white/90 transition disabled:opacity-50"
          >
            {loading ? "Saving…" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}
