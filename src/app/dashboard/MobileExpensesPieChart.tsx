"use client"

import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

type Expense = {
  name: string
  consumed: number
}

export default function MobileExpensesPieChart({
  expenses,
}: {
  expenses: Expense[]
}) {
  const data = expenses
    .filter((e) => e.consumed > 0)
    .map((e, i) => ({
      label: e.name,
      value: e.consumed,
      fill: `var(--chart-${(i % 5) + 1})`,
    }))

  if (data.length === 0) {
    return (
      <Card className="bg-black/40 border-white/10 text-white">
        <CardContent className="py-10 text-center text-white/60">
          No consumption yet
        </CardContent>
      </Card>
    )
  }

  const chartConfig: ChartConfig = {
    value: { label: "Consumed" },
  }

  return (
    <Card className="bg-black/40 border-white/10 text-white">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-white">
          Spending distribution
        </CardTitle>
        <CardDescription className="text-white/60">
          Current month
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="
            [&_.recharts-pie-label-text]:fill-white
            mx-auto aspect-square max-h-[260px]
          "
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(v) => `${v} DH`}
                />
              }
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              label
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
