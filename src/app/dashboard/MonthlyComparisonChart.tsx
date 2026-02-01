"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function MonthlyComparisonChart({ data }: { data: any[] }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Budget vs Consumed</h2>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="monthly_budget" fill="#2563eb" name="Budget" />
          <Bar dataKey="consumed" fill="#dc2626" name="Consumed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
