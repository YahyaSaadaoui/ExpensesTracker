"use client"

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

type Props = {
  expenses: {
    name: string
    consumed: number
  }[]
}

const chartConfig = {
  consumed: {
    label: "Consumed",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export default function MobileExpensesRadar({ expenses }: Props) {
  const chartData = expenses.map(e => ({
    name: e.name,
    consumed: e.consumed,
  }))

  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle>Spending overview</CardTitle>
      </CardHeader>

      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[260px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="name" />
            <PolarGrid />
            <Radar
              dataKey="consumed"
              fill="var(--color-consumed)"
              fillOpacity={0.6}
              dot={{ r: 4 }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
