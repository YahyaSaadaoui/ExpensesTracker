"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import AddConsumptionModal from "./AddConsumptionModal"
import AddExpenseModal from "./AddExpenseModal"
import ViewConsumptionsModal from "./ViewConsumptionsModal"
import DeleteExpenseModal from "./DeleteExpenseModal"
import MobileExpensesAccordion from "./MobileExpensesAccordion"
import EditExpenseBudgetDialog from "./EditExpenseBudgetDialog"

type ExpenseRow = {
  id: string
  name: string
  monthly_budget: number
  consumed: number
  remaining: number
  pctUsed: number
}

type SortKey = keyof Pick<
  ExpenseRow,
  "name" | "monthly_budget" | "consumed" | "remaining" | "pctUsed"
>
type SortDir = "asc" | "desc"

function cmp(a: any, b: any) {
  if (typeof a === "string" && typeof b === "string") return a.localeCompare(b)
  return Number(a) - Number(b)
}

function formatDh(v: number) {
  return `${v} DH`
}

function SortIcon({
  active,
  dir,
}: {
  active: boolean
  dir: SortDir
}) {
  return (
    <span className="ml-1 inline-block text-[10px] text-white/50">
      {active ? (dir === "asc" ? "▲" : "▼") : "↕"}
    </span>
  )
}

function SkeletonRows({ rows = 8 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} className="border-white/10">
          {Array.from({ length: 6 }).map((__, j) => (
            <TableCell key={j}>
              <div className="h-4 w-full max-w-[220px] animate-pulse rounded-md bg-white/10" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

export default function ExpensesTable({
  month,
  loading,
  onRefresh,
}: {
  month: string
  loading?: boolean
  onRefresh?: () => void
}) {
  const [rowData, setRowData] = useState<ExpenseRow[]>([])
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRow | null>(null)
  const [viewExpense, setViewExpense] = useState<ExpenseRow | null>(null)
  const [openAddExpense, setOpenAddExpense] = useState(false)
  const [deleteExpense, setDeleteExpense] = useState<ExpenseRow | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editExpense, setEditExpense] = useState<ExpenseRow | null>(null)

  // local loading for initial load / refetch
  const [localLoading, setLocalLoading] = useState(false)

  // sorting
  const [sortKey, setSortKey] = useState<SortKey>("consumed")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  // pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(30)

  // keyboard navigation
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const tableWrapRef = useRef<HTMLDivElement | null>(null)

  const isBusy = Boolean(loading) || localLoading

  const loadExpenses = useCallback(async () => {
    try {
      setLocalLoading(true)
      const res = await fetch(`/api/expenses?month=${month}`, { cache: "no-store" })
      if (!res.ok) return
      const json = await res.json()
      const list = Array.isArray(json.expenses) ? (json.expenses as ExpenseRow[]) : []
      setRowData(list)

      // keep focus stable
      setFocusedId((prev) => {
        if (!prev) return list[0]?.id ?? null
        return list.some((x) => x.id === prev) ? prev : list[0]?.id ?? null
      })

      // reset page when month changes or data changes
      setPage(1)
    } finally {
      setLocalLoading(false)
    }
  }, [month])

  useEffect(() => {
    loadExpenses()
  }, [loadExpenses])

  async function updateExpenseBudget(id: string, value: number) {
    await fetch(`/api/expenses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthly_budget: value }),
    })
    await loadExpenses()
    onRefresh?.()
  }

  const sorted = useMemo(() => {
    const arr = [...rowData]
    arr.sort((x, y) => {
      const a = x[sortKey]
      const b = y[sortKey]
      const c = cmp(a, b)
      return sortDir === "asc" ? c : -c
    })
    return arr
  }, [rowData, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, totalPages)

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, safePage, pageSize])

  useEffect(() => {
    if (page !== safePage) setPage(safePage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safePage])

  function toggleSort(k: SortKey) {
    setPage(1)
    setSortKey((prev) => {
      if (prev !== k) {
        setSortDir("asc")
        return k
      }
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
      return prev
    })
  }

  function focusIndex(idx: number) {
    const item = pageItems[idx]
    if (!item) return
    setFocusedId(item.id)
  }

  const focusedIndex = useMemo(() => {
    if (!focusedId) return -1
    return pageItems.findIndex((x) => x.id === focusedId)
  }, [focusedId, pageItems])

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    // ignore when modal open (basic guard)
    if (openAddExpense || selectedExpense || viewExpense || deleteExpense) return

    // only act if wrapper is focused
    const key = e.key

    if (key === "ArrowDown") {
      e.preventDefault()
      focusIndex(Math.min(pageItems.length - 1, Math.max(0, focusedIndex + 1)))
      return
    }
    if (key === "ArrowUp") {
      e.preventDefault()
      focusIndex(Math.max(0, focusedIndex - 1))
      return
    }
    if (key === "Enter") {
      e.preventDefault()
      const exp = pageItems[focusedIndex] ?? pageItems[0]
      if (exp) setViewExpense(exp)
      return
    }
    if (key.toLowerCase() === "a") {
      e.preventDefault()
      const exp = pageItems[focusedIndex] ?? pageItems[0]
      if (exp) setSelectedExpense(exp)
      return
    }
    if (key === "Delete" || key === "Backspace") {
      e.preventDefault()
      const exp = pageItems[focusedIndex] ?? pageItems[0]
      if (exp) setDeleteExpense(exp)
      return
    }
    if (key === "PageDown") {
      e.preventDefault()
      setPage((p) => Math.min(totalPages, p + 1))
      return
    }
    if (key === "PageUp") {
      e.preventDefault()
      setPage((p) => Math.max(1, p - 1))
      return
    }
  }

  return (
    <>
      {/* HEADER */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button onClick={() => setOpenAddExpense(true)} className="btn-apple">
          + Add Expense
        </button>

        <button
          onClick={() => (window.location.href = `/api/export/expenses?month=${month}`)}
          className="btn-apple"
        >
          Export CSV
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="rounded-2xl border border-white/10 bg-black/40 p-3 w-full">
        {/* 🖥 Desktop table */}
        <div className="hidden lg:block">
          <div
            ref={tableWrapRef}
            tabIndex={0}
            onKeyDown={onKeyDown}
            className="
              outline-none rounded-xl
              ring-1 ring-transparent focus:ring-white/20
            "
          >
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort("name")}
                  >
                    Name
                    <SortIcon active={sortKey === "name"} dir={sortDir} />
                  </TableHead>

                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort("monthly_budget")}
                  >
                    Budget
                    <SortIcon active={sortKey === "monthly_budget"} dir={sortDir} />
                  </TableHead>

                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort("consumed")}
                  >
                    Consumed
                    <SortIcon active={sortKey === "consumed"} dir={sortDir} />
                  </TableHead>

                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort("remaining")}
                  >
                    Remaining
                    <SortIcon active={sortKey === "remaining"} dir={sortDir} />
                  </TableHead>

                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort("pctUsed")}
                  >
                    % Used
                    <SortIcon active={sortKey === "pctUsed"} dir={sortDir} />
                  </TableHead>

                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isBusy ? (
                  <SkeletonRows rows={8} />
                ) : pageItems.length ? (
                  pageItems.map((exp) => {
                    const isFocused = exp.id === focusedId
                    return (
                      <TableRow
                        key={exp.id}
                        className={[
                          "border-white/10",
                          "transition-colors duration-150",
                          "hover:bg-white/5",
                          isFocused ? "bg-white/7" : "",
                        ].join(" ")}
                        onMouseEnter={() => setFocusedId(exp.id)}
                        onClick={() => setFocusedId(exp.id)}
                      >
                        <TableCell className="font-medium text-white/90">
                          {exp.name}
                        </TableCell>

                        <TableCell className="text-white/80">
                          {formatDh(exp.monthly_budget)}
                        </TableCell>

                        <TableCell className="text-white/80">
                          {formatDh(exp.consumed)}
                        </TableCell>

                        <TableCell className="text-white/80">
                          {formatDh(exp.remaining)}
                        </TableCell>

                        <TableCell className="text-white/80">
                          {exp.pctUsed}%
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setSelectedExpense(exp)}
                              className="btn-apple-table"
                            >
                              + Add
                            </button>

                            <button
                              onClick={() => setViewExpense(exp)}
                              className="btn-apple-table"
                            >
                              View
                            </button>

                            <button
                              onClick={() => setDeleteExpense(exp)}
                              className="btn-apple-table-danger"
                            >
                              Delete
                            </button>
                            <button
                            className="btn-apple-table"
                            onClick={() => setEditExpense(exp)}
                          >
                            Edit budget
                          </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow className="border-white/10">
                    <TableCell colSpan={6} className="text-center text-white/50">
                      No expenses yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination footer */}
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="text-xs text-white/60">
                {sorted.length
                  ? `Showing ${(safePage - 1) * pageSize + 1}-${Math.min(
                      safePage * pageSize,
                      sorted.length
                    )} of ${sorted.length}`
                  : "—"}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setPage(1)
                  }}
                  className="h-9 rounded-xl bg-black/60 border border-white/10 px-3 text-sm text-white outline-none"
                >
                  {[10, 20, 30, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}/page
                    </option>
                  ))}
                </select>

                <button
                  className="btn-apple"
                  onClick={() => setPage(1)}
                  disabled={safePage === 1 || isBusy}
                >
                  {"<<"}
                </button>
                <button
                  className="btn-apple"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1 || isBusy}
                >
                  {"<"}
                </button>

                <div className="text-sm text-white/80 min-w-[86px] text-center">
                  {safePage} / {totalPages}
                </div>

                <button
                  className="btn-apple"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages || isBusy}
                >
                  {">"}
                </button>
                <button
                  className="btn-apple"
                  onClick={() => setPage(totalPages)}
                  disabled={safePage === totalPages || isBusy}
                >
                  {">>"}
                </button>
              </div>
            </div>

            {/* Keyboard hint */}
            <div className="mt-2 text-[11px] text-white/40">
              Keyboard: ↑ ↓ to move • Enter view • A add • Del delete • PgUp/PgDn change page
            </div>
          </div>
        </div>

        {/* 📱 Mobile accordion */}
        <div className="block lg:hidden">
          <MobileExpensesAccordion
            expenses={rowData}
            onAdd={setSelectedExpense}
            onView={setViewExpense}
            onDelete={async (id) => {
              await fetch(`/api/expenses/${id}`, { method: "DELETE" })
              loadExpenses()
              onRefresh?.()
            }}
            onUpdateBudget={async (id, value) => {
              await updateExpenseBudget(id, value)
            }}
          />
        </div>
      </div>

      {/* MODALS */}
      {openAddExpense && (
        <AddExpenseModal
          onClose={() => setOpenAddExpense(false)}
          onAdded={async () => {
            setOpenAddExpense(false)
            await loadExpenses()
            onRefresh?.()
          }}
        />
      )}

      {selectedExpense && (
        <AddConsumptionModal
          expense={selectedExpense}
          onClose={() => setSelectedExpense(null)}
          onAdded={async () => {
            setSelectedExpense(null)
            await loadExpenses()
            onRefresh?.()
          }}
        />
      )}

      {viewExpense && (
        <ViewConsumptionsModal
          expense={viewExpense}
          onClose={() => setViewExpense(null)}
          onChanged={async () => {
            setViewExpense(null)
            await loadExpenses()
            onRefresh?.()
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
              setDeleting(true)
              await fetch(`/api/expenses/${deleteExpense.id}`, { method: "DELETE" })
              setDeleteExpense(null)
              await loadExpenses()
              onRefresh?.()
            } finally {
              setDeleting(false)
            }
          }}
        />
      )}
      {editExpense && (
      <EditExpenseBudgetDialog
        expense={editExpense}
        onClose={() => setEditExpense(null)}
        onSaved={async () => {
          setEditExpense(null)
          await loadExpenses()
          onRefresh?.()
        }}
      />
      )}

    </>
  )
}
