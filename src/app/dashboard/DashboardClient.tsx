"use client";

import "@/lib/agGrid";

import { useEffect, useState } from "react";
import ExpensesTable from "./ExpensesTable";
import MonthlyComparisonChart from "./MonthlyComparisonChart";

type ApiResp = {
  expenses: any[];
  summary?: { salary: number; totalSpent: number; remainingSalary: number };
  history?: { month: string; total_spent: number; remaining_salary: number }[];
  period?: { start: string; end: string; monthStart: number };
};

function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function DashboardClient() {
  const [month, setMonth] = useState(monthKey());
  const [data, setData] = useState<ApiResp | null>(null);
  const [loading, setLoading] = useState(false);

  async function refresh(targetMonth = month) {
    try {
      setLoading(true);
      const res = await fetch(`/api/expenses?month=${targetMonth}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const json = (await res.json()) as ApiResp;
      setData(json);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh(month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const lastMonth = data?.history?.[1];

  return (
  <div className="w-full px-4 pb-10 pt-6">
    <div className="mx-auto w-full max-w-6xl space-y-6">

      {/* ──────────────────────────────
         HEADER
         ────────────────────────────── */}
      <section className="rounded-3xl border border-white/10 bg-black/40 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white/90">
              Monthly overview
            </h2>
            <p className="mt-1 text-xs text-white/60">
              Budget vs consumed (selected month)
            </p>
          </div>

          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="
              h-10 rounded-2xl bg-black/90 px-4
              text-sm text-white border border-white/10 outline-none
            "
          />
        </div>
      </section>

      {/* ──────────────────────────────
         CHART + RESULTS (side by side)
         ────────────────────────────── */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Chart */}
        <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
          <MonthlyComparisonChart
            data={data?.expenses ?? []}
            height={280}
          />
        </div>

        {/* Results */}
        <aside className="h-full space-y-4 rounded-3xl border border-white/10 bg-black/40 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/90">Results</h3>
            {loading && (
              <span className="text-xs text-white/50">Loading…</span>
            )}
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl bg-black/50 border border-white/10 p-4">
              <div className="text-xs text-white/60">Total used</div>
              <div className="mt-1 text-xl font-semibold text-white">
                {data?.summary?.totalSpent ?? 0} DH
              </div>
            </div>

            <div className="rounded-2xl bg-black/50 border border-white/10 p-4">
              <div className="text-xs text-white/60">Remaining salary</div>
              <div className="mt-1 text-xl font-semibold text-white">
                {data?.summary?.remainingSalary ?? 0} DH
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="text-xs font-semibold text-white/70">
              Last month
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-black/50 border border-white/10 p-4">
                <div className="text-xs text-white/60">Spent</div>
                <div className="mt-1 text-white">
                  {lastMonth?.total_spent ?? 0} DH
                </div>
              </div>

              <div className="rounded-2xl bg-black/50 border border-white/10 p-4">
                <div className="text-xs text-white/60">Remaining</div>
                <div className="mt-1 text-white">
                  {lastMonth?.remaining_salary ?? 0} DH
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* ──────────────────────────────
         TABLE (full width, below)
         ────────────────────────────── */}
      <section className="flex-1 w-full">

        <ExpensesTable
          month={month}
          loading={loading}
          onRefresh={() => refresh(month)}
        />
      </section>

    </div>
  </div>
);
}