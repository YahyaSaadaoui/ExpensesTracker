"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, CellValueChangedEvent } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import AddConsumptionModal from "./AddConsumptionModal";
import AddExpenseModal from "./AddExpenseModal";

type ExpenseRow = {
  id: string;
  name: string;
  monthly_budget: number;
  consumed: number;
  remaining: number;
  pctUsed: number;
};

export default function ExpensesTable({ onRefresh }: { onRefresh?: () => void }) {
  const [rowData, setRowData] = useState<ExpenseRow[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRow | null>(null);
  const [openAddExpense, setOpenAddExpense] = useState(false);

  const loadExpenses = useCallback(async () => {
    const res = await fetch("/api/expenses", { cache: "no-store" });
    if (!res.ok) return;
    const json = await res.json();
    setRowData(Array.isArray(json.expenses) ? json.expenses : []);
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  async function updateExpense(
    id: string,
    patch: Partial<{ name: string; monthly_budget: number }>
  ) {
    const res = await fetch(`/api/expenses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });

    if (!res.ok) {
      alert("Failed to update expense");
      await loadExpenses();
      return;
    }
    onRefresh?.();
  }

  const onCellValueChanged = async (
    e: CellValueChangedEvent<ExpenseRow>
  ) => {
    const { data, colDef, oldValue, newValue } = e;
    if (!data || oldValue === newValue) return;

    if (colDef.field === "name") {
      await updateExpense(data.id, { name: String(newValue).trim() });
    }

    if (colDef.field === "monthly_budget") {
      const value = Number(newValue);
      if (Number.isNaN(value) || value <= 0) {
        alert("Budget must be > 0");
        await loadExpenses();
        return;
      }
      await updateExpense(data.id, { monthly_budget: value });
    }
  };

  const columns = useMemo<ColDef<ExpenseRow>[]>(() => [
    { field: "name", editable: true },
    {
      field: "monthly_budget",
      headerName: "Budget",
      editable: true,
      valueFormatter: p => `${p.value} DH`,
    },
    {
      field: "consumed",
      editable: true,
      valueFormatter: p => `${p.value} DH`,
    },
    {
      field: "remaining",
      valueFormatter: p => `${p.value} DH`,
    },
    {
      field: "pctUsed",
      headerName: "% Used",
      valueFormatter: p => `${p.value}%`,
      cellStyle: p => {
        if (p.value < 50) return { color: "#22c55e", fontWeight: "700" };
        if (p.value < 80) return { color: "#f59e0b", fontWeight: "700" };
        return { color: "#ef4444", fontWeight: "800" };
      },
    },
    {
      headerName: "",
      width: 180,
      sortable: false,
      cellRenderer: (params: any) => (
        <div className="flex gap-2">
          <button
            onClick={async () => {
              if (!confirm("Delete this expense?")) return;
              await fetch(`/api/expenses/${params.data.id}`, {
                method: "DELETE",
              });
              await loadExpenses();
              onRefresh?.();
            }}
            className="btn btn-danger"
          >
            Delete
          </button>
      </div>

      ),
    },
  ], [onRefresh]);

  return (
    <>
      <div className="flex justify-end mb-3">
        <button
          onClick={() => setOpenAddExpense(true)}
          className="px-4 py-2 rounded-xl bg-white text-black hover:bg-white/90"
        >
          + Add Expense
        </button>
      </div>

      <div className="rounded-2xl bg-black/40 border border-white/10">
        <div className="ag-theme-alpine ag-theme-dark" style={{ height: 420 }}>
          <AgGridReact
            theme="legacy"
            rowData={rowData}
            columnDefs={columns}
            onCellValueChanged={onCellValueChanged}
          />
        </div>
      </div>

      {selectedExpense && (
        <AddConsumptionModal
          expense={selectedExpense}
          onClose={() => setSelectedExpense(null)}
          onAdded={async () => {
            setSelectedExpense(null);
            await loadExpenses();
            onRefresh?.();
          }}
        />
      )}

      {openAddExpense && (
        <AddExpenseModal
          onClose={() => setOpenAddExpense(false)}
          onAdded={async () => {
            setOpenAddExpense(false);
            await loadExpenses();
            onRefresh?.();
          }}
        />
      )}
    </>
  );
}
