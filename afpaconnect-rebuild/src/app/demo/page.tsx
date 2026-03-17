'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DEMO_DATA, DEMO_PERSONAS } from '@/components/demo/demoData'
import { FlaskConical, PlayCircle, BookOpen, Users, MapPin, BarChart3 } from 'lucide-react'

export default function DemoDashboard() {
  const quickStats = [
    { label: 'Demo Applications', value: DEMO_DATA.applications.length, icon: Users },
    { label: 'Top Markets', value: DEMO_DATA.heatmapData.length, icon: MapPin },
    { label: 'Analytics Leads', value: DEMO_DATA.analytics.totalLeads, icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <FlaskConical className="w-6 h-6 text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Sales Demo Dashboard</h1>
          </div>
          <p className="text-slate-600">Internal launchpad for creating branded customer demos.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {quickStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label}>
                <CardContent className="p-5 flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Icon className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Start a Demo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">
                Create a branded session link for a prospect. Demos include applications, analytics, heatmaps, candidate profiles, and city pages.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/demo/builder">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Open Demo Builder
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/demo/guide">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Open Sales Guide
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Demo Personas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.values(DEMO_PERSONAS).map((persona) => (
                <div key={persona.role} className="p-3 border border-slate-200 rounded-lg bg-white">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-slate-900">{persona.role}</p>
                    <Badge variant="outline">{persona.name}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">{persona.narrative}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
