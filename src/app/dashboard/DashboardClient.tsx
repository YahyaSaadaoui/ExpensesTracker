"use client";

// 👇 THIS LINE IS CRITICAL
import "@/lib/agGrid";

import { useEffect, useState } from "react";
import ExpensesTable from "./ExpensesTable";
import MonthlyComparisonChart from "./MonthlyComparisonChart";

export default function DashboardClient() {
  const [expenses, setExpenses] = useState<any[]>([]);

  async function refresh() {
    const res = await fetch("/api/expenses", { cache: "no-store" });
    if (!res.ok) return;
    const json = await res.json();
    setExpenses(json.expenses ?? []);
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="space-y-6">
      <ExpensesTable onRefresh={refresh} />
      <MonthlyComparisonChart data={expenses} />
    </div>
  );
}
