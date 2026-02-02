"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

type Props = {
  data: Array<{
    name: string;
    monthly_budget?: number;
    consumed?: number;
  }>;
  height?: number;
};

export default function MonthlyComparisonChart({ data, height = 260 }: Props) {
  const safe = (data ?? []).map((d) => ({
    name: d.name ?? "",
    budget: Number(d.monthly_budget ?? 0),
    consumed: Number(d.consumed ?? 0),
  }));

  const minWidth = Math.max(700, safe.length * 90);

  return (
    <div className="w-full overflow-x-auto">
      <div style={{ minWidth, height }} className="pr-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={safe}
            margin={{ top: 8, right: 12, left: 0, bottom: 36 }}
          >
            <CartesianGrid
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="name"
              interval={0}
              angle={-20}
              textAnchor="end"
              height={60}
              tick={{
                fill: "rgba(255,255,255,0.7)",
                fontSize: 12,
              }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{
                fill: "rgba(255,255,255,0.6)",
                fontSize: 12,
              }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{
                background: "rgba(12,12,12,0.98)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
                color: "white",
                boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
                fontSize: 12,
              }}
              labelStyle={{
                color: "rgba(255,255,255,0.7)",
                marginBottom: 4,
              }}
            />

            <Legend
              wrapperStyle={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 12,
              }}
            />

            <Bar
              dataKey="budget"
              name="Budget"
              fill="#3b82f6" // blue-500
              radius={[10, 10, 0, 0]}
            />

            <Bar
              dataKey="consumed"
              name="Consumed"
              fill="#22c55e" // green-500
              radius={[10, 10, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
