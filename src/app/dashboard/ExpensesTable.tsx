"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, CellValueChangedEvent } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import AddConsumptionModal from "./AddConsumptionModal";

type ExpenseRow = {
  id: string;
  name: string;
  monthly_budget: number;
  consumed: number;
  remaining: number;
  pctUsed: number;
};

export default function ExpensesTable({
  onRefresh,
}: {
  onRefresh?: () => void;
}) {
  const [rowData, setRowData] = useState<ExpenseRow[]>([]);
  const [selectedExpense, setSelectedExpense] =
    useState<ExpenseRow | null>(null);

  /**
   * 🔒 Client-side ONLY data loading
   * Safe against hydration issues
   */
  const loadExpenses = useCallback(async () => {
    try {
      const res = await fetch("/api/expenses", { cache: "no-store" });
      if (!res.ok) return;

      const json = await res.json();
      const expenses: ExpenseRow[] = Array.isArray(json.expenses)
        ? json.expenses
        : [];

      // Inline "new expense" row always on top
      setRowData([
        {
          id: "__new__",
          name: "",
          monthly_budget: 0,
          consumed: 0,
          remaining: 0,
          pctUsed: 0,
        },
        ...expenses,
      ]);
    } catch (err) {
      console.error("Failed to load expenses", err);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  async function createExpense(name: string, monthly_budget: number) {
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, monthly_budget }),
    });

    if (!res.ok) {
      alert("Failed to create expense");
      return;
    }

    await loadExpenses();
    onRefresh?.();
  }

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

    // ➕ Inline new expense row
    if (data.id === "__new__") {
      if (!data.name || data.monthly_budget <= 0) return;
      await createExpense(data.name.trim(), data.monthly_budget);
      return;
    }

    if (colDef.field === "name") {
      await updateExpense(data.id, { name: String(newValue).trim() });
    }

    if (colDef.field === "monthly_budget") {
      const value = Number(newValue);
      if (Number.isNaN(value) || value <= 0) {
        alert("Budget must be a positive number");
        await loadExpenses();
        return;
      }
      await updateExpense(data.id, { monthly_budget: value });
    }
  };

  /**
   * 🧠 Column definitions (memoized – important for AG Grid stability)
   */
  const columns = useMemo<ColDef<ExpenseRow>[]>(() => [
    {
      field: "name",
      headerName: "Expense",
      editable: true,
      valueFormatter: (p) =>
        p.data.id === "__new__" ? "➕ Add new expense…" : p.value,
    },
    {
      field: "monthly_budget",
      headerName: "Budget (DH)",
      editable: true,
      cellEditor: "agNumberCellEditor",
      valueFormatter: (p) =>
        p.data.id === "__new__" ? "" : `${p.value} DH`,
    },
    {
      field: "consumed",
      editable: false,
      valueFormatter: (p) =>
        p.data.id === "__new__" ? "" : `${p.value} DH`,
    },
    {
      field: "remaining",
      editable: false,
      valueFormatter: (p) =>
        p.data.id === "__new__" ? "" : `${p.value} DH`,
    },
    {
      field: "pctUsed",
      headerName: "% Used",
      editable: false,
      valueFormatter: (p) =>
        p.data.id === "__new__" ? "" : `${p.value}%`,
      cellStyle: (params) => {
        if (params.data.id === "__new__") return {};

        const v = params.value ?? 0;
        if (v < 50) return { color: "#16a34a", fontWeight: "600" }; // green
        if (v < 80) return { color: "#d97706", fontWeight: "600" }; // amber
        return { color: "#dc2626", fontWeight: "700" }; // red
      },
    }
    ,
    {
      headerName: "Actions",
      width: 160,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        if (params.data.id === "__new__") return null;

        return (
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedExpense(params.data)}
              className="px-2 py-1 text-xs rounded bg-gray-900 text-white"
            >
              + Add
            </button>

            <button
              onClick={async () => {
                if (!confirm("Delete this expense?")) return;
                await fetch(`/api/expenses/${params.data.id}`, {
                  method: "DELETE",
                });
                await loadExpenses();
                onRefresh?.();
              }}
              className="px-2 py-1 text-xs text-red-600"
            >
              Delete
            </button>
          </div>
        );
      },
    },
  ], [loadExpenses, onRefresh]);

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
  <input
    type="file"
    accept=".xlsx"
    onChange={async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/import/expenses", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        alert("Failed to import Excel file");
        return;
      }

      await loadExpenses();
      onRefresh?.();
    }}
    className="block text-sm"
  />
</div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="ag-theme-alpine" style={{ height: 420 }}>
          <AgGridReact
            theme="legacy" // ✅ prevents AG Grid theme conflict
            rowData={rowData}
            columnDefs={columns}
            onCellValueChanged={onCellValueChanged}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
            }}
            headerHeight={44}
            rowHeight={44}
            getRowClass={(params) =>
              params.data.id === "__new__" ? "bg-gray-50 italic" : ""
            }
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
    </>
  );
}
