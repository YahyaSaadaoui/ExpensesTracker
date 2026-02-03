"use client";
import { useEffect, useState } from "react";

export default function ViewConsumptionsModal({
  expense,
  onClose,
  onChanged,
}: any) {
  const [rows, setRows] = useState<any[]>([]);

  async function load() {
    const res = await fetch(`/api/consumptions?expense_id=${expense.id}`);
    const json = await res.json();
    setRows(json.consumptions ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function update(id: string, patch: any) {
    await fetch(`/api/consumptions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    await load();
    onChanged();
  }

  async function remove(id: string) {
    if (!confirm("Delete this consumption?")) return;
    await fetch(`/api/consumptions/${id}`, { method: "DELETE" });
    await load();
    onChanged();
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center">
      <div className="w-full max-w-lg bg-zinc-950 p-6 rounded-2xl border border-white/10">
        <h3 className="text-white font-semibold mb-4">
          {expense.name} — Consumptions
        </h3>

        <div className="space-y-3 max-h-[420px] overflow-y-auto">
          {rows.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-2 bg-white/5 p-3 rounded-xl"
            >
              <input
                type="number"
                defaultValue={r.amount}
                onBlur={(e) =>
                  update(r.id, { amount: Number(e.target.value) })
                }
                className="w-24 bg-black/40 rounded px-2 py-1 text-white"
              />

              <input
                defaultValue={r.note ?? ""}
                onBlur={(e) => update(r.id, { note: e.target.value })}
                className="flex-1 bg-black/40 rounded px-2 py-1 text-white"
              />

              <button
                onClick={() => remove(r.id)}
                className="text-red-400 text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="btn-apple">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
