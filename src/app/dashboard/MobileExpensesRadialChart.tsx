"use client"

import { TrendingUp } from "lucide-react"
import { LabelList, RadialBar, RadialBarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

export default function MobileExpensesRadialChart({
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

      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[260px]"
        >
          <RadialBarChart
            data={data}
            startAngle={-90}
            endAngle={360}
            innerRadius={35}
            outerRadius={120}
          >
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(v) => `${v} DH`}
                />
              }
            />

            <RadialBar dataKey="value" background>
              <LabelList
                dataKey="label"
                position="insideStart"
                className="fill-white text-xs capitalize mix-blend-luminosity"
              />
            </RadialBar>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm text-white/70">
        <div className="flex items-center gap-2 font-medium text-white">
          Mobile-friendly overview <TrendingUp className="h-4 w-4" />
        </div>
        <div>Tap sections to inspect values</div>
      </CardFooter>
    </Card>
  )
}
