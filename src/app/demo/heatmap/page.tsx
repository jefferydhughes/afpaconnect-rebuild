'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { DemoProvider, useDemoContext } from '@/components/demo/DemoContext'
import DemoBanner from '@/components/demo/DemoBanner'
import WalkthroughOverlay, { WalkthroughToggleButton } from '@/components/demo/WalkthroughOverlay'
import { useDemoAccess } from '@/components/demo/useDemoAccess'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, MapPin, TrendingUp, Loader2, AlertTriangle, Award, Info } from 'lucide-react'
import InterestHeatmap from '@/components/heatmap/InterestHeatmap'

const DEMO_STATE_HEATMAP = [
  { state: 'TX', count: 47, actions: { LIKE: 25, SAVE: 15, COMPARE: 7 } },
  { state: 'FL', count: 42, actions: { LIKE: 22, SAVE: 12, COMPARE: 8 } },
  { state: 'CA', count: 38, actions: { LIKE: 20, SAVE: 10, COMPARE: 8 } },
  { state: 'GA', count: 36, actions: { LIKE: 18, SAVE: 12, COMPARE: 6 } },
  { state: 'AZ', count: 29, actions: { LIKE: 15, SAVE: 8, COMPARE: 6 } },
  { state: 'CO', count: 24, actions: { LIKE: 12, SAVE: 8, COMPARE: 4 } },
  { state: 'TN', count: 27, actions: { LIKE: 14, SAVE: 9, COMPARE: 4 } },
  { state: 'NC', count: 22, actions: { LIKE: 11, SAVE: 7, COMPARE: 4 } },
]

const DEMO_CITY_HEATMAP = [
  { city: 'Dallas', state: 'TX', latitude: 32.7767, longitude: -96.797, count: 25 },
  { city: 'Austin', state: 'TX', latitude: 30.2672, longitude: -97.7431, count: 22 },
  { city: 'Miami', state: 'FL', latitude: 25.7617, longitude: -80.1918, count: 20 },
  { city: 'Phoenix', state: 'AZ', latitude: 33.4484, longitude: -112.074, count: 18 },
  { city: 'Atlanta', state: 'GA', latitude: 33.749, longitude: -84.388, count: 17 },
  { city: 'Denver', state: 'CO', latitude: 39.7392, longitude: -104.9903, count: 15 },
  { city: 'Nashville', state: 'TN', latitude: 36.1627, longitude: -86.7816, count: 14 },
  { city: 'Los Angeles', state: 'CA', latitude: 34.0522, longitude: -118.2437, count: 16 },
]

function DemoHeatmapContent() {
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

  const heatmapData = [...demoData.heatmapData].sort((a, b) => b.interest_score - a.interest_score)
  const totalInterests = DEMO_STATE_HEATMAP.reduce((sum, s) => sum + s.count, 0)

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500'
    if (score >= 80) return 'bg-blue-500'
    if (score >= 70) return 'bg-amber-500'
    return 'bg-slate-400'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DemoBanner franchiseName={session?.franchise_name} expiresAt={session?.expires_at} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push(`/demo/landing?session=${session?.session_id}`)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />Back to Demo Hub
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Interest Heatmap</h1>
          <p className="text-slate-600">Geographic demand signals for {session?.franchise_name}</p>
        </div>

        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Interest Heatmap — Premium Feature</h3>
                <p className="text-slate-600 mb-4">
                  Track exactly where candidates are showing interest in <strong>{session?.franchise_name}</strong>.
                  Identify hot markets and optimize expansion strategy with real-time geographic insights.
                </p>
                <div className="flex items-center gap-2 text-sm text-purple-700">
                  <Info className="w-4 h-4" />
                  <span>This feature is included in your current plan</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card><CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Interests</p>
                <p className="text-3xl font-bold text-slate-900">{totalInterests}</p>
                <p className="text-xs text-slate-500 mt-1">Likes, saves, and compares</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><TrendingUp className="w-6 h-6 text-blue-600" /></div>
            </div>
          </CardContent></Card>
          <Card><CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active States</p>
                <p className="text-3xl font-bold text-slate-900">{DEMO_STATE_HEATMAP.length}</p>
                <p className="text-xs text-slate-500 mt-1">States with interest</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><MapPin className="w-6 h-6 text-green-600" /></div>
            </div>
          </CardContent></Card>
          <Card><CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Top Market</p>
                <p className="text-xl font-bold text-slate-900">Texas</p>
                <p className="text-xs text-slate-500 mt-1">47 interests</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"><Award className="w-6 h-6 text-purple-600" /></div>
            </div>
          </CardContent></Card>
        </div>

        <Tabs defaultValue="map" className="space-y-6 mb-8">
          <TabsList>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="stats">Top Markets</TabsTrigger>
          </TabsList>
          <TabsContent value="map">
            <InterestHeatmap stateData={DEMO_STATE_HEATMAP} cityData={DEMO_CITY_HEATMAP} selectedFranchise={null} />
          </TabsContent>
          <TabsContent value="stats">
            <Card>
              <CardHeader><CardTitle>Top States by Interest</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {DEMO_STATE_HEATMAP.map((state, index) => (
                    <div key={state.state} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-slate-400 w-8">#{index + 1}</span>
                        <div>
                          <p className="font-semibold text-slate-900 text-lg">{state.state}</p>
                          <div className="flex gap-4 text-sm text-slate-600 mt-1">
                            <span>{state.actions?.LIKE || 0} likes</span>
                            <span>{state.actions?.SAVE || 0} saves</span>
                            <span>{state.actions?.COMPARE || 0} compares</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xl px-4 py-2">{state.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader><CardTitle>Market Rankings</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Rank</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Location</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Interest Score</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Inquiries</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.map((location, idx) => (
                    <tr key={`${location.city}-${location.state}`} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold ${idx < 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{idx + 1}</span>
                      </td>
                      <td className="py-3 px-4"><span className="font-medium text-slate-900">{location.city}</span><span className="text-slate-500">, {location.state}</span></td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div className={`h-full ${getScoreColor(location.interest_score)}`} style={{ width: `${location.interest_score}%` }} />
                          </div>
                          <span className="text-sm font-medium">{location.interest_score}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{location.inquiries}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-sm">+{Math.floor(idx * 3 + 5)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <strong>Demo Mode:</strong> Heatmap data is simulated. Interactive map and detailed drilling are disabled.
        </div>
      </div>

      <WalkthroughToggleButton isEnabled={walkthroughEnabled} onToggle={() => setWalkthroughEnabled(!walkthroughEnabled)} />
      <WalkthroughOverlay isEnabled={walkthroughEnabled} onToggle={() => setWalkthroughEnabled(false)} currentPage="heatmap" scenario={walkthroughScenario} onScenarioChange={setWalkthroughScenario} />
    </div>
  )
}

function DemoHeatmapInner() {
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

  return <DemoProvider sessionId={sessionId}><DemoHeatmapContent /></DemoProvider>
}

export default function DemoHeatmap() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <DemoHeatmapInner />
    </Suspense>
  )
}
