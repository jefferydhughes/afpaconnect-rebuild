'use client'

import React from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import { Brain } from 'lucide-react'

interface TraitDimension {
  dimension: string
  trait: string
  score: number
}

export default function RadarSummaryChart({ traits }: { traits: TraitDimension[] }) {
  if (!traits || traits.length === 0) {
    return (
      <div className="text-center p-8 text-slate-500">
        <Brain className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <p className="text-lg font-semibold text-slate-700 mb-2">
          No Dimension Data Available
        </p>
        <p className="text-slate-600 text-center max-w-sm mx-auto">
          Complete the assessment to see your personality dimensions visualized in a radar chart.
        </p>
      </div>
    )
  }

  const chartData = traits.map((trait) => ({
    dimension: trait.dimension,
    score: trait.score,
    normalizedScore: Math.min((trait.score / 15) * 100, 100),
    trait: trait.trait,
  }))

  const formatLabel = (value: string) => {
    if (value.length > 12) {
      const words = value.split(' ')
      if (words.length > 1) {
        return words.join('\n')
      }
    }
    return value
  }

  return (
    <div className="w-full h-96 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData}>
          <PolarGrid stroke="#e2e8f0" strokeWidth={1} radialLines={true} />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 12, fontWeight: 500, fill: '#475569', textAnchor: 'middle' }}
            tickFormatter={formatLabel}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickCount={5}
          />
          <Radar
            name="Personality Dimensions"
            dataKey="normalizedScore"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.15}
            strokeWidth={2}
            dot={{ r: 4, fill: '#1d4ed8', strokeWidth: 2, stroke: '#ffffff' } as any}
          />
        </RadarChart>
      </ResponsiveContainer>

      <div className="mt-4 text-center">
        <p className="text-sm text-slate-600 mb-2">
          Your strongest traits across personality dimensions
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {chartData.map((item, index) => (
            <div key={index} className="text-xs bg-slate-100 px-2 py-1 rounded">
              <span className="font-medium text-slate-700">{item.dimension}:</span>{' '}
              <span className="text-blue-600 font-semibold">{item.trait}</span>
              <span className="text-slate-500 ml-1">({item.score})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
