'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatCurrencyCompact } from '@/lib/format'

type Point = {
  label: string
  income: number
  expense: number
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      {payload.map((item: any) => (
        <div key={item.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.dataKey === 'income' ? 'Entradas' : 'Saídas'}
          </span>
          <span className="font-medium tabular-nums text-popover-foreground">
            {formatCurrency(item.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function BalanceChart({ data }: { data: Point[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Entradas x Saídas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={64}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                tickFormatter={(v) => formatCurrencyCompact(Number(v))}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
              <Bar dataKey="income" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="expense" fill="var(--chart-2)" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="size-3 rounded-full bg-chart-1" /> Entradas
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="size-3 rounded-full bg-chart-2" /> Saídas
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
