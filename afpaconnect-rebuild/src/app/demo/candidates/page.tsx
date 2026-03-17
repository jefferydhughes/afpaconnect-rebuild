'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { DemoProvider, useDemoContext } from '@/components/demo/DemoContext'
import DemoBanner from '@/components/demo/DemoBanner'
import WalkthroughOverlay, { WalkthroughToggleButton } from '@/components/demo/WalkthroughOverlay'
import { useDemoAccess } from '@/components/demo/useDemoAccess'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, MapPin, DollarSign, Clock, Briefcase, Loader2, AlertTriangle, Eye } from 'lucide-react'

const DEMO_PROFILE_EMAILS = ['candidate1@demo.com', 'candidate2@demo.com']

function DemoCandidatesContent() {
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

  const candidates = demoData.candidates

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 75) return 'text-blue-600 bg-blue-100'
    if (score >= 60) return 'text-amber-600 bg-amber-100'
    return 'text-slate-600 bg-slate-100'
  }

  const handleViewProfile = (index: number) => {
    if (index < DEMO_PROFILE_EMAILS.length) {
      window.open(`/fit360/results?email=${DEMO_PROFILE_EMAILS[index]}`, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DemoBanner franchiseName={session?.franchise_name} expiresAt={session?.expires_at} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push(`/demo/landing?session=${session?.session_id}`)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />Back to Demo Hub
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Candidate Profiles</h1>
          <p className="text-slate-600">{candidates.length} qualified candidates</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate, index) => (
            <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                      <User className="w-6 h-6 text-slate-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{candidate.name}</h3>
                      <p className="text-sm text-slate-500">Candidate Profile</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${getScoreColor(candidate.compatibility_score)}`}>
                    {candidate.compatibility_score}%
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">{candidate.disc_primary}</Badge>
                    <Badge variant="outline" className="text-xs text-slate-500">{candidate.disc_secondary}</Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600"><DollarSign className="w-4 h-4 text-slate-400" /><span>{candidate.investment_range}</span></div>
                  <div className="flex items-center gap-2 text-slate-600"><MapPin className="w-4 h-4 text-slate-400" /><span>{candidate.geographic_preferences.join(', ')}</span></div>
                  <div className="flex items-center gap-2 text-slate-600"><Clock className="w-4 h-4 text-slate-400" /><span>Timeline: {candidate.timeline}</span></div>
                  <div className="flex items-center gap-2 text-slate-600"><Briefcase className="w-4 h-4 text-slate-400" /><span>{candidate.experience}</span></div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-500 mb-2">Goals</p>
                  <div className="flex flex-wrap gap-1">
                    {candidate.goals.map((goal, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">{goal}</Badge>
                    ))}
                  </div>
                </div>

                {index < 2 ? (
                  <Button variant="outline" className="w-full mt-4" onClick={() => handleViewProfile(index)}>
                    <Eye className="w-4 h-4 mr-2" />View Full Profile
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full mt-4" disabled>View Full Profile</Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <strong>Demo Mode:</strong> Contact information, export features, and CRM sync are disabled. No real candidate data is shown.
        </div>
      </div>

      <WalkthroughToggleButton isEnabled={walkthroughEnabled} onToggle={() => setWalkthroughEnabled(!walkthroughEnabled)} />
      <WalkthroughOverlay isEnabled={walkthroughEnabled} onToggle={() => setWalkthroughEnabled(false)} currentPage="candidates" scenario={walkthroughScenario} onScenarioChange={setWalkthroughScenario} />
    </div>
  )
}

function DemoCandidatesInner() {
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

  return <DemoProvider sessionId={sessionId}><DemoCandidatesContent /></DemoProvider>
}

export default function DemoCandidates() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <DemoCandidatesInner />
    </Suspense>
  )
}
