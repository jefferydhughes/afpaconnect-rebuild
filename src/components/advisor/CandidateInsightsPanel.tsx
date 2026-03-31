'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Building2,
  Mail,
  Phone,
  Save,
  Loader2,
  Sparkles,
  User2,
  Brain,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

// ─── Types ────────────────────────────────────────────────────────────────────

type Candidate = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  phone: string | null
  budget_range: string | null
  time_commitment: string | null
  experience_level: string | null
  preferred_categories: string[] | null
  business_model_preference: string | null
  goals: string[] | null
  ai_profile_summary: string | null
  matched_franchises: string[] | null
  match_scores: Record<string, number> | null
  created_at: string
  // enriched by page.tsx
  lead_id: string | null
  lead_status: string
  lead_notes: string
}

type FranchiseInfo = {
  id: string
  name: string
  category: string
  slug: string
  logo_url: string | null
  initial_investment_min: number | null
  initial_investment_max: number | null
}

type Tab = 'overview' | 'brands' | 'call_prep' | 'notes'

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

// ─── Derived-insight helpers ──────────────────────────────────────────────────

function getDecisionStyle(c: Candidate): string {
  if (c.time_commitment === 'passive') {
    return 'Passive investor mindset — drawn to systems-driven, low-involvement models'
  }
  if (c.experience_level === 'extensive') {
    return 'Analytical and methodical; prefers to assess options thoroughly before committing'
  }
  if (c.experience_level === 'some') {
    return 'Receptive to guidance; will compare a few options before deciding'
  }
  return 'First-time buyer — benefits from education and step-by-step process guidance'
}

function getReadiness(c: Candidate): { label: string; color: string } {
  const budget = c.budget_range
  const time = c.time_commitment
  if ((budget === 'over_500k' || budget === '250k_500k') && time === 'full_time') {
    return { label: 'High', color: 'text-green-600' }
  }
  if (budget === 'under_50k' || time === 'passive') {
    return { label: 'Low', color: 'text-red-500' }
  }
  return { label: 'Medium', color: 'text-amber-500' }
}

function buildCallPrepPoints(c: Candidate): string[] {
  const pts: string[] = []

  if (c.budget_range) {
    pts.push(
      `Confirm available capital — quiz indicated ${BUDGET_LABELS[c.budget_range] ?? c.budget_range}. ` +
        `Discuss financing options if they are stretching.`
    )
  }

  if (c.time_commitment) {
    pts.push(
      `Align on involvement level — they indicated "${TIME_LABELS[c.time_commitment] ?? c.time_commitment}". ` +
        `Confirm this genuinely fits their lifestyle and family situation.`
    )
  }

  if (c.preferred_categories && c.preferred_categories.length > 0) {
    const cats = c.preferred_categories
      .slice(0, 3)
      .map((s) => s.replace(/_/g, ' '))
      .join(', ')
    pts.push(
      `They showed interest in: ${cats}. Have 2–3 specific brands from these sectors ready to discuss.`
    )
  }

  if (c.experience_level === 'none') {
    pts.push(
      `Walk them through the full franchise process from scratch: discovery → validation → FDD review → signing. Set clear timelines.`
    )
  } else if (c.experience_level === 'some') {
    pts.push(
      `Ask about their prior business background. Use it to anchor how this franchise model differs or improves on their experience.`
    )
  } else {
    pts.push(
      `Leverage their experience — open with "What did you want to be different from your last business?" to quickly surface their real criteria.`
    )
  }

  if (c.goals && c.goals.length > 0) {
    pts.push(
      `Their stated goals include: "${c.goals[0]}". Open the call by connecting a specific franchise model back to that outcome.`
    )
  }

  if (c.matched_franchises && c.matched_franchises.length >= 3) {
    pts.push(
      `Their quiz generated ${c.matched_franchises.length} matches. Walk through the top 3 and ask for first reactions — this reveals their real priorities.`
    )
  }

  pts.push(
    `Ask: "What does your ideal day-to-day look like 12 months from now?" — grounds the conversation in their vision, not just numbers.`
  )
  pts.push(
    `Close every call with a defined next step: a second discovery session, a franchisor intro call, or a specific item to review. Never leave open-ended.`
  )

  return pts
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CandidateInsightsPanel({
  advisorId,
  candidates,
  franchisesMap,
}: {
  advisorId: string
  candidates: Candidate[]
  franchisesMap: Record<string, FranchiseInfo>
}) {
  const supabase = createClient()
  const [selectedId, setSelectedId] = useState<string | null>(
    candidates[0]?.id ?? null
  )
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  // Per-candidate notes keyed by quiz result id
  const [notes, setNotes] = useState<Record<string, string>>(
    () => Object.fromEntries(candidates.map((c) => [c.id, c.lead_notes]))
  )
  const [savingNotes, setSavingNotes] = useState(false)

  // AI insights state
  type AIInsights = {
    archetype: string
    motivations: string[]
    decision_style: string
    readiness_level: string
    talking_points: string[]
    concerns: string[]
  }
  const [aiInsights, setAiInsights] = useState<Record<string, AIInsights>>({})
  const [aiLoading, setAiLoading] = useState(false)

  const selected = candidates.find((c) => c.id === selectedId) ?? null

  // Fetch AI insights when candidate changes
  useEffect(() => {
    if (!selected || aiInsights[selected.id]) return
    setAiLoading(true)
    fetch('/api/advisor/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        budget_range: selected.budget_range,
        preferred_categories: selected.preferred_categories,
        business_model_preference: selected.business_model_preference,
        time_commitment: selected.time_commitment,
        experience_level: selected.experience_level,
        goals: selected.goals,
        ai_profile_summary: selected.ai_profile_summary,
        first_name: selected.first_name,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.archetype) {
          setAiInsights((prev) => ({ ...prev, [selected.id]: data }))
        }
      })
      .catch(() => {})
      .finally(() => setAiLoading(false))
  }, [selected?.id])

  const currentInsights = selected ? aiInsights[selected.id] : null

  function selectCandidate(id: string) {
    setSelectedId(id)
    setActiveTab('overview')
  }

  async function handleSaveNotes() {
    if (!selected) return
    setSavingNotes(true)
    try {
      const noteText = notes[selected.id] ?? ''
      if (selected.lead_id) {
        const { error } = await supabase
          .from('leads')
          .update({ notes: noteText })
          .eq('id', selected.lead_id)
        if (error) throw error
      } else {
        // Create a minimal lead record so we can store notes
        const { error } = await supabase.from('leads').insert({
          email: selected.email,
          first_name: selected.first_name,
          last_name: selected.last_name,
          phone: selected.phone,
          source: 'quiz' as const,
          budget_range: selected.budget_range,
          notes: noteText,
          attributed_advisor_id: advisorId,
          quiz_result_id: selected.id,
          status: 'new' as const,
        })
        if (error) throw error
      }
      toast.success('Notes saved')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save notes')
    } finally {
      setSavingNotes(false)
    }
  }

  // ── Empty state ──
  if (candidates.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border shadow-sm">
        <User2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No candidates yet</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          When prospects take your quiz through your affiliate link, their profiles will appear here.
        </p>
        <Link href="/dashboard/advisor">
          <Button variant="outline">← Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  // ── Two-panel layout ──
  return (
    <div
      className="flex rounded-xl border bg-white overflow-hidden shadow-sm"
      style={{ minHeight: 680 }}
    >
      {/* ── LEFT: Candidate list ── */}
      <div className="w-72 border-r flex-shrink-0 flex flex-col">
        <div className="p-4 border-b bg-gray-50 flex-shrink-0">
          <Link
            href="/dashboard/advisor"
            className="text-xs text-gray-400 hover:text-gray-600 mb-3 flex items-center gap-1"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <User2 className="h-4 w-4 text-brand-navy" />
            <h2 className="font-semibold text-brand-navy text-sm">My Candidates</h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {candidates.length} attributed lead{candidates.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="overflow-y-auto flex-1 divide-y">
          {candidates.map((c) => (
            <button
              key={c.id}
              onClick={() => selectCandidate(c.id)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                selectedId === c.id
                  ? 'bg-blue-50 border-l-[3px] border-l-brand-navy'
                  : 'border-l-[3px] border-l-transparent'
              }`}
            >
              <p className="font-medium text-gray-900 text-sm leading-snug">
                {c.first_name && c.last_name
                  ? `${c.first_name} ${c.last_name}`
                  : c.email}
              </p>
              <p className="text-xs text-gray-400 truncate">{c.email}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-gray-400">
                  {new Date(c.created_at).toLocaleDateString('en-US', {
                    month: 'numeric',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                {c.budget_range && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                    {BUDGET_LABELS[c.budget_range] ?? c.budget_range.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Detail panel ── */}
      {selected ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Candidate header */}
          <div className="px-6 py-5 border-b flex-shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                  {selected.first_name && selected.last_name
                    ? `${selected.first_name} ${selected.last_name}`
                    : selected.email}
                </h2>
                <p className="text-gray-500 text-sm mt-0.5">
                  {currentInsights?.archetype
                    ? currentInsights.archetype
                    : selected.experience_level
                      ? EXPERIENCE_LABELS[selected.experience_level]
                      : 'Quiz Candidate'}
                </p>
              </div>
              <div className="text-right text-sm text-gray-500 space-y-0.5 flex-shrink-0">
                {selected.budget_range && (
                  <p>
                    Capital{' '}
                    <span className="font-semibold text-gray-800">
                      {BUDGET_LABELS[selected.budget_range]}
                    </span>
                  </p>
                )}
                {selected.time_commitment && (
                  <p>
                    Time{' '}
                    <span className="font-semibold text-gray-800 lowercase">
                      {TIME_LABELS[selected.time_commitment]}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-3">
              {selected.email && (
                <a
                  href={`mailto:${selected.email}`}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-navy"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {selected.email}
                </a>
              )}
              {selected.phone && (
                <a
                  href={`tel:${selected.phone}`}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-navy"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {selected.phone}
                </a>
              )}
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex border-b px-6 flex-shrink-0">
            {(['overview', 'brands', 'call_prep', 'notes'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab
                    ? 'border-brand-navy text-brand-navy'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'call_prep'
                  ? 'Call Prep'
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-6">

            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Key Motivations */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-brand-navy" />
                    Key Motivations
                  </h3>
                  {aiLoading ? (
                    <div className="flex items-center gap-2 py-6 justify-center text-gray-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Generating insights...</span>
                    </div>
                  ) : currentInsights?.motivations ? (
                    <ul className="space-y-2.5">
                      {currentInsights.motivations.map((m, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 leading-snug">{m}</span>
                        </li>
                      ))}
                    </ul>
                  ) : selected.goals && selected.goals.length > 0 ? (
                    <ul className="space-y-2.5">
                      {selected.goals.map((goal, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 leading-snug">{goal}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No goals recorded from quiz</p>
                  )}

                  {selected.ai_profile_summary && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-900 mb-2">AI Profile Summary</h3>
                      <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-4 border">
                        {selected.ai_profile_summary}
                      </p>
                    </div>
                  )}
                </div>

                {/* Advisor Insights */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-600" />
                    Advisor Insights
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 border space-y-4">
                    <div className="grid grid-cols-5 gap-2 items-start">
                      <span className="col-span-2 text-sm text-gray-500">Decision Style</span>
                      <span className="col-span-3 text-sm font-semibold text-gray-800 leading-snug">
                        {currentInsights?.decision_style || getDecisionStyle(selected)}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-2 items-center">
                      <span className="col-span-2 text-sm text-gray-500">Readiness</span>
                      <span
                        className={`col-span-3 text-sm font-bold ${getReadiness(selected).color}`}
                      >
                        {currentInsights?.readiness_level || getReadiness(selected).label}
                      </span>
                    </div>

                    {selected.preferred_categories && selected.preferred_categories.length > 0 && (
                      <div className="grid grid-cols-5 gap-2 items-start">
                        <span className="col-span-2 text-sm text-gray-500">Interests</span>
                        <div className="col-span-3 flex flex-wrap gap-1">
                          {selected.preferred_categories.map((cat) => (
                            <Badge
                              key={cat}
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {cat.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selected.business_model_preference && (
                      <div className="grid grid-cols-5 gap-2 items-center">
                        <span className="col-span-2 text-sm text-gray-500">Biz Model</span>
                        <span className="col-span-3 text-sm font-medium text-gray-800 capitalize">
                          {selected.business_model_preference.replace(/_/g, ' ')}
                        </span>
                      </div>
                    )}

                    {selected.experience_level && (
                      <div className="grid grid-cols-5 gap-2 items-center">
                        <span className="col-span-2 text-sm text-gray-500">Experience</span>
                        <span className="col-span-3 text-sm font-medium text-gray-800">
                          {EXPERIENCE_LABELS[selected.experience_level]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Potential Concerns */}
                  {currentInsights?.concerns && currentInsights.concerns.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        Potential Concerns
                      </h4>
                      <div className="space-y-2">
                        {currentInsights.concerns.map((c, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="mt-1.5 w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                            <span className="text-sm text-gray-600 leading-snug">{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── BRANDS ── */}
            {activeTab === 'brands' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    Matched Brands ({selected.matched_franchises?.length ?? 0})
                  </h3>
                  <p className="text-xs text-gray-400">Ordered by match score</p>
                </div>

                {selected.matched_franchises && selected.matched_franchises.length > 0 ? (
                  <div className="space-y-3">
                    {selected.matched_franchises.map((fId, index) => {
                      const franchise = franchisesMap[fId]
                      const rawScore = selected.match_scores?.[fId]
                      const score =
                        typeof rawScore === 'number'
                          ? `${Math.round(rawScore * 100)}%`
                          : null

                      return (
                        <div
                          key={fId}
                          className="flex items-center gap-4 p-4 border rounded-lg hover:border-brand-gold transition-colors"
                        >
                          <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500 flex-shrink-0">
                            {index + 1}
                          </div>

                          <div className="h-12 w-12 rounded-lg bg-gray-50 border flex items-center justify-center overflow-hidden flex-shrink-0">
                            {franchise?.logo_url ? (
                              <Image
                                src={franchise.logo_url}
                                alt={franchise.name}
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
                                <p className="text-sm font-bold text-brand-navy">{score}</p>
                              </div>
                            )}
                            {franchise?.slug && (
                              <Link href={`/directory/${franchise.slug}`} target="_blank">
                                <Button size="sm" variant="outline" className="text-xs h-7">
                                  View
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No franchise matches found for this candidate.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── CALL PREP ── */}
            {activeTab === 'call_prep' && (
              <div>
                <div className="mb-5">
                  <h3 className="font-semibold text-gray-900 mb-1">Call Preparation Guide</h3>
                  <p className="text-sm text-gray-500">
                    Talking points generated from{' '}
                    {selected.first_name ? `${selected.first_name}'s` : "this candidate's"} quiz
                    responses.
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {(currentInsights?.talking_points || buildCallPrepPoints(selected)).map((point, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-4 rounded-lg border bg-white hover:border-brand-gold/50 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-brand-navy flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>

                {/* Quick reference card */}
                <div className="p-4 bg-brand-cream rounded-lg border border-brand-gold/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-brand-navy" />
                    <p className="text-sm font-semibold text-brand-navy">Quick Reference</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
                    <span className="text-gray-500">Capital</span>
                    <span className="font-medium text-gray-800">
                      {selected.budget_range
                        ? BUDGET_LABELS[selected.budget_range]
                        : 'Not specified'}
                    </span>
                    <span className="text-gray-500">Availability</span>
                    <span className="font-medium text-gray-800">
                      {selected.time_commitment
                        ? TIME_LABELS[selected.time_commitment]
                        : 'Not specified'}
                    </span>
                    <span className="text-gray-500">Experience</span>
                    <span className="font-medium text-gray-800">
                      {selected.experience_level
                        ? EXPERIENCE_LABELS[selected.experience_level]
                        : 'Not specified'}
                    </span>
                    <span className="text-gray-500">Total Matches</span>
                    <span className="font-medium text-gray-800">
                      {selected.matched_franchises?.length ?? 0} franchises
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── NOTES ── */}
            {activeTab === 'notes' && (
              <div>
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-1">Advisor Notes</h3>
                  <p className="text-sm text-gray-500">
                    Private notes for {selected.first_name ?? selected.email}.
                    {!selected.lead_id &&
                      ' Saving will create a lead record for this candidate.'}
                  </p>
                </div>

                <Textarea
                  value={notes[selected.id] ?? ''}
                  onChange={(e) =>
                    setNotes((prev) => ({ ...prev, [selected.id]: e.target.value }))
                  }
                  placeholder={`Notes about ${selected.first_name ?? 'this candidate'}… call outcomes, preferences, objections, next steps`}
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
                        Saving…
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
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          Select a candidate to view their insights
        </div>
      )}
    </div>
  )
}
