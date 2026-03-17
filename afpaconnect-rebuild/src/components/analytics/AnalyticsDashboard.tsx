'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, RefreshCw, BarChart3 } from 'lucide-react'
import AnalyticsSummaryCards from './AnalyticsSummaryCards'
import PlatformConnectionCard, { type PlatformConnection } from './PlatformConnectionCard'
import PerformanceChart from './PerformanceChart'
import GMBInsights from './GMBInsights'

interface AdMetric {
  date: string
  spend?: number
  leads?: number
  clicks?: number
  impressions?: number
}

interface GMBMetric {
  date: string
  views_maps?: number
  views_search?: number
  actions_phone?: number
}

interface DashboardData {
  connections: PlatformConnection[]
  gmb: { metrics: GMBMetric[]; summary: { totalCalls: number; totalDirections: number; totalWebsiteClicks: number; avgDailyViews: number } } | null
  ads: { metrics: AdMetric[]; summary: { totalSpend: number; totalLeads: number; totalClicks: number; totalImpressions: number; avgCostPerLead: number; avgCTR: number } } | null
  website: { metrics: unknown[]; summary: { totalSessions: number; totalUsers: number; totalPageViews: number; avgBounceRate: number } } | null
  summary: {
    totalSpend: number
    totalLeads: number
    totalClicks: number
    totalImpressions: number
    avgCostPerLead: number
    websiteVisits: number
  }
}

const PLATFORMS = [
  { id: 'google_my_business', name: 'Google My Business' },
  { id: 'meta_ads', name: 'Meta Ads' },
  { id: 'google_ads', name: 'Google Ads' },
  { id: 'google_analytics', name: 'Google Analytics' },
  { id: 'linkedin_ads', name: 'LinkedIn Ads' },
]

interface Props {
  franchiseId?: string
}

export default function AnalyticsDashboard({ franchiseId }: Props) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [dateRange, setDateRange] = useState('30days')
  const [data, setData] = useState<DashboardData | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const loadDashboard = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ dateRange })
      if (franchiseId) params.set('franchiseId', franchiseId)
      const res = await fetch(`/api/analytics/dashboard?${params}`)
      if (res.ok) setData(await res.json())
    } catch (err) {
      console.error('Failed to load analytics:', err)
    }
    setIsLoading(false)
  }, [franchiseId, dateRange])

  useEffect(() => { loadDashboard() }, [loadDashboard])

  const handleConnect = (platform: string) => {
    const params = new URLSearchParams()
    if (franchiseId) params.set('franchiseId', franchiseId)
    window.location.href = `/api/analytics/connect/${platform}?${params}`
  }

  const handleSync = async (connection: PlatformConnection) => {
    if (!connection.id) return
    setIsSyncing(true)
    try {
      await fetch(`/api/analytics/sync/${connection.id}`, { method: 'POST' })
      await loadDashboard()
    } catch (err) {
      console.error('Sync failed:', err)
    }
    setIsSyncing(false)
  }

  const handleDisconnect = async (connection: PlatformConnection) => {
    if (!connection.id) return
    if (!confirm(`Disconnect ${connection.platform.replace(/_/g, ' ')}?`)) return
    await fetch(`/api/analytics/connections/${connection.id}`, { method: 'DELETE' })
    await loadDashboard()
  }

  // Build chart data from ad metrics
  const chartData = (() => {
    if (!data?.ads?.metrics) return []
    const map: Record<string, { date: string; spend: number; leads: number; clicks: number }> = {}
    for (const m of data.ads.metrics) {
      if (!map[m.date]) map[m.date] = { date: m.date, spend: 0, leads: 0, clicks: 0 }
      map[m.date].spend += m.spend || 0
      map[m.date].leads += m.leads || 0
      map[m.date].clicks += m.clicks || 0
    }
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
  })()

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center h-72">
        <Loader2 className="w-10 h-10 animate-spin text-brand-navy" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track your marketing performance across all platforms</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadDashboard} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="gmb">Google My Business</TabsTrigger>
          <TabsTrigger value="ads">Advertising</TabsTrigger>
          <TabsTrigger value="website">Website</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <AnalyticsSummaryCards summary={data?.summary} />
          {chartData.length > 0 && (
            <PerformanceChart
              data={chartData}
              title="Ad Performance Over Time"
              dataKeys={[
                { dataKey: 'spend', name: 'Spend ($)' },
                { dataKey: 'leads', name: 'Leads' },
                { dataKey: 'clicks', name: 'Clicks' },
              ]}
            />
          )}
          <GMBInsights gmbData={data?.gmb} />
        </TabsContent>

        {/* Connections */}
        <TabsContent value="connections" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PLATFORMS.map((platform) => {
              const conn = data?.connections?.find((c) => c.platform === platform.id)
              return (
                <PlatformConnectionCard
                  key={platform.id}
                  connection={conn ?? { platform: platform.id, status: 'disconnected' }}
                  onConnect={handleConnect}
                  onSync={handleSync}
                  onDisconnect={handleDisconnect}
                  isLoading={isSyncing}
                />
              )
            })}
          </div>
        </TabsContent>

        {/* GMB */}
        <TabsContent value="gmb" className="mt-6">
          <GMBInsights gmbData={data?.gmb} />
        </TabsContent>

        {/* Ads */}
        <TabsContent value="ads" className="space-y-6 mt-6">
          {data?.ads ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Spend', value: `$${data.ads.summary.totalSpend.toFixed(2)}` },
                  { label: 'Total Leads', value: data.ads.summary.totalLeads.toLocaleString() },
                  { label: 'Cost Per Lead', value: `$${data.ads.summary.avgCostPerLead.toFixed(2)}` },
                  { label: 'CTR', value: `${data.ads.summary.avgCTR.toFixed(2)}%` },
                ].map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="p-5">
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {chartData.length > 0 && (
                <PerformanceChart
                  data={chartData}
                  title="Campaign Performance"
                  dataKeys={[
                    { dataKey: 'spend', name: 'Spend ($)' },
                    { dataKey: 'leads', name: 'Leads' },
                  ]}
                />
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Connect an advertising platform to see campaign data</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Website */}
        <TabsContent value="website" className="space-y-6 mt-6">
          {data?.website ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Sessions', value: data.website.summary.totalSessions.toLocaleString() },
                { label: 'Users', value: data.website.summary.totalUsers.toLocaleString() },
                { label: 'Page Views', value: data.website.summary.totalPageViews.toLocaleString() },
                { label: 'Bounce Rate', value: `${data.website.summary.avgBounceRate.toFixed(1)}%` },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-5">
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Connect Google Analytics to see website traffic data</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
