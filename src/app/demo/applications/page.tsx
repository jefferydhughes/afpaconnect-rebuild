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
import { Input } from '@/components/ui/input'
import { Search, Filter, ArrowLeft, User, MapPin, DollarSign, Calendar, Star, Loader2, AlertTriangle, Eye } from 'lucide-react'

function DemoApplicationsContent() {
  const router = useRouter()
  const { session, loading, error, isExpired, demoData } = useDemoContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
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

  const filteredApplications = demoData.applications.filter((app) => {
    const matchesSearch = app.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) || app.location_preference.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = { new: 'bg-blue-100 text-blue-800', in_review: 'bg-amber-100 text-amber-800', qualified: 'bg-green-100 text-green-800' }
    const labels: Record<string, string> = { new: 'New', in_review: 'In Review', qualified: 'Qualified' }
    return <Badge className={styles[status] || 'bg-slate-100 text-slate-800'}>{labels[status] || status}</Badge>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DemoBanner franchiseName={session?.franchise_name} expiresAt={session?.expires_at} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push(`/demo/landing?session=${session?.session_id}`)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />Back to Demo Hub
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
            <p className="text-slate-600">{filteredApplications.length} applications found</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Search by name or location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="in_review">In Review</option>
                  <option value="qualified">Qualified</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <Card key={app.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-slate-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-slate-900">{app.applicant_name}</h3>
                        {getStatusBadge(app.status)}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{app.background}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{app.location_preference}</span>
                        <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{app.investment_range}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(app.submitted_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-bold text-lg">{app.score}</span>
                      </div>
                      <span className="text-xs text-slate-500">Fit Score</span>
                    </div>
                    <Badge variant="outline">{app.disc_profile}</Badge>
                    <Button variant="outline" size="sm" disabled><Eye className="w-4 h-4 mr-1" />View</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredApplications.length === 0 && (
          <Card><CardContent className="p-12 text-center"><p className="text-slate-500">No applications match your filters</p></CardContent></Card>
        )}

        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <strong>Demo Mode:</strong> Application details, contact actions, and status changes are disabled in this demo.
        </div>
      </div>

      <WalkthroughToggleButton isEnabled={walkthroughEnabled} onToggle={() => setWalkthroughEnabled(!walkthroughEnabled)} />
      <WalkthroughOverlay isEnabled={walkthroughEnabled} onToggle={() => setWalkthroughEnabled(false)} currentPage="applications" scenario={walkthroughScenario} onScenarioChange={setWalkthroughScenario} />
    </div>
  )
}

function DemoApplicationsInner() {
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

  return <DemoProvider sessionId={sessionId}><DemoApplicationsContent /></DemoProvider>
}

export default function DemoApplications() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <DemoApplicationsInner />
    </Suspense>
  )
}
