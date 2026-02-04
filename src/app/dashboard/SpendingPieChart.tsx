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
  "#1F2937",
  "#374151",
  "#4B5563",
  "#6B7280",
  "#9CA3AF",
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
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 text-gray-400">
        No consumption data yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-100">
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
              contentStyle={{
                backgroundColor: "#020617", // gray-950
                border: "1px solid #1F2937",
                borderRadius: "0.5rem",
                color: "#E5E7EB",
              }}
              itemStyle={{ color: "#E5E7EB" }}
              formatter={(value) =>
                `${Number(value ?? 0)} DH`
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-gray-400">
        Total consumed:{" "}
        <span className="font-medium text-gray-100">
          {total} DH
        </span>
      </div>
    </div>
  );
}
