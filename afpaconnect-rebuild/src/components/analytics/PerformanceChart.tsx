'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface DataKey {
  dataKey: string
  name: string
}

interface PerformanceChartProps {
  data: Record<string, unknown>[]
  title: string
  dataKeys: DataKey[]
}

const COLORS = ['#1e3a5f', '#c9a84c', '#3b82f6', '#10b981', '#f59e0b']

export default function PerformanceChart({ data, title, dataKeys }: PerformanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) =>
                new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              }
            />
            <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: 12,
              }}
              labelFormatter={(v) => new Date(v).toLocaleDateString()}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {dataKeys.map((key, i) => (
              <Line
                key={key.dataKey}
                type="monotone"
                dataKey={key.dataKey}
                name={key.name}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
