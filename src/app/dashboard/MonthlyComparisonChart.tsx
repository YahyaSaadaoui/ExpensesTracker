"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function MonthlyComparisonChart({ data }: { data: any[] }) {
  return (
   <div className="rounded-2xl bg-[#0b0b0b] p-4 shadow-sm">
    <h3 className="mb-3 text-sm font-semibold text-gray-300">
      Monthly overview
    </h3>

    <div className="h-[220px]">
      <ResponsiveContainer width="40%" height={320}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="monthly_budget" fill="#2563eb" name="Budget" />
          <Bar dataKey="consumed" fill="#dc2626" name="Consumed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
  );
}
