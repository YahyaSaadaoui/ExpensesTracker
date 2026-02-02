"use client";

import { useState } from "react";

export default function AddExpenseModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: () => void;
}) {
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const value = Number(budget);
    if (!name.trim() || value <= 0) {
      setError("Invalid values");
      return;
    }

    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), monthly_budget: value }),
    });

    if (!res.ok) {
      setError("Failed to add expense");
      return;
    }

    onAdded();
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-zinc-950 p-6 rounded-2xl border border-white/10 space-y-4"
      >
        <h2 className="text-lg font-semibold text-white">Add Expense</h2>

        <input
          placeholder="Expense name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
        />

        <input
          type="number"
          placeholder="Monthly budget (DH)"
          value={budget}
          onChange={e => setBudget(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-white/10 text-white">
            Cancel
          </button>
          <button className="px-4 py-2 rounded-xl bg-white text-black">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
