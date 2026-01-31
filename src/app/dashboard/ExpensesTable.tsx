"use client";

import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
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

export default function ExpensesTable() {
  const [rowData, setRowData] = useState<ExpenseRow[]>([]);
  const [selectedExpense, setSelectedExpense] =
    useState<ExpenseRow | null>(null);

  async function loadExpenses() {
    const res = await fetch("/api/expenses");
    if (!res.ok) return;
    const json = await res.json();
    setRowData(json.expenses);
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  const columns: ColDef[] = [
    { field: "name", editable: false },
    {
      field: "monthly_budget",
      headerName: "Budget",
      valueFormatter: (p) => `${p.value} DH`,
    },
    {
      field: "consumed",
      valueFormatter: (p) => `${p.value} DH`,
    },
    {
      field: "remaining",
      valueFormatter: (p) => `${p.value} DH`,
    },
    {
      field: "pctUsed",
      headerName: "% Used",
      valueFormatter: (p) => `${p.value}%`,
    },
    {
      headerName: "Action",
      cellRenderer: (params: any) => {
        return (
          <button
            className="px-2 py-1 text-sm bg-black text-white rounded"
            onClick={() => setSelectedExpense(params.data)}
          >
            + Add
          </button>
        );
      },
    },
  ];

return (
  <>
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div
        className="ag-theme-alpine"
        style={{ height: 420, width: "100%" }}
      >
        <AgGridReact
          rowData={rowData}
          columnDefs={columns}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
          }}
          headerHeight={44}
          rowHeight={44}
        />
      </div>
    </div>

    {selectedExpense && (
      <AddConsumptionModal
        expense={selectedExpense}
        onClose={() => setSelectedExpense(null)}
        onAdded={() => {
          setSelectedExpense(null);
          loadExpenses();
        }}
      />
    )}
  </>
);

}
