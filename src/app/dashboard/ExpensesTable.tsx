"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, CellValueChangedEvent } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import AddConsumptionModal from "./AddConsumptionModal";
import AddExpenseModal from "./AddExpenseModal";
import ViewConsumptionsModal from "./ViewConsumptionsModal";
import DeleteExpenseModal from "./DeleteExpenseModal";

type ExpenseRow = {
  id: string;
  name: string;
  monthly_budget: number;
  consumed: number;
  remaining: number;
  pctUsed: number;
};

export default function ExpensesTable({
  month,
  loading,
  onRefresh,
}: {
  month: string;
  loading?: boolean;
  onRefresh?: () => void;
}) {

  const [rowData, setRowData] = useState<ExpenseRow[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRow | null>(null);
  const [viewExpense, setViewExpense] = useState<ExpenseRow | null>(null);
  const [openAddExpense, setOpenAddExpense] = useState(false);
  const [deleteExpense, setDeleteExpense] = useState<ExpenseRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  


  const loadExpenses = useCallback(async () => {
    const res = await fetch(`/api/expenses?month=${month}`, { cache: "no-store" });
    if (!res.ok) return;
    const json = await res.json();
    setRowData(Array.isArray(json.expenses) ? json.expenses : []);
  }, [month]);

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
        alert("Budget must be a positive number");
        await loadExpenses();
        return;
      }
      await updateExpense(data.id, { monthly_budget: value });
    }
  };

  const columns = useMemo<ColDef<ExpenseRow>[]>(() => [
    { field: "name", headerName: "Name", editable: true },
    {
      field: "monthly_budget",
      headerName: "Budget",
      editable: true,
      cellEditor: "agNumberCellEditor",
      valueFormatter: (p) => `${p.value} DH`,
    },
    {
      field: "consumed",
      headerName: "Consumed",
      editable: false,
      valueFormatter: (p) => `${p.value} DH`,
    },
    {
      field: "remaining",
      headerName: "Remaining",
      valueFormatter: (p) => `${p.value} DH`,
    },
    {
      field: "pctUsed",
      headerName: "% Used",
      valueFormatter: (p) => `${p.value}%`,
    },
    {
      headerName: "",
      width: 200,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => (
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedExpense(params.data)}
            className="btn-apple-table"
          >
            + Add
          </button>

          <button
            onClick={() => setViewExpense(params.data)}
            className="btn-apple-table"
          >
            View
          </button>

          <button
            onClick={async () => {
              <button
                onClick={() => setDeleteExpense(params.data)}
                className="btn-apple-table-danger"
              >
                Delete
              </button>
              await fetch(`/api/expenses/${params.data.id}`, {
                method: "DELETE",
              });
              await loadExpenses();
              onRefresh?.();
            }}
            className="btn-apple-table-danger"
          >
            Delete
          </button>
        </div>
      ),
    },
  ], [loadExpenses, onRefresh]);

  return (
    <>
      {/* HEADER */}
      <div className="flex flex-wrap items-center gap-2">
        {/*<input
          type="file"
          accept=".xlsx,.xls"
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
          className="text-sm text-white/70"
        />*/}

        <button
        onClick={() => setOpenAddExpense(true)}
        className="btn-apple"
        >
        + Add Expense
        </button>

        <button
        onClick={() => {
        window.location.href = `/api/export/expenses?month=${month}`;
        }}
        className="btn-apple"
        >
        Export CSV
        </button>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl border border-white/10 bg-black/40 p-3 w-full overflow-x-auto">
      <div
        className="
          ag-theme-alpine-dark
          w-full
          min-w-[900px]
          sm:min-w-[1100px]
        "
        style={{ height: "min(620px, 70vh)" }}
      >
          <AgGridReact
            theme="legacy"
            rowData={rowData}
              columnDefs={columns}
              onCellValueChanged={onCellValueChanged}
              defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true,
                minWidth: 120,
                flex: 1,
              }}
              headerHeight={48}
              rowHeight={48}
              pagination
              paginationPageSize={20}
          />
        </div>
      </div>

      {/* MODALS */}
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

      {viewExpense && (
        <ViewConsumptionsModal
          expense={viewExpense}
          onClose={() => setViewExpense(null)}
          onChanged={async () => {
            setViewExpense(null);
            await loadExpenses();
            onRefresh?.();
          }}
        />
      )}
      {deleteExpense && (
      <DeleteExpenseModal
        expenseName={deleteExpense.name}
        loading={deleting}
        onCancel={() => setDeleteExpense(null)}
        onConfirm={async () => {
          try {
            setDeleting(true);
            await fetch(`/api/expenses/${deleteExpense.id}`, {
              method: "DELETE",
            });
            setDeleteExpense(null);
            await loadExpenses();
            onRefresh?.();
          } finally {
            setDeleting(false);
          }
        }}
      />
    )}

    </>
  );
}
