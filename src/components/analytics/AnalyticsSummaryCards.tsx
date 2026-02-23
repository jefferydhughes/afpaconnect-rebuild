'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  DollarSign,
  Users,
  MousePointerClick,
  Eye,
  TrendingUp,
  Globe,
} from 'lucide-react'

interface Summary {
  totalSpend?: number
  totalLeads?: number
  avgCostPerLead?: number
  totalClicks?: number
  totalImpressions?: number
  websiteVisits?: number
}

export default function AnalyticsSummaryCards({ summary }: { summary?: Summary }) {
  const cards = [
    {
      title: 'Total Ad Spend',
      value: `$${(summary?.totalSpend ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Total Leads',
      value: (summary?.totalLeads ?? 0).toLocaleString(),
      icon: Users,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Avg Cost Per Lead',
      value: `$${(summary?.avgCostPerLead ?? 0).toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Total Clicks',
      value: (summary?.totalClicks ?? 0).toLocaleString(),
      icon: MousePointerClick,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      title: 'Total Impressions',
      value: (summary?.totalImpressions ?? 0).toLocaleString(),
      icon: Eye,
      color: 'bg-pink-100 text-pink-600',
    },
    {
      title: 'Website Visits',
      value: (summary?.websiteVisits ?? 0).toLocaleString(),
      icon: Globe,
      color: 'bg-teal-100 text-teal-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
