'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface StateData {
  state: string
  count: number
  actions?: { LIKE?: number; SAVE?: number; COMPARE?: number }
}

interface CityData {
  city: string
  state: string
  latitude: number
  longitude: number
  count: number
}

interface Props {
  stateData: StateData[]
  cityData?: CityData[]
  selectedFranchise?: unknown
}

// Normalize lng/lat to approximate US map position (0–100 scale)
// US bounds: lat 24–49, lng -125 to -66
const toX = (lng: number) => Math.round(((lng - (-125)) / ((-66) - (-125))) * 100)
const toY = (lat: number) => Math.round(100 - ((lat - 24) / (49 - 24)) * 100)

const getColor = (count: number, max: number) => {
  const ratio = count / max
  if (ratio > 0.7) return '#DC2626'
  if (ratio > 0.4) return '#F97316'
  if (ratio > 0.2) return '#F59E0B'
  if (ratio > 0.1) return '#10B981'
  return '#3B82F6'
}

interface TooltipPayload {
  payload?: CityData & { x: number; y: number; z: number; color: string }
}

function CustomDot(props: any) {
  const { cx, cy, payload } = props
  return (
    <circle
      cx={cx}
      cy={cy}
      r={Math.max(8, Math.sqrt(payload.z) * 2)}
      fill={payload.color}
      fillOpacity={0.7}
      stroke={payload.color}
      strokeWidth={2}
    />
  )
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-900">{d.city}, {d.state}</p>
      <p className="text-slate-600">{d.count} interests</p>
    </div>
  )
}

export default function InterestHeatmap({ stateData, cityData }: Props) {
  const showCityData = cityData && cityData.length > 0

  if (showCityData) {
    const max = Math.max(...cityData.map((d) => d.count), 1)
    const scatterData = cityData.map((d) => ({
      ...d,
      x: toX(d.longitude),
      y: toY(d.latitude),
      z: d.count,
      color: getColor(d.count, max),
    }))

    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <p className="text-xs text-slate-500 mb-3 text-center">City-level interest distribution (approximate geographic positions)</p>
          <div className="h-72 bg-slate-50 rounded-lg border border-slate-200 relative">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 16, right: 16, bottom: 16, left: 16 }}>
                <XAxis dataKey="x" type="number" domain={[0, 100]} hide />
                <YAxis dataKey="y" type="number" domain={[0, 100]} hide />
                <ZAxis dataKey="z" range={[40, 400]} />
                <Tooltip content={<CustomTooltip />} />
                <Scatter data={scatterData} shape={<CustomDot />}>
                  {scatterData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {cityData.sort((a, b) => b.count - a.count).map((d) => (
              <div key={`${d.city}-${d.state}`} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getColor(d.count, Math.max(...cityData.map((x) => x.count), 1)) }}
                />
                <span className="text-xs text-slate-600">{d.city}, {d.state} ({d.count})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // State-level view — render as a ranked list with bar indicators
  const max = Math.max(...stateData.map((d) => d.count), 1)

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <p className="text-xs text-slate-500 mb-4 text-center">State-level interest distribution</p>
        <div className="space-y-3">
          {stateData.sort((a, b) => b.count - a.count).map((d) => (
            <div key={d.state} className="flex items-center gap-3">
              <div className="w-8 text-sm font-semibold text-slate-700">{d.state}</div>
              <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                <div
                  className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
                  style={{
                    width: `${(d.count / max) * 100}%`,
                    backgroundColor: getColor(d.count, max),
                  }}
                >
                  <span className="text-xs font-bold text-white">{d.count}</span>
                </div>
              </div>
              {d.actions && (
                <div className="hidden sm:flex gap-2 text-xs text-slate-500 w-40">
                  <Badge variant="outline" className="text-[10px]">{d.actions.LIKE ?? 0} likes</Badge>
                  <Badge variant="outline" className="text-[10px]">{d.actions.SAVE ?? 0} saves</Badge>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
