"use client";

export default function DeleteExpenseModal({
  expenseName,
  onCancel,
  onConfirm,
  loading = false,
}: {
  expenseName: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-zinc-950 border border-white/10 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">
          Delete expense?
        </h2>

        <p className="text-sm text-white/70">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-white">
            {expenseName}
          </span>
          ?  
          <br />
          All related consumptions will be removed.
        </p>

        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/15 transition"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-500 transition disabled:opacity-50"
          >
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
