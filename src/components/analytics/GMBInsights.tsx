'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, Navigation, Globe, Eye, MapPin } from 'lucide-react'

interface GMBMetric {
  date: string
  views_maps?: number
  views_search?: number
  actions_phone?: number
}

interface GMBSummary {
  totalCalls: number
  totalDirections: number
  totalWebsiteClicks: number
  avgDailyViews: number
}

interface GMBData {
  metrics: GMBMetric[]
  summary: GMBSummary
}

export default function GMBInsights({ gmbData }: { gmbData?: GMBData | null }) {
  if (!gmbData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Google My Business Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">Connect Google My Business to see insights.</p>
        </CardContent>
      </Card>
    )
  }

  const insights = [
    {
      label: 'Phone Calls',
      value: gmbData.summary.totalCalls,
      icon: Phone,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Direction Requests',
      value: gmbData.summary.totalDirections,
      icon: Navigation,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Website Clicks',
      value: gmbData.summary.totalWebsiteClicks,
      icon: Globe,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Avg Daily Views',
      value: Math.round(gmbData.summary.avgDailyViews),
      icon: Eye,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Google My Business Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {insights.map((insight) => {
            const Icon = insight.icon
            return (
              <div key={insight.label} className={`text-center p-4 rounded-xl ${insight.bg}`}>
                <Icon className={`w-7 h-7 mx-auto mb-2 ${insight.color}`} />
                <p className="text-2xl font-bold text-gray-900">{insight.value.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">{insight.label}</p>
              </div>
            )
          })}
        </div>

        {gmbData.metrics.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h4>
            <div className="space-y-1.5">
              {gmbData.metrics.slice(0, 7).map((metric, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center px-3 py-2 rounded-lg bg-gray-50 text-sm"
                >
                  <span className="text-gray-500">
                    {new Date(metric.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <div className="flex gap-4 text-gray-600">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {((metric.views_maps || 0) + (metric.views_search || 0)).toLocaleString()} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {(metric.actions_phone || 0)} calls
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
