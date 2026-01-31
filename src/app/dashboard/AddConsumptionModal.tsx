"use client";

import { useState } from "react";

type Props = {
  expense: {
    id: string;
    name: string;
  };
  onClose: () => void;
  onAdded: () => void;
};

export default function AddConsumptionModal({
  expense,
  onClose,
  onAdded,
}: Props) {
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
      body: JSON.stringify({
        expense_id: expense.id,
        amount: value,
        note: note || undefined,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Failed to add consumption");
      return;
    }

    onAdded();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="
          w-full max-w-sm
          rounded-2xl
          bg-white
          p-6
          shadow-xl
          space-y-5
        "
      >
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Add consumption
          </h2>
          <p className="text-sm text-gray-500">
            {expense.name}
          </p>
        </div>

        <div className="space-y-3">
          <input
            type="number"
            placeholder="Amount (DH)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="
              w-full
              rounded-lg
              border border-gray-300
              px-3 py-2
              text-gray-900
              focus:outline-none
              focus:ring-2
              focus:ring-gray-900
            "
          />

          <input
            type="text"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="
              w-full
              rounded-lg
              border border-gray-300
              px-3 py-2
              text-gray-900
              focus:outline-none
              focus:ring-2
              focus:ring-gray-900
            "
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="
              px-4 py-2
              rounded-lg
              border border-gray-300
              text-gray-700
              hover:bg-gray-100
              transition
            "
          >
            Cancel
          </button>

          <button
            disabled={loading}
            className="
              px-4 py-2
              rounded-lg
              bg-gray-900
              text-white
              hover:bg-gray-800
              transition
              disabled:opacity-50
            "
          >
            {loading ? "Saving…" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}
