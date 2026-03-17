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
import { ArrowLeft, Plus, Globe, Loader2, AlertTriangle, Lock, Sparkles, MapPin, ExternalLink, Trash2 } from 'lucide-react'

const DEMO_AI_CITY_CONTENT: Record<string, { population: string; headline: string; aiContent: string }> = {
  Dallas: { population: '1,341,000', headline: 'offers premium franchise opportunities in the heart of Texas.', aiContent: 'Dallas presents exceptional expansion potential with a large metro population, strong consumer spending, and business-friendly conditions.' },
  Austin: { population: '978,908', headline: "brings innovative franchise concepts to Texas' tech capital.", aiContent: "Austin's high-growth technology economy and educated population align well with premium franchise concepts and fast market adoption." },
  Houston: { population: '2,304,580', headline: "expands into America's fourth-largest city.", aiContent: 'Houston offers diverse, high-density demand across multiple industries with broad suburban coverage and strong long-term growth indicators.' },
  Phoenix: { population: '1,608,139', headline: 'captures the booming Southwest market.', aiContent: 'Phoenix continues rapid migration growth, creating strong demand from both new residents and established suburban households.' },
  Miami: { population: '442,241', headline: "serves Florida's vibrant international gateway.", aiContent: "Miami's international profile, tourism volume, and affluent market segments make it a strategic city for branded franchise growth." },
}

function DemoCityBuilderContent() {
  const router = useRouter()
  const { session, loading, error, isExpired, demoData } = useDemoContext()
  const [selectedCity, setSelectedCity] = useState<{ city: string; state: string; status: string; lastUpdated: string } | null>(null)
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

  const cityPages = demoData.cityPages
  const brandName = session?.franchise_name || 'Demo Franchise'

  return (
    <div className="min-h-screen bg-slate-50">
      <DemoBanner franchiseName={session?.franchise_name} expiresAt={session?.expires_at} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push(`/demo/landing?session=${session?.session_id}`)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />Back to Demo Hub
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Brand City Pages</h1>
            <p className="text-slate-600">Location-specific landing pages for {brandName}</p>
          </div>
          <Button disabled className="opacity-50">
            <Plus className="w-4 h-4 mr-2" />Create New Page<Lock className="w-3 h-3 ml-2" />
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5" />Locations ({cityPages.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cityPages.map((page) => {
              const aiContent = DEMO_AI_CITY_CONTENT[page.city]
              const cityUrl = `/locations/${brandName.toLowerCase().replace(/\s+/g, '-')}/${page.city.toLowerCase()}`

              return (
                <div
                  key={`${page.city}-${page.state}`}
                  className={`p-4 border rounded-lg transition-all cursor-pointer ${selectedCity?.city === page.city ? 'border-2 border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}
                  onClick={() => setSelectedCity(page)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <h3 className="font-semibold text-slate-900">{brandName} — {page.city}, {page.state}</h3>
                      <Badge variant="outline" className="text-xs">
                        &ldquo;{brandName} {page.city} {aiContent?.headline?.slice(0, 32) || 'opportunity'}...&rdquo;
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled><ExternalLink className="w-3.5 h-3.5" /></Button>
                      <Button variant="outline" size="sm" disabled className="text-red-500"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 mb-3">
                    Population: {aiContent?.population || '0'} | URL: {cityUrl}
                  </div>

                  {aiContent && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700 font-medium text-sm mb-2">
                        <Sparkles className="w-4 h-4" />AI Content Generated
                      </div>
                      <p className="text-sm text-slate-700">{aiContent.aiContent}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>

        {selectedCity && (
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>{brandName} in {selectedCity.city}</CardTitle>
                <Badge className={selectedCity.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>{selectedCity.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-white">
                  <h1 className="text-2xl font-bold mb-2">{brandName} Franchise Opportunities in {selectedCity.city}, {selectedCity.state}</h1>
                  <p className="text-slate-300 text-sm">{brandName} {DEMO_AI_CITY_CONTENT[selectedCity.city]?.headline || 'has strong local opportunity in this market.'}</p>
                </div>
                <div className="p-6 bg-white">
                  <div className="flex items-center gap-2 text-green-700 font-medium text-sm mb-4"><Sparkles className="w-4 h-4" />AI-Generated Market Analysis</div>
                  <p className="text-slate-700">{DEMO_AI_CITY_CONTENT[selectedCity.city]?.aiContent || `${selectedCity.city} presents strong franchise expansion potential with sustained population and economic growth.`}</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><Globe className="w-4 h-4" />SEO Preview</h3>
                <div className="space-y-1">
                  <p className="text-blue-600 text-sm font-medium">{brandName} Franchise in {selectedCity.city}, {selectedCity.state} | Start Your Business</p>
                  <p className="text-green-700 text-xs">www.afpaconnect.com/locations/{brandName.toLowerCase().replace(/\s+/g, '-')}/{selectedCity.city.toLowerCase()}</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm font-medium">Editing and publishing are disabled in demo mode</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <strong>Demo Mode:</strong> Page creation, editing, and publishing are disabled. This is a read-only preview of the city page builder.
        </div>
      </div>

      <WalkthroughToggleButton isEnabled={walkthroughEnabled} onToggle={() => setWalkthroughEnabled(!walkthroughEnabled)} />
      <WalkthroughOverlay isEnabled={walkthroughEnabled} onToggle={() => setWalkthroughEnabled(false)} currentPage="cityBuilder" scenario={walkthroughScenario} onScenarioChange={setWalkthroughScenario} />
    </div>
  )
}

function DemoCityBuilderInner() {
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

  return <DemoProvider sessionId={sessionId}><DemoCityBuilderContent /></DemoProvider>
}

export default function DemoCityBuilder() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <DemoCityBuilderInner />
    </Suspense>
  )
}
