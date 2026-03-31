'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Save,
  Loader2,
  Sparkles,
  User2,
  Globe,
  Brain,
  StickyNote,
  PhoneCall,
  Calendar,
  Clock,
  DollarSign,
  Briefcase,
  Target,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import EmailComposerDialog from './EmailComposerDialog'
import UpdateStatusDialog from './UpdateStatusDialog'
import AssignAdvisorDialog from './AssignAdvisorDialog'

// ─── Types ────────────────────────────────────────────────────────────────────

type FranchiseInfo = {
  id: string
  name: string
  category: string
  slug: string
  logo_url: string | null
  initial_investment_min: number | null
  initial_investment_max: number | null
  business_model: string | null
  time_commitment: string | null
}

type AdvisorInfo = {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  advisor_image_url: string | null
  advisor_specialties: string[] | null
}

type AIInsights = {
  archetype: string
  motivations: string[]
  decision_style: string
  readiness_level: string
  talking_points: string[]
  concerns: string[]
}

type Tab = 'overview' | 'brands' | 'callprep' | 'notes'

// ─── Label maps ───────────────────────────────────────────────────────────────

const BUDGET_LABELS: Record<string, string> = {
  under_50k: 'Under $50K',
  '50k_100k': '$50K – $100K',
  '100k_250k': '$100K – $250K',
  '250k_500k': '$250K – $500K',
  over_500k: 'Over $500K',
}

const TIME_LABELS: Record<string, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  passive: 'Passive',
}

const EXPERIENCE_LABELS: Record<string, string> = {
  none: 'No Prior Experience',
  some: 'Some Business Background',
  extensive: 'Experienced Operator',
}

const STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  new: { bg: 'bg-blue-100', text: 'text-blue-700' },
  contacted: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  qualified: { bg: 'bg-purple-100', text: 'text-purple-700' },
  nurturing: { bg: 'bg-orange-100', text: 'text-orange-700' },
  converted: { bg: 'bg-green-100', text: 'text-green-700' },
  unqualified: { bg: 'bg-gray-100', text: 'text-gray-700' },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LeadDetailPanel({
  lead,
  quizResult,
  franchisesMap,
  advisor,
  backPath,
  backLabel,
  role,
}: {
  lead: any
  quizResult: any | null
  franchisesMap: Record<string, FranchiseInfo>
  advisor: AdvisorInfo | null
  backPath: string
  backLabel: string
  role: 'admin' | 'advisor'
}) {
  const router = useRouter()
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [notes, setNotes] = useState(lead.notes || '')
  const [savingNotes, setSavingNotes] = useState(false)

  const [emailOpen, setEmailOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [advisorOpen, setAdvisorOpen] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(String(lead.status))
  const [currentAdvisorId, setCurrentAdvisorId] = useState(
    lead.attributed_advisor_id
  )

  // AI Insights
  const [insights, setInsights] = useState<AIInsights | null>(null)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [insightsError, setInsightsError] = useState(false)

  const name =
    lead.first_name && lead.last_name
      ? `${lead.first_name} ${lead.last_name}`
      : lead.email

  // Load AI insights on mount if quiz data exists
  useEffect(() => {
    if (!quizResult) return
    setInsightsLoading(true)
    fetch('/api/advisor/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        budget_range: quizResult.budget_range,
        preferred_categories: quizResult.preferred_categories,
        business_model_preference: quizResult.business_model_preference,
        time_commitment: quizResult.time_commitment,
        experience_level: quizResult.experience_level,
        goals: quizResult.goals,
        ai_profile_summary: quizResult.ai_profile_summary,
        first_name: lead.first_name,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.archetype) {
          setInsights(data)
        } else {
          setInsightsError(true)
        }
      })
      .catch(() => setInsightsError(true))
      .finally(() => setInsightsLoading(false))
  }, [quizResult, lead.first_name])

  async function handleSaveNotes() {
    setSavingNotes(true)
    try {
      const { error } = await supabase
        .from('leads')
        .update({ notes })
        .eq('id', lead.id)
      if (error) throw error
      toast.success('Notes saved')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save notes')
    } finally {
      setSavingNotes(false)
    }
  }

  const matchedIds = (quizResult?.matched_franchises as string[]) || []
  const matchScores =
    (quizResult?.match_scores as Record<string, number>) || {}

  const readiness = getReadiness(quizResult)

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <Globe className="h-4 w-4" /> },
    { key: 'brands', label: 'Brands', icon: <Building2 className="h-4 w-4" /> },
    { key: 'callprep', label: 'Call Prep', icon: <PhoneCall className="h-4 w-4" /> },
    { key: 'notes', label: 'Notes', icon: <StickyNote className="h-4 w-4" /> },
  ]

  return (
    <>
      {/* Header */}
      <div className="bg-brand-navy text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={backPath}
            className="text-brand-gold text-sm hover:text-white flex items-center gap-1 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold">{name}</h1>
                <Badge
                  className={`${STATUS_CONFIG[currentStatus]?.bg || 'bg-gray-100'} ${STATUS_CONFIG[currentStatus]?.text || 'text-gray-700'} border-0 capitalize`}
                >
                  {currentStatus}
                </Badge>
              </div>
              {insights?.archetype && (
                <p className="text-brand-gold text-sm font-medium">
                  {insights.archetype}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-300">
                {lead.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {lead.email}
                  </span>
                )}
                {lead.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {lead.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(lead.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="text-white border-white/30 hover:bg-white/10"
                onClick={() => setEmailOpen(true)}
              >
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
              {lead.phone && (
                <a href={`tel:${lead.phone}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-white border-white/30 hover:bg-white/10"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Call
                  </Button>
                </a>
              )}
              <Button
                size="sm"
                variant="outline"
                className="text-white border-white/30 hover:bg-white/10"
                onClick={() => setStatusOpen(true)}
              >
                Update Status
              </Button>
              {role === 'admin' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-white border-white/30 hover:bg-white/10"
                  onClick={() => setAdvisorOpen(true)}
                >
                  {advisor ? 'Reassign' : 'Assign Advisor'}
                </Button>
              )}
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-xs text-gray-300">Capital</p>
              <p className="text-sm font-semibold">
                {quizResult?.budget_range
                  ? BUDGET_LABELS[quizResult.budget_range] || quizResult.budget_range
                  : lead.budget_range
                    ? BUDGET_LABELS[lead.budget_range] || lead.budget_range
                    : 'Not specified'}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-xs text-gray-300">Availability</p>
              <p className="text-sm font-semibold">
                {quizResult?.time_commitment
                  ? TIME_LABELS[quizResult.time_commitment] || quizResult.time_commitment
                  : 'Not specified'}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-xs text-gray-300">Readiness</p>
              <p className={`text-sm font-bold ${readiness.color}`}>
                {readiness.label}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-xs text-gray-300">Advisor</p>
              <p className="text-sm font-semibold truncate">
                {advisor?.full_name || 'Unassigned'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-brand-navy text-brand-navy'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Key Motivations / AI Insights */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-brand-navy" />
                  Key Motivations
                </h3>

                {insightsLoading ? (
                  <div className="flex items-center gap-2 py-8 justify-center text-gray-400">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Generating AI insights...</span>
                  </div>
                ) : insights?.motivations ? (
                  <ul className="space-y-2.5">
                    {insights.motivations.map((m, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 leading-snug">{m}</span>
                      </li>
                    ))}
                  </ul>
                ) : quizResult?.goals && quizResult.goals.length > 0 ? (
                  <ul className="space-y-2.5">
                    {(quizResult.goals as string[]).map((g: string, i: number) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 leading-snug">{g}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 italic">No quiz data available</p>
                )}

                {quizResult?.ai_profile_summary && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      AI Profile Summary
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-4 border">
                      {quizResult.ai_profile_summary}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Advisor Insights */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-600" />
                  Advisor Insights
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-500">Decision Style</span>
                    <span className="text-sm font-semibold text-gray-800 text-right max-w-[60%]">
                      {insights?.decision_style || 'Collaborative'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Readiness</span>
                    <span className={`text-sm font-bold ${readiness.color}`}>
                      {insights?.readiness_level || readiness.label}
                    </span>
                  </div>

                  {quizResult?.preferred_categories &&
                    (quizResult.preferred_categories as string[]).length > 0 && (
                      <div>
                        <span className="text-sm text-gray-500 block mb-2">
                          Interests
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(quizResult.preferred_categories as string[]).map(
                            (cat: string) => (
                              <Badge
                                key={cat}
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {cat.replace(/_/g, ' ')}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {quizResult?.experience_level && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Experience</span>
                      <span className="text-sm font-medium text-gray-800">
                        {EXPERIENCE_LABELS[quizResult.experience_level] ||
                          quizResult.experience_level}
                      </span>
                    </div>
                  )}

                  {quizResult?.business_model_preference && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Biz Model</span>
                      <span className="text-sm font-medium text-gray-800 capitalize">
                        {quizResult.business_model_preference.replace(/_/g, ' ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Potential Concerns */}
                {insights?.concerns && insights.concerns.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      Potential Concerns
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {insights.concerns.map((c, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                          <span className="text-sm text-gray-600 leading-snug">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── BRANDS ── */}
        {activeTab === 'brands' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                Top Brand Matches ({matchedIds.length})
              </h3>
              <p className="text-xs text-gray-400">Ordered by match score</p>
            </div>

            {matchedIds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchedIds.map((fId, index) => {
                  const franchise = franchisesMap[fId]
                  const rawScore = matchScores[fId]
                  const score =
                    typeof rawScore === 'number'
                      ? `${Math.round(rawScore * 100)}%`
                      : null

                  return (
                    <Card
                      key={fId}
                      className="hover:border-brand-gold transition-colors"
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500 flex-shrink-0">
                          {index + 1}
                        </div>

                        <div className="h-12 w-12 rounded-lg bg-gray-50 border flex items-center justify-center overflow-hidden flex-shrink-0">
                          {franchise?.logo_url ? (
                            <Image
                              src={franchise.logo_url}
                              alt={franchise?.name || ''}
                              width={48}
                              height={48}
                              className="object-contain"
                            />
                          ) : (
                            <Building2 className="h-5 w-5 text-gray-300" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">
                            {franchise?.name ?? `Franchise #${index + 1}`}
                          </p>
                          {franchise?.category && (
                            <p className="text-xs text-gray-500 capitalize">
                              {franchise.category.replace(/_/g, ' ')}
                            </p>
                          )}
                          {franchise &&
                            (franchise.initial_investment_min ||
                              franchise.initial_investment_max) && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                ${franchise.initial_investment_min?.toLocaleString()} –{' '}
                                ${franchise.initial_investment_max?.toLocaleString()}
                              </p>
                            )}
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          {score && (
                            <div className="text-right">
                              <p className="text-xs text-gray-400">Match</p>
                              <p className="text-sm font-bold text-brand-navy">
                                {score}
                              </p>
                            </div>
                          )}
                          {franchise?.slug && (
                            <Link
                              href={`/directory/${franchise.slug}`}
                              target="_blank"
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7"
                              >
                                View
                              </Button>
                            </Link>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  No franchise matches found for this lead.
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Quiz data may not be available.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── CALL PREP ── */}
        {activeTab === 'callprep' && (
          <div>
            <div className="mb-5">
              <h3 className="font-semibold text-gray-900 mb-1">
                Call Preparation Guide
              </h3>
              <p className="text-sm text-gray-500">
                {insights
                  ? 'AI-generated talking points based on candidate profile.'
                  : 'Talking points generated from quiz responses.'}
              </p>
            </div>

            {insightsLoading ? (
              <div className="flex items-center gap-2 py-12 justify-center text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Generating call prep...</span>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {(insights?.talking_points || buildFallbackCallPrep(quizResult, lead)).map(
                    (point, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-4 rounded-lg border bg-white hover:border-brand-gold/50 transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full bg-brand-navy flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {point}
                        </p>
                      </div>
                    )
                  )}
                </div>

                {/* Quick reference */}
                <Card className="bg-brand-cream border-brand-gold/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-brand-navy" />
                      <p className="text-sm font-semibold text-brand-navy">
                        Quick Reference
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
                      <span className="text-gray-500">Capital</span>
                      <span className="font-medium text-gray-800">
                        {quizResult?.budget_range
                          ? BUDGET_LABELS[quizResult.budget_range]
                          : lead.budget_range
                            ? BUDGET_LABELS[lead.budget_range]
                            : 'Not specified'}
                      </span>
                      <span className="text-gray-500">Availability</span>
                      <span className="font-medium text-gray-800">
                        {quizResult?.time_commitment
                          ? TIME_LABELS[quizResult.time_commitment]
                          : 'Not specified'}
                      </span>
                      <span className="text-gray-500">Experience</span>
                      <span className="font-medium text-gray-800">
                        {quizResult?.experience_level
                          ? EXPERIENCE_LABELS[quizResult.experience_level]
                          : 'Not specified'}
                      </span>
                      <span className="text-gray-500">Matches</span>
                      <span className="font-medium text-gray-800">
                        {matchedIds.length} franchises
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* ── NOTES ── */}
        {activeTab === 'notes' && (
          <div>
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-1">
                {role === 'admin' ? 'Admin' : 'Advisor'} Notes
              </h3>
              <p className="text-sm text-gray-500">
                Private notes for {lead.first_name || lead.email}. Call outcomes,
                preferences, objections, next steps.
              </p>
            </div>

            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={`Notes about ${lead.first_name || 'this lead'}...`}
              className="min-h-64 resize-none text-sm font-mono"
            />

            <div className="flex justify-end mt-3">
              <Button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="bg-brand-navy text-brand-gold hover:bg-brand-navy-light"
              >
                {savingNotes ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Notes
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <EmailComposerDialog
        open={emailOpen}
        onOpenChange={setEmailOpen}
        recipientEmail={lead.email}
        recipientName={name}
        leadId={lead.id}
      />
      <UpdateStatusDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        leadId={lead.id}
        leadName={name}
        currentStatus={currentStatus}
        onStatusUpdated={(s) => {
          setCurrentStatus(s)
          router.refresh()
        }}
      />
      <AssignAdvisorDialog
        open={advisorOpen}
        onOpenChange={setAdvisorOpen}
        leadId={lead.id}
        leadName={name}
        currentAdvisorId={currentAdvisorId}
        onAdvisorAssigned={(id, advisorName) => {
          setCurrentAdvisorId(id)
          router.refresh()
        }}
      />
    </>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getReadiness(quizResult: any): { label: string; color: string } {
  if (!quizResult) return { label: 'Unknown', color: 'text-gray-400' }
  const budget = quizResult.budget_range
  const time = quizResult.time_commitment
  if (
    (budget === 'over_500k' || budget === '250k_500k') &&
    time === 'full_time'
  ) {
    return { label: 'High', color: 'text-green-500' }
  }
  if (budget === 'under_50k' || time === 'passive') {
    return { label: 'Low', color: 'text-red-500' }
  }
  return { label: 'Medium', color: 'text-amber-500' }
}

function buildFallbackCallPrep(quizResult: any, lead: any): string[] {
  if (!quizResult) {
    return [
      'No quiz data available. Start the call with discovery questions about their goals, timeline, and budget.',
      'Ask what prompted their interest in franchise ownership right now.',
      'Determine their available capital and financing readiness.',
      'Understand their ideal work-life balance and daily involvement level.',
      'Close with a defined next step: a second call, a franchisor intro, or a specific action item.',
    ]
  }

  const pts: string[] = []

  if (quizResult.budget_range) {
    pts.push(
      `Confirm available capital — quiz indicated ${BUDGET_LABELS[quizResult.budget_range] ?? quizResult.budget_range}. Discuss financing options if they are stretching.`
    )
  }
  if (quizResult.time_commitment) {
    pts.push(
      `Align on involvement level — they indicated "${TIME_LABELS[quizResult.time_commitment] ?? quizResult.time_commitment}". Confirm this fits their lifestyle and family situation.`
    )
  }
  if (
    quizResult.preferred_categories &&
    (quizResult.preferred_categories as string[]).length > 0
  ) {
    const cats = (quizResult.preferred_categories as string[])
      .slice(0, 3)
      .map((s: string) => s.replace(/_/g, ' '))
      .join(', ')
    pts.push(
      `They showed interest in: ${cats}. Have 2-3 specific brands from these sectors ready to discuss.`
    )
  }
  if (quizResult.goals && (quizResult.goals as string[]).length > 0) {
    pts.push(
      `Their stated goals include: "${(quizResult.goals as string[])[0]}". Connect a specific franchise model back to that outcome.`
    )
  }
  pts.push(
    `Ask: "What does your ideal day-to-day look like 12 months from now?" — grounds the conversation in their vision.`
  )
  pts.push(
    `Close every call with a defined next step: a second discovery session, a franchisor intro call, or a specific item to review.`
  )

  return pts
}
