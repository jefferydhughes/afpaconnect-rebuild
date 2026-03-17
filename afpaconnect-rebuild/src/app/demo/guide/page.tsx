'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft, CheckCircle, PlayCircle, MousePointer, MessageSquare, Clock, Target,
  Lightbulb, AlertTriangle, FileText, MapPin, BarChart3, Users, Building2,
  LogIn, Plus, Presentation, Copy, ExternalLink,
} from 'lucide-react'

export default function DemoGuide() {
  const router = useRouter()

  const sections = [
    {
      id: 'prep',
      title: 'Pre-Call Preparation',
      icon: Target,
      color: 'bg-purple-500',
      duration: '5 min before call',
      steps: [
        { action: 'Login to AFPA', detail: 'Navigate to the AFPA platform and login with your credentials. You must have "admin" or "advisor" role.', button: 'Login button in top-right corner' },
        { action: 'Access Demo Builder', detail: 'Go to /demo/builder or navigate via the internal demo dashboard.', button: 'Demo Builder link' },
        { action: 'Create Demo Session', detail: "Enter the prospect's franchise name, logo URL (if available), and their website. Add an internal label like \"Call with [Name] - [Date]\"", button: 'Click "Create Demo Session"' },
        { action: 'Copy Demo Link', detail: 'Copy the generated demo link. You can share this with the prospect or use it yourself during screen share.', button: 'Click "Copy Link" on the session card' },
      ],
    },
    {
      id: 'intro',
      title: 'Opening the Demo',
      icon: PlayCircle,
      color: 'bg-blue-500',
      duration: '2-3 min',
      steps: [
        { action: 'Open Demo Landing Page', detail: "Click \"Open Demo\" or paste the demo link. You'll see the Demo Hub with the prospect's brand name displayed.", button: 'Open Demo button' },
        { action: 'Point Out the Demo Banner', detail: 'Acknowledge the yellow "Sandbox Demo Mode" banner at the top. Explain this is a safe environment with simulated data.', tip: 'Say: "Everything you see here is simulated data, but it represents exactly what your dashboard would look like."' },
        { action: 'Start Walkthrough Mode (Optional)', detail: 'Click the "Start Walkthrough" button in the bottom-left to enable guided tooltips during the call.', button: 'Start Walkthrough button (bottom-left)' },
      ],
    },
    {
      id: 'modules',
      title: 'Demo Module Sequence',
      icon: MousePointer,
      color: 'bg-green-500',
      duration: '15-25 min',
      steps: [
        { action: 'Applications Viewer', detail: 'Show incoming franchise applications with AI fit scores, DISC profiles, and location data.', button: 'Applications Viewer card' },
        { action: 'Analytics Dashboard', detail: 'Display lead funnel, conversion rates, and monthly trends. Emphasize data-driven decision making.', button: 'Analytics Dashboard card' },
        { action: 'Interest Heatmap', detail: 'Show geographic demand. Point to their target markets specifically.', button: 'Interest Heatmap card' },
        { action: 'Candidate Profiles', detail: 'Walk through individual candidate cards. For top 2, click "View Full Profile" to show the FranchiseFit360 assessment results.', button: 'Candidate Profiles card → View Full Profile' },
        { action: 'Brand City Pages', detail: "Preview AI-generated local SEO pages. Click a city to show the live page preview.", button: 'Brand City Pages card' },
      ],
    },
    {
      id: 'objections',
      title: 'Handling Common Objections',
      icon: MessageSquare,
      color: 'bg-amber-500',
      duration: 'As needed',
      steps: [
        { action: '"Is this real data?"', detail: 'The amber banner always confirms this is demo/simulated data. The platform works identically with real leads and real franchise data.', tip: 'Say: "This is simulated — in your real account, these would be your actual applications and leads."' },
        { action: '"We already have a CRM"', detail: 'Position AFPA as franchise-specific intelligence that plugs gaps in generic CRMs — fit scoring, DISC analysis, geographic heatmaps, and branded SEO pages.', tip: 'Say: "We are not replacing your CRM — we are the franchise intelligence layer on top of it."' },
        { action: '"How long does onboarding take?"', detail: 'Basic setup is under an hour. Full data import and branding takes 1-2 days with our team support.', button: '' },
      ],
    },
    {
      id: 'close',
      title: 'Closing the Demo',
      icon: CheckCircle,
      color: 'bg-teal-500',
      duration: '5 min',
      steps: [
        { action: 'Summarize Key Value Points', detail: 'Recap the 3 features that resonated most based on their reactions during the call.', tip: '' },
        { action: 'Share the Demo Link', detail: 'Offer to send the demo session link so they can explore on their own or share with their team.', button: 'Copy Link on the session card' },
        { action: 'Schedule Next Steps', detail: 'Propose a technical onboarding call or trial access setup as the next step.', button: '' },
      ],
    },
  ]

  const quickModules = [
    { icon: FileText, label: 'Applications', href: '/demo/applications', color: 'bg-blue-500' },
    { icon: BarChart3, label: 'Analytics', href: '/demo/analytics', color: 'bg-violet-500' },
    { icon: MapPin, label: 'Heatmap', href: '/demo/heatmap', color: 'bg-green-500' },
    { icon: Users, label: 'Candidates', href: '/demo/candidates', color: 'bg-amber-500' },
    { icon: Building2, label: 'City Pages', href: '/demo/city-builder', color: 'bg-teal-500' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.push('/demo/builder')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />Back to Demo Builder
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg"><Presentation className="w-6 h-6 text-blue-600" /></div>
            <h1 className="text-3xl font-bold text-slate-900">Sales Demo Guide</h1>
          </div>
          <p className="text-slate-600">Step-by-step playbook for running a successful AFPA platform demo.</p>
        </div>

        {/* Quick launch modules */}
        <Card className="mb-8">
          <CardHeader><CardTitle>Quick Launch — Jump to Any Module</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {quickModules.map((m) => {
                const Icon = m.icon
                return (
                  <Link key={m.label} href={m.href} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium ${m.color} hover:opacity-90 transition-opacity`}>
                    <Icon className="w-4 h-4" />{m.label}
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <Card key={section.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${section.color} text-white`}><Icon className="w-5 h-5" /></div>
                    <div>
                      <CardTitle>{section.title}</CardTitle>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5"><Clock className="w-3.5 h-3.5" />{section.duration}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {section.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{idx + 1}</div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 mb-1">{step.action}</p>
                          <p className="text-sm text-slate-600 mb-2">{step.detail}</p>
                          {step.button && (
                            <Badge variant="outline" className="text-xs">
                              <MousePointer className="w-3 h-3 mr-1" />{step.button}
                            </Badge>
                          )}
                          {step.tip && (
                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 flex gap-2">
                              <Lightbulb className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                              <span>{step.tip}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="mt-8 border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 mb-1">Remember</p>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Never show this guide to prospects — it is for internal use only.</li>
                  <li>• Always acknowledge the Demo Banner at the start of the session.</li>
                  <li>• Demo sessions expire after 24 hours — create a new one for each call.</li>
                  <li>• If anything breaks, fall back to the live platform with your own account data.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
