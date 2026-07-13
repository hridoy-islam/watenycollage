

import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { date: "3 Aug", stockCount: 200 },
  { date: "4 Aug", stockCount: 190 },
  { date: "5 Aug", stockCount: 180 },
  { date: "7 Aug", stockCount: 170 },
  { date: "8 Aug", stockCount: 160 },
  { date: "9 Aug", stockCount: 150 },
  { date: "10 Aug", stockCount: 150 },
  { date: "11 Aug", stockCount: 150 },
  { date: "12 Aug", stockCount: 150 },
  { date: "13 Aug", stockCount: 150 },
  { date: "14 Aug", stockCount: 150 },
  { date: "15 Aug", stockCount: 150 },
  { date: "16 Aug", stockCount: 150 },
  { date: "17 Aug", stockCount: 150 },
]

export function StockChart() {
  return (
    <div className="h-80">
      <ChartContainer
        config={{
          stockCount: {
            label: "Stock Count",
            color: "hsl(var(--chart-1))",
          },
        }}
        className="h-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              label={{ value: "Stock Count (ml)", angle: -90, position: "insideLeft" }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="stockCount"
              stroke="var(--color-stockCount)"
              strokeWidth={2}
              dot={{ fill: "var(--color-stockCount)", strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
