import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

type QuizPayload = {
  budget?: string
  categories?: string[]
  business_model?: string
  time_commitment?: string
  experience?: string
  territory?: string[]
  goals?: string[]
  contact?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
  }
  attributed_advisor_id?: string
  source?: string
}

type QuizMatch = {
  id: string
  similarity_score: number
  match_reasons: string[]
  [key: string]: any
}

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) return null
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as QuizPayload
    const supabase = createAdminClient()

    const {
      budget,
      categories = [],
      business_model,
      time_commitment,
      experience,
      territory = [],
      goals = [],
      contact,
      attributed_advisor_id,
      source = 'website',
    } = body

    const adminNotificationEmail =
      process.env.AFPA_DEFAULT_ADMIN_EMAIL ||
      process.env.ADMIN_EMAIL ||
      'advisors@afpaconnect.com'
    const normalizedIncomingAdvisorId = normalizeAdvisorId(attributed_advisor_id)
    const effectiveAttributedAdvisorId = await resolveAttributedAdvisorId(
      supabase,
      normalizedIncomingAdvisorId,
      adminNotificationEmail
    )

    if (!contact?.email) {
      return NextResponse.json({ error: 'Contact email is required' }, { status: 400 })
    }

    const userProfile = buildUserProfile({
      budget,
      categories,
      business_model,
      time_commitment,
      experience,
      territory,
      goals,
    })
    const generatedQuizId = createQuizTrackingId()

    const quizInsertPayload: Record<string, any> = {
      quiz_id: generatedQuizId,
      email: contact.email,
      first_name: contact.firstName || null,
      last_name: contact.lastName || null,
      phone: contact.phone || null,
      budget_range: budget || null,
      preferred_categories: categories,
      business_model_preference: business_model || null,
      time_commitment: time_commitment || null,
      experience_level: experience || null,
      preferred_territories: territory,
      goals,
      lifestyle_preferences: [],
      disc_profile_primary: null,
      disc_profile_secondary: null,
      disc_profile_scores: {},
      attributed_consultant_id: effectiveAttributedAdvisorId,
      source,
      quiz_completed_date: new Date().toISOString(),
    }

    const {
      data: quizResult,
      error: quizError,
      removedColumns: removedQuizColumns,
    } = await insertSingleWithSchemaFallback(supabase, 'quiz_result', quizInsertPayload)

    if (removedQuizColumns.length > 0) {
      console.warn('quiz_result insert ignored missing schema-cache columns:', removedQuizColumns)
    }

    if (quizError) {
      console.error('Quiz insert error:', quizError)
      throw new Error(`Failed to save quiz result: ${quizError.message}`)
    }

    let matches: QuizMatch[] = []
    try {
      matches = await getAIMatches(supabase, {
        budget,
        categories,
        business_model,
        time_commitment,
        experience,
        territory,
        goals,
      }, userProfile)
    } catch (matchError) {
      console.error('Matching error:', matchError)
    }

    if (matches.length > 0) {
      const matchedFranchises = matches.map((m) => m.id)
      const matchScores = matches.reduce((acc, m) => {
        acc[m.id] = {
          score: m.similarity_score,
          tier:
            m.similarity_score >= 70
              ? 'best_fit'
              : m.similarity_score >= 50
                ? 'good_fit'
                : 'consider_carefully',
          reasons: m.match_reasons || [],
        }
        return acc
      }, {} as Record<string, any>)

      const { error: matchUpdateError } = await supabase
        .from('quiz_result')
        .update({
          matched_franchises: matchedFranchises,
          match_scores: matchScores,
          match_score: matches.length > 0
            ? Math.round(matches.reduce((sum, m) => sum + (m.similarity_score || 0), 0) / matches.length)
            : null,
        })
        .eq('id', quizResult.id)

      if (matchUpdateError) {
        console.error('Quiz match update error (non-blocking):', matchUpdateError)
      }
    }

    const leadInsertPayload: Record<string, any> = {
      email: contact.email,
      first_name: contact.firstName || null,
      last_name: contact.lastName || null,
      phone: contact.phone || null,
      source: 'quiz',
      quiz_result_id: quizResult.id,
      interested_franchises: matches.slice(0, 5).map((m) => m.id),
      budget_range: budget || null,
      attributed_advisor_id: effectiveAttributedAdvisorId,
    }

    const { error: leadError, removedColumns: removedLeadColumns } = await insertWithSchemaFallback(
      supabase,
      'leads',
      leadInsertPayload
    )

    if (removedLeadColumns.length > 0) {
      console.warn('leads insert ignored missing schema-cache columns:', removedLeadColumns)
    }

    if (leadError) {
      if ((leadError.message || '').includes('No compatible columns left for insert into leads')) {
        console.warn('Skipping lead insert: connected database leads schema is incompatible with this app.')
      } else {
        console.error('Lead insert error (non-blocking):', leadError)
      }
    }

    const webhookPayload = {
      quiz_id: (quizResult as any).quiz_id || generatedQuizId,
      source: source || 'afpaconnect',
      email: contact.email,
      first_name: contact.firstName || null,
      last_name: contact.lastName || null,
      phone: contact.phone || null,
      budget_range: budget || null,
      preferred_categories: categories,
      business_model_preference: business_model || null,
      time_commitment: time_commitment || null,
      experience_level: experience || null,
      preferred_territories: territory,
      goals,
      lifestyle_preferences: [],
      disc_profile_primary: null,
      disc_profile_secondary: null,
      disc_profile_scores: {},
      matched_franchises: matches.map((m) => m.id),
      match_scores: matches.reduce((acc, m) => {
        acc[m.id] = { score: m.similarity_score, reasons: m.match_reasons || [] }
        return acc
      }, {} as Record<string, any>),
      match_score: null,
      quiz_completed_date: quizResult.quiz_completed_date,
      attributed_consultant_id:
        effectiveAttributedAdvisorId
          ? effectiveAttributedAdvisorId
          : null,
    }

    sendQuizResultWebhook(webhookPayload).catch((error) => {
      console.error('Quiz webhook failed (non-blocking):', error)
    })

    if (!normalizedIncomingAdvisorId) {
      sendUnattributedQuizNotification({
        recipient_email: adminNotificationEmail,
        quiz_result_id: quizResult.id,
        source,
        submitted_email: contact.email,
        submitted_name: [contact.firstName, contact.lastName].filter(Boolean).join(' ').trim() || null,
        budget_range: budget || null,
      }).catch((error) => {
        console.error('Unattributed quiz notification failed (non-blocking):', error)
      })
    }

    return NextResponse.json({
      success: true,
      quizResultId: quizResult.id,
      matchCount: matches.length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : undefined
    console.error('Quiz submission error:', { message, stack })
    return NextResponse.json(
      {
        error: 'Failed to submit quiz',
        ...(process.env.NODE_ENV !== 'production' ? { details: message } : {}),
      },
      { status: 500 }
    )
  }
}

function createQuizTrackingId(): string {
  const random = Math.random().toString(36).slice(2, 8)
  return `quiz_${Date.now()}_${random}`
}

function buildUserProfile(answers: Omit<QuizPayload, 'contact' | 'attributed_advisor_id' | 'source'>): string {
  const parts: string[] = []

  if (answers.budget) {
    const budgetLabels: Record<string, string> = {
      under_50k: 'under $50,000',
      '50k_100k': '$50,000 to $100,000',
      '100k_250k': '$100,000 to $250,000',
      '250k_500k': '$250,000 to $500,000',
      over_500k: 'over $500,000',
    }
    parts.push(`Budget: ${budgetLabels[answers.budget] || answers.budget}`)
  }

  if (answers.categories && answers.categories.length > 0) {
    parts.push(`Industries: ${answers.categories.join(', ')}`)
  }

  if (answers.business_model) {
    parts.push(`Business model: ${answers.business_model}`)
  }

  if (answers.time_commitment) {
    parts.push(`Time commitment: ${answers.time_commitment}`)
  }

  if (answers.experience) {
    parts.push(`Experience level: ${answers.experience}`)
  }

  if (answers.territory && answers.territory.length > 0) {
    parts.push(`Preferred territories: ${answers.territory.join(', ')}`)
  }

  if (answers.goals && answers.goals.length > 0) {
    parts.push(`Goals: ${answers.goals.join(', ')}`)
  }

  return parts.join('. ')
}

async function getAIMatches(
  supabase: any,
  answers: Omit<QuizPayload, 'contact' | 'attributed_advisor_id' | 'source'>,
  userProfile: string
): Promise<QuizMatch[]> {
  const openai = getOpenAIClient()

  if (openai) {
    try {
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: userProfile,
      })

      const userEmbedding = embeddingResponse.data[0]?.embedding
      if (userEmbedding) {
        const { data: vectorMatches, error } = await supabase.rpc('match_franchises', {
          query_embedding: userEmbedding,
          match_threshold: 0.3,
          match_count: 20,
        })
        if (error) throw error

        if (vectorMatches && vectorMatches.length > 0) {
          return await addGPTReasoning(openai, vectorMatches.slice(0, 12), userProfile)
        }
      }
    } catch (error) {
      console.error('Embedding/GPT match failed, falling back:', error)
    }
  }

  return fallbackKeywordMatch(supabase, answers)
}

async function addGPTReasoning(openai: OpenAI, matches: any[], userProfile: string): Promise<QuizMatch[]> {
  try {
    const prompt = `You are a franchise advisor.
User profile:
"${userProfile}"

Franchise options:
${matches.map((m, i) => `${i + 1}. ${m.name}: ${m.description || 'No description'}`).join('\n')}

Return strict JSON object: {"recommendations":[{"name":"...","reason":"..."}]}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    })

    const parsed = JSON.parse(response.choices[0]?.message?.content || '{}')
    const reasons = Array.isArray(parsed?.recommendations) ? parsed.recommendations : []

    return matches.map((match, index) => ({
      ...match,
      id: match.id,
      similarity_score: Math.max(1, Math.min(99, Math.round((match.similarity || 0.5) * 100))),
      match_reasons: [reasons[index]?.reason || 'Matches your profile criteria'].filter(Boolean),
    }))
  } catch (error) {
    console.error('GPT reasoning failed:', error)
    return matches.map((match) => ({
      ...match,
      id: match.id,
      similarity_score: Math.max(1, Math.min(99, Math.round((match.similarity || 0.5) * 100))),
      match_reasons: ['Matches your profile criteria'],
    }))
  }
}

async function fallbackKeywordMatch(
  supabase: any,
  answers: Omit<QuizPayload, 'contact' | 'attributed_advisor_id' | 'source'>
): Promise<QuizMatch[]> {
  const normalizeToken = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')

  const budgetRanges: Record<string, [number, number]> = {
    under_50k: [0, 50000],
    '50k_100k': [50000, 100000],
    '100k_250k': [100000, 250000],
    '250k_500k': [250000, 500000],
    over_500k: [500000, 100000000],
  }

  const [budgetMin, budgetMax] = budgetRanges[answers.budget || ''] || [0, 100000000]
  const categories = answers.categories || []
  const territories = answers.territory || []

  let franchises: any[] | null = null
  const franchiseTable = await resolveWorkingTableName(supabase, 'franchises', ['franchise'])

  const broadQuery = await supabase
    .from(franchiseTable)
    .select('*')
    .limit(120)

  if (broadQuery.error) {
    console.error('Franchise fallback query failed:', broadQuery.error)
    return []
  }
  franchises = broadQuery.data

  if (!franchises || franchises.length === 0) return []

  const scored = franchises.map((f: any) => {
    let score = 40
    const reasons: string[] = []

    const hasBudgetRange =
      f.initial_investment_min !== null &&
      f.initial_investment_min !== undefined &&
      f.initial_investment_max !== null &&
      f.initial_investment_max !== undefined
    if (hasBudgetRange) {
      const min = Number(f.initial_investment_min)
      const max = Number(f.initial_investment_max)
      const budgetOverlap = Number.isFinite(min) && Number.isFinite(max) && min <= budgetMax && max >= budgetMin
      if (budgetOverlap) {
        score += 30
        reasons.push('Budget aligned with your investment range')
      }
    }

    if (categories.length > 0 && f.category) {
      const normalizedCategory = normalizeToken(String(f.category))
      const categoryMatch = categories.some((c) => {
        const v = normalizeToken(c)
        return (
          normalizedCategory === v ||
          normalizedCategory.includes(v) ||
          (v.includes('children') && normalizedCategory.includes('child'))
        )
      })
      if (categoryMatch) {
        score += 25
        reasons.push('Matches your industry interests')
      }
    }

    if (answers.business_model && f.business_model === answers.business_model) {
      score += 15
      reasons.push('Matches your preferred business model')
    }

    if (answers.time_commitment && f.time_commitment === answers.time_commitment) {
      score += 10
      reasons.push('Fits your time availability')
    }

    if (territories.length > 0 && Array.isArray(f.territories_available) && f.territories_available.length > 0) {
      const desiredTerritories = territories.map((t) => String(t).trim().toUpperCase())
      const availableTerritories = f.territories_available.map((t: any) => String(t).trim().toUpperCase())
      const territoryMatch = desiredTerritories.some((t) => availableTerritories.includes(t))
      if (territoryMatch) {
        score += 15
        reasons.push('Available in your preferred location')
      }
    }

    if (Array.isArray(answers.goals) && answers.goals.length > 0 && Array.isArray(f.ideal_goals)) {
      const goalMatch = answers.goals.some((g) => f.ideal_goals.includes(g))
      if (goalMatch) {
        score += 5
        reasons.push('Aligned with your business goals')
      }
    }

    if (f.total_locations && f.total_locations > 50) {
      score += 5
    }

    return {
      ...f,
      id: String(f.id),
      similarity_score: Math.max(1, Math.min(99, Math.round(score))),
      match_reasons: reasons.length > 0 ? reasons.slice(0, 3) : ['General fit based on your quiz profile'],
    } as QuizMatch
  })

  return scored
    .sort((a, b) => b.similarity_score - a.similarity_score)
    .slice(0, 20)
}

async function sendQuizResultWebhook(payload: Record<string, any>) {
  const webhookUrl = process.env.AFPA_QUIZ_WEBHOOK_URL
  if (!webhookUrl) return

  const headers = buildWebhookHeaders()
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Webhook failed (${response.status}): ${text}`)
  }
}

function buildWebhookHeaders(): Record<string, string> {
  const apiKey =
    process.env.AFPA_QUIZ_WEBHOOK_APIKEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const bearerToken =
    process.env.AFPA_QUIZ_WEBHOOK_BEARER ||
    process.env.SUPABASE_SERVICE_ROLE_KEY

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (apiKey) headers.apikey = apiKey
  if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`
  return headers
}

async function sendUnattributedQuizNotification(payload: Record<string, any>) {
  const webhookUrl =
    process.env.AFPA_QUIZ_NOTIFICATION_WEBHOOK_URL ||
    process.env.AFPA_QUIZ_WEBHOOK_URL
  if (!webhookUrl) return

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: buildWebhookHeaders(),
    body: JSON.stringify({
      event_type: 'unattributed_quiz_submission',
      ...payload,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Unattributed notification webhook failed (${response.status}): ${text}`)
  }
}

function normalizeAdvisorId(value?: string): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed || trimmed === 'ACTUAL_ADVISOR_ID') return null
  if (!isUuid(trimmed)) return null
  return trimmed
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function extractMissingColumnFromSchemaCacheError(
  error: { message?: string } | null,
  table: string
): string | null {
  const message = error?.message || ''
  const match = message.match(/could not find the '([^']+)' column of '([^']+)' in the schema cache/i)
  if (!match) return null

  const [, column, messageTable] = match
  if (messageTable.toLowerCase() !== table.toLowerCase()) return null
  return column
}

async function insertSingleWithSchemaFallback(
  supabase: any,
  table: string,
  payload: Record<string, any>,
  maxRetries = 10
): Promise<{ data: any; error: { message?: string } | null; removedColumns: string[] }> {
  const workingPayload = { ...payload }
  const removedColumns: string[] = []

  for (let i = 0; i <= maxRetries; i += 1) {
    if (Object.keys(workingPayload).length === 0) {
      return {
        data: null,
        error: { message: `No compatible columns left for insert into ${table}` },
        removedColumns,
      }
    }

    const { data, error } = await supabase.from(table).insert(workingPayload).select().single()
    if (!error) return { data, error: null, removedColumns }

    const missingColumn = extractMissingColumnFromSchemaCacheError(error, table)
    if (!missingColumn || !(missingColumn in workingPayload)) {
      return { data, error, removedColumns }
    }

    delete workingPayload[missingColumn]
    removedColumns.push(missingColumn)
  }

  return {
    data: null,
    error: { message: `Exceeded schema fallback retries while inserting into ${table}` },
    removedColumns,
  }
}

async function insertWithSchemaFallback(
  supabase: any,
  table: string,
  payload: Record<string, any>,
  maxRetries = 10
): Promise<{ error: { message?: string } | null; removedColumns: string[] }> {
  const workingPayload = { ...payload }
  const removedColumns: string[] = []

  for (let i = 0; i <= maxRetries; i += 1) {
    if (Object.keys(workingPayload).length === 0) {
      return {
        error: { message: `No compatible columns left for insert into ${table}` },
        removedColumns,
      }
    }

    const { error } = await supabase.from(table).insert(workingPayload)
    if (!error) return { error: null, removedColumns }

    const missingColumn = extractMissingColumnFromSchemaCacheError(error, table)
    if (!missingColumn || !(missingColumn in workingPayload)) {
      return { error, removedColumns }
    }

    delete workingPayload[missingColumn]
    removedColumns.push(missingColumn)
  }

  return {
    error: { message: `Exceeded schema fallback retries while inserting into ${table}` },
    removedColumns,
  }
}

async function resolveAttributedAdvisorId(
  supabase: any,
  providedAdvisorId: string | null | undefined,
  adminEmail: string
): Promise<string | null> {
  const defaultAdminAdvisorId = normalizeAdvisorId(
    process.env.AFPA_DEFAULT_ADMIN_ADVISOR_ID || process.env.DEFAULT_ADMIN_ADVISOR_ID
  )
  if (defaultAdminAdvisorId) return defaultAdminAdvisorId

  const profilesTable = await resolveWorkingTableName(supabase, 'profiles', ['user_profiles'])

  const normalizedProvidedId = normalizeAdvisorId(providedAdvisorId)
  if (normalizedProvidedId) {
    const { data: providedAdvisor, error: providedAdvisorError } = await supabase
      .from(profilesTable)
      .select('id')
      .eq('id', normalizedProvidedId)
      .maybeSingle()

    if (providedAdvisorError) {
      console.error('Failed to validate provided advisor id:', providedAdvisorError)
    } else if (providedAdvisor?.id) {
      return providedAdvisor.id
    } else {
      console.warn('Ignoring provided advisor id because no matching profile was found:', normalizedProvidedId)
    }
  }

  if (!adminEmail) return null

  const { data, error } = await supabase
    .from(profilesTable)
    .select('id')
    .eq('email', adminEmail)
    .maybeSingle()

  if (error) {
    if (isMissingColumnErrorCode(error, 'email')) {
      console.warn(`Skipping default admin advisor lookup because ${profilesTable}.email is not available.`)
    } else {
      console.error('Failed to resolve default admin advisor id:', error)
    }
    return null
  }

  return data?.id || null
}

async function resolveWorkingTableName(
  supabase: any,
  preferredTable: string,
  alternatives: string[] = []
): Promise<string> {
  const probePreferred = await supabase.from(preferredTable).select('id').limit(1)
  if (!probePreferred.error) return preferredTable

  const hintedTable = extractMissingTableFromSchemaCacheError(probePreferred.error)
  const candidates = [hintedTable, ...alternatives].filter(Boolean) as string[]

  for (const table of candidates) {
    const probe = await supabase.from(table).select('id').limit(1)
    if (!probe.error) return table
  }

  return preferredTable
}

function extractMissingTableFromSchemaCacheError(error: { hint?: string; message?: string } | null): string | null {
  const hint = error?.hint || ''
  const match = hint.match(/table 'public\.([^']+)'/i)
  if (match?.[1]) return match[1]

  const message = error?.message || ''
  const fromMessage = message.match(/table 'public\.([^']+)'/i)
  return fromMessage?.[1] || null
}

function isMissingColumnErrorCode(error: { code?: string; message?: string } | null, column: string): boolean {
  if (!error) return false
  if (error.code !== '42703') return false
  return (error.message || '').toLowerCase().includes(`.${column.toLowerCase()}`)
}
