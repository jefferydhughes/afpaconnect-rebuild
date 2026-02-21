'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  FlaskConical, Loader2, ExternalLink, Copy, CheckCircle,
  AlertTriangle, Trash2, Clock, Building2, BookOpen,
  Users, Briefcase, UserRound,
} from 'lucide-react'
import {
  DEMO_PERSONAS, DemoSession,
  createLocalDemoSession, deleteLocalDemoSession, listLocalDemoSessions,
} from '@/components/demo/demoData'
import { useDemoAccess } from '@/components/demo/useDemoAccess'

const PERSONA_PRESETS = [
  { id: 'franchisor', icon: Briefcase, franchise_name: 'Nova Fitness Studios', franchise_category: 'fitness', label: 'Franchisor growth demo' },
  { id: 'advisor', icon: Users, franchise_name: 'Summit Home Services', franchise_category: 'home_services', label: 'Advisor pipeline demo' },
  { id: 'candidate', icon: UserRound, franchise_name: 'Bright Bites Cafe', franchise_category: 'food_beverage', label: 'Candidate journey demo' },
]

export default function DemoBuilder() {
  const router = useRouter()
  const hasAccess = useDemoAccess()
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [existingSessions, setExistingSessions] = useState<DemoSession[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    franchise_name: '',
    franchise_logo_url: '',
    franchise_website_url: '',
    franchise_category: 'food_beverage',
    label: '',
  })

  const applyPreset = (presetId: string) => {
    const preset = PERSONA_PRESETS.find((p) => p.id === presetId)
    if (!preset) return
    setFormData((prev) => ({ ...prev, franchise_name: preset.franchise_name, franchise_category: preset.franchise_category, label: preset.label }))
  }

  const loadSessions = () => {
    setExistingSessions(listLocalDemoSessions().map((s) => ({ ...s, _source: 'local' as const })))
  }

  useEffect(() => {
    loadSessions()
    setIsLoading(false)
  }, [])

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    const session = createLocalDemoSession({
      franchise_name: formData.franchise_name || 'Demo Franchise',
      franchise_logo_url: formData.franchise_logo_url,
      franchise_website_url: formData.franchise_website_url,
      franchise_category: formData.franchise_category,
      label: formData.label,
    })
    loadSessions()
    setIsCreating(false)
    router.push(`/demo/landing?session=${session.session_id}`)
  }

  const handleDelete = (session: DemoSession) => {
    if (!window.confirm('Delete this demo session?')) return
    deleteLocalDemoSession(session.id || session.session_id)
    loadSessions()
  }

  const copyLink = (sessionId: string) => {
    const url = `${window.location.origin}/demo/landing?session=${sessionId}`
    navigator.clipboard.writeText(url)
    setCopiedId(sessionId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const activePersonas = useMemo(() => Object.values(DEMO_PERSONAS), [])

  if (isLoading || hasAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
            <p className="text-slate-600">Only administrators and advisors can access the demo builder.</p>
            <Button onClick={() => router.push('/')} className="mt-6">Return Home</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <FlaskConical className="w-6 h-6 text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Demo Builder</h1>
          </div>
          <p className="text-slate-600">Launch a branded sales demo with simulated franchisor, advisor, and candidate workflows.</p>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/demo/guide">
              <BookOpen className="w-4 h-4 mr-2" />
              View Sales Demo Guide
            </Link>
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Persona Presets</CardTitle>
            <CardDescription>Pre-fill a high-impact storyline based on the buyer persona.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            {PERSONA_PRESETS.map((preset) => {
              const Icon = preset.icon
              const persona = DEMO_PERSONAS[preset.id as keyof typeof DEMO_PERSONAS]
              return (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className="text-left border border-slate-200 rounded-lg p-4 hover:border-slate-400 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2 text-slate-900 font-semibold mb-2">
                    <Icon className="w-4 h-4" />
                    {persona.role}
                  </div>
                  <p className="text-sm text-slate-600">{persona.narrative}</p>
                </button>
              )
            })}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Create New Demo Session</CardTitle>
              <CardDescription>Sessions expire after 24 hours by default.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label htmlFor="franchise_name">Franchise Name *</Label>
                  <Input id="franchise_name" value={formData.franchise_name} onChange={(e) => setFormData({ ...formData, franchise_name: e.target.value })} placeholder="e.g., Acme Burgers" required />
                </div>
                <div>
                  <Label htmlFor="franchise_logo_url">Logo URL (optional)</Label>
                  <Input id="franchise_logo_url" type="url" value={formData.franchise_logo_url} onChange={(e) => setFormData({ ...formData, franchise_logo_url: e.target.value })} placeholder="https://example.com/logo.png" />
                </div>
                <div>
                  <Label htmlFor="franchise_website_url">Website URL (optional)</Label>
                  <Input id="franchise_website_url" type="url" value={formData.franchise_website_url} onChange={(e) => setFormData({ ...formData, franchise_website_url: e.target.value })} placeholder="https://example.com" />
                </div>
                <div>
                  <Label htmlFor="franchise_category">Category</Label>
                  <select id="franchise_category" value={formData.franchise_category} onChange={(e) => setFormData({ ...formData, franchise_category: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="food_beverage">Food &amp; Beverage</option>
                    <option value="fitness">Health &amp; Fitness</option>
                    <option value="services">Business Services</option>
                    <option value="home_services">Home Services</option>
                    <option value="education_tutoring">Education &amp; Tutoring</option>
                    <option value="automotive">Automotive</option>
                    <option value="childrens_services">Children&apos;s Services</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="label">Internal Label (optional)</Label>
                  <Input id="label" value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} placeholder="e.g., Sales call with John - Feb 2026" />
                </div>
                <Button type="submit" disabled={isCreating} className="w-full">
                  {isCreating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating Demo...</> : <><FlaskConical className="w-4 h-4 mr-2" />Create Demo Session</>}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Demo Sessions</CardTitle>
              <CardDescription>{existingSessions.length} active session{existingSessions.length !== 1 ? 's' : ''}</CardDescription>
            </CardHeader>
            <CardContent>
              {existingSessions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No active demo sessions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {existingSessions.map((session) => (
                    <div key={session.session_id} className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {session.franchise_logo_url ? (
                            <img src={session.franchise_logo_url} alt="" className="w-10 h-10 rounded object-contain bg-white border" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-slate-900">{session.franchise_name}</h3>
                            {session.label && <p className="text-xs text-slate-500">{session.label}</p>}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(session)} className="text-slate-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Expires: {new Date(session.expires_at).toLocaleString()}</span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => copyLink(session.session_id)} className="flex-1">
                          {copiedId === session.session_id ? <><CheckCircle className="w-3.5 h-3.5 mr-1 text-green-500" />Copied</> : <><Copy className="w-3.5 h-3.5 mr-1" />Copy Link</>}
                        </Button>
                        <Button size="sm" onClick={() => router.push(`/demo/landing?session=${session.session_id}`)} className="flex-1">
                          <ExternalLink className="w-3.5 h-3.5 mr-1" />Open Demo
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader><CardTitle>Default Demo Personas</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-3 text-sm text-slate-700">
            {activePersonas.map((persona) => (
              <div key={persona.role} className="p-4 rounded-lg border border-slate-200 bg-white">
                <p className="font-semibold text-slate-900">{persona.role}</p>
                <p>{persona.name}</p>
                <p className="text-slate-500">{persona.title}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
