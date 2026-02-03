"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type PieItem = {
  name: string;
  consumed: number;
};
type Props = {
  refreshKey: number;
};


const COLORS = [
  "#111827", // gray-900
  "#374151", // gray-700
  "#6B7280", // gray-500
  "#9CA3AF", // gray-400
  "#D1D5DB", // gray-300
];

export default function SpendingPieChart({ refreshKey }: Props) {

  const [data, setData] = useState<PieItem[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
  (async () => {
    const res = await fetch("/api/summary");
    if (!res.ok) return;

    const json = await res.json();
    const pieData = (json.pie || []).filter(
      (p: any) => p.consumed > 0
    );

    setData(pieData);
    setTotal(json.totalConsumed || 0);
  })();
}, [refreshKey]);

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-500">
        No consumption data yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Spending distribution
      </h2>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="consumed"
              nameKey="name"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) => {
                if (value == null) return "0 DH";
                return `${Number(value)} DH`;
              }}
            />

          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Total consumed:{" "}
        <span className="font-medium text-gray-900">
          {total} DH
        </span>
      </div>
    </div>
  );
}
