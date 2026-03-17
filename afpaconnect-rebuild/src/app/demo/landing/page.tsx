'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { DemoProvider, useDemoContext } from '@/components/demo/DemoContext'
import DemoBanner from '@/components/demo/DemoBanner'
import WalkthroughOverlay, { WalkthroughToggleButton } from '@/components/demo/WalkthroughOverlay'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDemoAccess } from '@/components/demo/useDemoAccess'
import {
  FileText, MapPin, BarChart3, Users, Building2, Loader2,
  AlertTriangle, ArrowRight, Briefcase, UserRound,
} from 'lucide-react'

function DemoLandingContent() {
  const router = useRouter()
  const { session, loading, error, isExpired, demoData, personas } = useDemoContext()
  const [walkthroughEnabled, setWalkthroughEnabled] = useState(false)
  const [walkthroughScenario, setWalkthroughScenario] = useState('standard')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {isExpired ? 'Demo Expired' : 'Demo Session Loaded with Fallback'}
            </h1>
            <p className="text-slate-600">{error || 'Using default demo dataset.'}</p>
            <Button onClick={() => router.push('/demo/builder')} className="mt-6">Back to Demo Builder</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sessionId = session?.session_id

  const demoModules = [
    { id: 'applications', title: 'Applications Viewer', description: 'Review and qualify incoming applications', icon: FileText, count: demoData.applications.length, color: 'bg-blue-500', href: `/demo/applications?session=${sessionId}` },
    { id: 'heatmap', title: 'Interest Heatmap', description: 'Track market demand by geography', icon: MapPin, count: `${demoData.heatmapData.length} cities`, color: 'bg-green-500', href: `/demo/heatmap?session=${sessionId}` },
    { id: 'analytics', title: 'Analytics Dashboard', description: 'Monitor funnel performance and conversion', icon: BarChart3, count: `${demoData.analytics.totalLeads} leads`, color: 'bg-violet-500', href: `/demo/analytics?session=${sessionId}` },
    { id: 'candidates', title: 'Candidate Profiles', description: 'Evaluate fit, DISC profile, and intent', icon: Users, count: demoData.candidates.length, color: 'bg-amber-500', href: `/demo/candidates?session=${sessionId}` },
    { id: 'city-builder', title: 'Brand City Pages', description: 'Preview local SEO page generation', icon: Building2, count: `${demoData.cityPages.length} pages`, color: 'bg-teal-500', href: `/demo/city-builder?session=${sessionId}` },
  ]

  const tracks = [
    { id: 'franchisor', icon: Briefcase, title: 'Franchisor Track', steps: ['Applications Viewer', 'Analytics Dashboard', 'Brand City Pages'], description: personas.franchisor.narrative },
    { id: 'advisor', icon: Users, title: 'Advisor Track', steps: ['Applications Viewer', 'Candidate Profiles', 'Interest Heatmap'], description: personas.advisor.narrative },
    { id: 'candidate', icon: UserRound, title: 'Candidate Track', steps: ['Candidate Profiles', 'Applications Viewer'], description: personas.candidate.narrative },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <DemoBanner franchiseName={session?.franchise_name} expiresAt={session?.expires_at} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {session?.franchise_logo_url ? (
              <img src={session.franchise_logo_url} alt={session.franchise_name} className="w-16 h-16 rounded-xl object-contain bg-white border shadow-sm" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-slate-400" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{session?.franchise_name} Demo</h1>
              <p className="text-slate-600">Sales sandbox showing franchisor, advisor, and candidate experiences</p>
            </div>
          </div>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Recommended Demo Tracks</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {tracks.map((track) => {
                const Icon = track.icon
                return (
                  <div key={track.id} className="p-4 border border-slate-200 rounded-lg bg-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-slate-700" />
                      <p className="font-semibold text-slate-900">{track.title}</p>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{track.description}</p>
                    <p className="text-xs text-slate-500">Sequence: {track.steps.join(' → ')}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-module-grid>
          {demoModules.map((module) => {
            const Icon = module.icon
            return (
              <Card
                key={module.id}
                className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-slate-300"
                onClick={() => router.push(module.href)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${module.color} text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">{module.count}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">{module.title}</h3>
                  <p className="text-sm text-slate-600 mb-4">{module.description}</p>
                  <div className="flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 transition-all">
                    <span>Open Module</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
          <h3 className="font-semibold text-amber-900 mb-2">About This Demo</h3>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• All records are simulated and safe for live demos.</li>
            <li>• Changes in demo mode are not persisted to production data.</li>
            <li>• Export and external integration actions are disabled.</li>
            <li>• Session links expire automatically (default 24 hours).</li>
          </ul>
        </div>

        <div className="mt-6">
          <Badge variant="outline">Session ID: {sessionId}</Badge>
        </div>
      </div>

      <WalkthroughToggleButton isEnabled={walkthroughEnabled} onToggle={() => setWalkthroughEnabled(!walkthroughEnabled)} />
      <WalkthroughOverlay
        isEnabled={walkthroughEnabled}
        onToggle={() => setWalkthroughEnabled(false)}
        currentPage="landing"
        scenario={walkthroughScenario}
        onScenarioChange={setWalkthroughScenario}
      />
    </div>
  )
}

function DemoLandingInner() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session')
  const router = useRouter()
  const hasAccess = useDemoAccess()

  if (hasAccess === null) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
            <p className="text-slate-600">You do not have permission to view demo sessions.</p>
            <Button onClick={() => router.push('/')} className="mt-6">Return Home</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <DemoProvider sessionId={sessionId}>
      <DemoLandingContent />
    </DemoProvider>
  )
}

export default function DemoLanding() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <DemoLandingInner />
    </Suspense>
  )
}
