import { type ReactNode } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CHART_COLORS, TREND_SERIES_COLORS } from '../core/constants'
import type { ChartPoint, TrendPoint } from '../core/types'

function ChartEmpty({ message = 'No data' }: { message?: string }) {
  return (
    <div className="text-muted-foreground flex h-64 items-center justify-center text-sm">
      {message}
    </div>
  )
}

function ChartSkeleton() {
  return <div className="bg-muted/40 h-64 animate-pulse rounded-lg" />
}

interface ChartCardProps {
  title: string
  description?: string
  loading?: boolean
  children: ReactNode
  action?: ReactNode
}

function ChartCard({ title, description, loading, children, action }: ChartCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {action}
      </CardHeader>
      <CardContent>{loading ? <ChartSkeleton /> : children}</CardContent>
    </Card>
  )
}

function hasValues(data: ChartPoint[]) {
  return data.some((item) => item.value > 0)
}

interface PieChartCardProps {
  title: string
  description?: string
  data: ChartPoint[]
  loading?: boolean
  donut?: boolean
}

export function PieChartCard({
  title,
  description,
  data,
  loading,
  donut = false,
}: PieChartCardProps) {
  const chartData = data.filter((item) => item.value > 0)

  return (
    <ChartCard title={title} description={description} loading={loading}>
      {!hasValues(data) ? (
        <ChartEmpty />
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={donut ? 55 : 0}
                outerRadius={90}
                paddingAngle={2}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [Number(value ?? 0), 'Count']}
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid hsl(var(--border))',
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  )
}

interface BarChartCardProps {
  title: string
  description?: string
  data: ChartPoint[]
  loading?: boolean
  color?: string
}

export function BarChartCard({
  title,
  description,
  data,
  loading,
  color = CHART_COLORS[0],
}: BarChartCardProps) {
  return (
    <ChartCard title={title} description={description} loading={loading}>
      {!hasValues(data) ? (
        <ChartEmpty />
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={36} />
              <Tooltip
                formatter={(value) => [Number(value ?? 0), 'Count']}
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid hsl(var(--border))',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  )
}

interface TrendChartCardProps {
  title: string
  description?: string
  data: TrendPoint[]
  loading?: boolean
  action?: ReactNode
  mode?: 'bar' | 'line'
}

export function TrendChartCard({
  title,
  description,
  data,
  loading,
  action,
  mode = 'bar',
}: TrendChartCardProps) {
  const hasData = data.some(
    (point) => point.total > 0 || point.completed > 0 || point.cancelled > 0,
  )

  return (
    <ChartCard title={title} description={description} loading={loading} action={action}>
      {!hasData ? (
        <ChartEmpty />
      ) : mode === 'line' ? (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={36} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid hsl(var(--border))',
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="total"
                name="Total"
                stroke={TREND_SERIES_COLORS.total}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="completed"
                name="Completed"
                stroke={TREND_SERIES_COLORS.completed}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="cancelled"
                name="Cancelled"
                stroke={TREND_SERIES_COLORS.cancelled}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={36} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid hsl(var(--border))',
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="total" name="Total" fill={TREND_SERIES_COLORS.total} radius={[4, 4, 0, 0]} />
              <Bar
                dataKey="completed"
                name="Completed"
                fill={TREND_SERIES_COLORS.completed}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="cancelled"
                name="Cancelled"
                fill={TREND_SERIES_COLORS.cancelled}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  )
}
