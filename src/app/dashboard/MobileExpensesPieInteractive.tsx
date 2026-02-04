"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Expense = {
  name: string
  consumed: number
}

type Props = {
  expenses: Expense[]
}

export default function MobileExpensesPieInteractive({ expenses }: Props) {
  const data = React.useMemo(
    () =>
      expenses
        .filter(e => e.consumed > 0)
        .map((e, i) => ({
          key: e.name,
          label: e.name,
          value: e.consumed,
          fill: `var(--chart-${(i % 5) + 1})`,
        })),
    [expenses]
  )

  const defaultKey = React.useMemo(() => {
  if (data.length === 0) return undefined
  return data.reduce((max, cur) =>
    cur.value > max.value ? cur : max
  ).key
    }, [data])

    const [activeKey, setActiveKey] = React.useState<string | undefined>(defaultKey)

    // keep it in sync if month changes
    React.useEffect(() => {
    setActiveKey(defaultKey)
    }, [defaultKey])

  const activeIndex = React.useMemo(
    () => data.findIndex(d => d.key === activeKey),
    [activeKey, data]
  )

  if (data.length === 0) {
    return (
      <Card className="bg-card border border-border">
        <CardContent className="p-6 text-sm text-muted-foreground">
          No consumption yet
        </CardContent>
      </Card>
    )
  }

  const chartConfig = data.reduce((acc, d) => {
    acc[d.key] = { label: d.label, color: d.fill }
    return acc
  }, {} as ChartConfig)

  const id = "expenses-mobile-pie"

  return (
    <Card data-chart={id} className="flex flex-col bg-card border border-border">
      <ChartStyle id={id} config={chartConfig} />

      <CardHeader className="flex-row items-start pb-0">
        <div className="grid gap-1">
          <CardTitle>Spending</CardTitle>
          <CardDescription>Tap to explore expenses</CardDescription>
        </div>

        <Select value={activeKey} onValueChange={setActiveKey}>
          <SelectTrigger className="ml-auto h-7 w-[140px] rounded-lg pl-2.5">
            <SelectValue placeholder="Select expense" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {data.map(d => (
              <SelectItem key={d.key} value={d.key}>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: d.fill }}
                  />
                  {d.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="flex justify-center pb-2">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[280px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 22}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !("cx" in viewBox)) return null
                  const v = data[activeIndex]?.value ?? 0
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan className="fill-foreground text-2xl font-bold">
                        {v} DH
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        dy={22}
                        className="fill-muted-foreground text-xs"
                      >
                        Consumed
                      </tspan>
                    </text>
                  )
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
