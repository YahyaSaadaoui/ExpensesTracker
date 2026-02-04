"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

type Props = {
  expenses: {
    name: string
    monthly_budget: number
    consumed: number
  }[]
}

const chartConfig = {
  budget: {
    label: "Budget",
    color: "var(--chart-1)",
  },
  consumed: {
    label: "Consumed",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export default function DesktopExpensesChart({ expenses }: Props) {
  const chartData = expenses.map(e => ({
    name: e.name,
    budget: e.monthly_budget,
    consumed: e.consumed,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs Consumed</CardTitle>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
            />

            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />

            <Bar
              dataKey="budget"
              stackId="a"
              fill="var(--color-budget)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="consumed"
              stackId="a"
              fill="var(--color-consumed)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
