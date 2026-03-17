'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { DemoProvider, useDemoContext } from '@/components/demo/DemoContext'
import DemoBanner from '@/components/demo/DemoBanner'
import WalkthroughOverlay, { WalkthroughToggleButton } from '@/components/demo/WalkthroughOverlay'
import { useDemoAccess } from '@/components/demo/useDemoAccess'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users, Target, TrendingUp, Clock, Loader2, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

function DemoAnalyticsContent() {
  const router = useRouter()
  const { session, loading, error, isExpired, demoData } = useDemoContext()
  const [walkthroughEnabled, setWalkthroughEnabled] = useState(false)
  const [walkthroughScenario, setWalkthroughScenario] = useState('standard')

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>

  if (error || isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{isExpired ? 'Demo Expired' : 'Demo Not Found'}</h1>
            <Button onClick={() => router.push('/demo/builder')} className="mt-6">Create New Demo</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const analytics = demoData.analytics
  const statCards = [
    { label: 'Total Leads', value: analytics.totalLeads, icon: Users, color: 'text-blue-600 bg-blue-100' },
    { label: 'Qualified Leads', value: analytics.qualifiedLeads, icon: Target, color: 'text-green-600 bg-green-100' },
    { label: 'Conversion Rate', value: `${analytics.conversionRate}%`, icon: TrendingUp, color: 'text-purple-600 bg-purple-100' },
    { label: 'Avg. Days to Qualify', value: analytics.avgTimeToQualify, icon: Clock, color: 'text-amber-600 bg-amber-100' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <DemoBanner franchiseName={session?.franchise_name} expiresAt={session?.expires_at} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push(`/demo/landing?session=${session?.session_id}`)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />Back to Demo Hub
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-600">Performance metrics for {session?.franchise_name}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <Card key={idx}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stat.color}`}><Icon className="w-5 h-5" /></div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                      <p className="text-xs text-slate-500">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader><CardTitle className="text-lg">Monthly Lead Trend</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} name="Total Leads" />
                    <Line type="monotone" dataKey="qualified" stroke="#22c55e" strokeWidth={2} name="Qualified" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Lead Sources</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topSources} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                    <YAxis dataKey="source" type="category" stroke="#64748b" fontSize={12} width={100} />
                    <Tooltip />
                    <Bar dataKey="leads" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">Conversion Funnel</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.funnelStages.map((stage, idx) => {
                const percentage = idx === 0 ? 100 : Math.round((stage.count / analytics.funnelStages[0].count) * 100)
                return (
                  <div key={stage.stage} className="flex items-center gap-4">
                    <div className="w-32 text-sm text-slate-600 shrink-0">{stage.stage}</div>
                    <div className="flex-1 bg-slate-100 rounded-full h-8 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-end pr-3" style={{ width: `${percentage}%` }}>
                        <span className="text-xs font-semibold text-white">{stage.count.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="w-12 text-sm text-slate-500 text-right">{percentage}%</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <strong>Demo Mode:</strong> Analytics data is simulated. Export and date range filtering are disabled.
        </div>
      </div>

      <WalkthroughToggleButton isEnabled={walkthroughEnabled} onToggle={() => setWalkthroughEnabled(!walkthroughEnabled)} />
      <WalkthroughOverlay isEnabled={walkthroughEnabled} onToggle={() => setWalkthroughEnabled(false)} currentPage="analytics" scenario={walkthroughScenario} onScenarioChange={setWalkthroughScenario} />
    </div>
  )
}

function DemoAnalyticsInner() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session')
  const router = useRouter()
  const hasAccess = useDemoAccess()

  if (hasAccess === null) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>
  if (!hasAccess) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card><CardContent className="p-8 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <Button onClick={() => router.push('/')} className="mt-6">Return Home</Button>
      </CardContent></Card>
    </div>
  )

  return <DemoProvider sessionId={sessionId}><DemoAnalyticsContent /></DemoProvider>
}

export default function DemoAnalytics() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <DemoAnalyticsInner />
    </Suspense>
  )
}
