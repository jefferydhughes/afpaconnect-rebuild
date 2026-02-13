import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createAdminClient()

    const {
      budget,
      categories,
      business_model,
      time_commitment,
      experience,
      goals,
      contact,
      attributed_advisor_id,
      source = 'website',
    } = body

    // Create quiz result
    const { data: quizResult, error: quizError } = await supabase
      .from('quiz_results')
      .insert({
        email: contact.email,
        first_name: contact.firstName,
        last_name: contact.lastName,
        phone: contact.phone || null,
        budget_range: budget,
        preferred_categories: categories || [],
        business_model_preference: business_model,
        time_commitment: time_commitment,
        experience_level: experience,
        goals: goals || [],
        attributed_advisor_id: attributed_advisor_id || null,
        source,
        quiz_completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (quizError) {
      console.error('Quiz insert error:', quizError)
      throw new Error('Failed to save quiz result')
    }

    // Build user profile for matching
    const userProfile = buildUserProfile({
      budget,
      categories,
      business_model,
      time_commitment,
      experience,
      goals,
    })

    // Get AI-powered matches
    let matches: any[] = []
    try {
      matches = await getAIMatches(supabase, userProfile)
      
      // Update quiz result with matches
      if (matches.length > 0) {
        const matchedFranchises = matches.map((m) => m.id)
        const matchScores = matches.reduce((acc, m) => {
          acc[m.id] = {
            score: m.similarity_score,
            reasons: m.match_reasons || [],
          }
          return acc
        }, {} as Record<string, any>)

        await supabase
          .from('quiz_results')
          .update({
            matched_franchises: matchedFranchises,
            match_scores: matchScores,
            ai_profile_summary: userProfile,
          })
          .eq('id', quizResult.id)
      }
    } catch (matchError) {
      console.error('Matching error:', matchError)
      // Continue even if matching fails
    }

    // Create lead from quiz result
    await supabase.from('leads').insert({
      email: contact.email,
      first_name: contact.firstName,
      last_name: contact.lastName,
      phone: contact.phone || null,
      source: 'quiz',
      quiz_result_id: quizResult.id,
      interested_franchises: matches.slice(0, 5).map((m) => m.id),
      budget_range: budget,
      attributed_advisor_id: attributed_advisor_id || null,
    })

    return NextResponse.json({
      success: true,
      quizResultId: quizResult.id,
      matchCount: matches.length,
    })
  } catch (error) {
    console.error('Quiz submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    )
  }
}

function buildUserProfile(answers: any): string {
  const parts = []

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

  if (answers.categories?.length > 0) {
    parts.push(`Industries: ${answers.categories.join(', ')}`)
  }

  if (answers.business_model) {
    const modelLabels: Record<string, string> = {
      storefront: 'retail/storefront location',
      mobile: 'mobile service business',
      home_based: 'home-based business',
      online: 'online/e-commerce',
    }
    parts.push(`Work style: ${modelLabels[answers.business_model] || answers.business_model}`)
  }

  if (answers.time_commitment) {
    const timeLabels: Record<string, string> = {
      part_time: 'part-time (10-30 hours/week)',
      full_time: 'full-time (40+ hours/week)',
      passive: 'semi-passive investment',
    }
    parts.push(`Time commitment: ${timeLabels[answers.time_commitment] || answers.time_commitment}`)
  }

  if (answers.experience) {
    const expLabels: Record<string, string> = {
      none: 'no prior business experience',
      some: 'some business experience',
      extensive: 'extensive business experience',
    }
    parts.push(`Experience: ${expLabels[answers.experience] || answers.experience}`)
  }

  if (answers.goals?.length > 0) {
    parts.push(`Goals: ${answers.goals.join(', ')}`)
  }

  return parts.join('. ')
}

async function getAIMatches(supabase: any, userProfile: string) {
  // Try embedding-based matching first
  try {
    // Generate embedding for user profile
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: userProfile,
    })

    const userEmbedding = embeddingResponse.data[0].embedding

    // Find similar franchises using vector similarity
    const { data: matches, error } = await supabase.rpc('match_franchises', {
      query_embedding: userEmbedding,
      match_threshold: 0.3,
      match_count: 20,
    })

    if (error) throw error

    if (matches && matches.length > 0) {
      // Get GPT reasoning for top matches
      const reasonedMatches = await addGPTReasoning(matches.slice(0, 10), userProfile)
      return reasonedMatches
    }
  } catch (embeddingError) {
    console.error('Embedding matching failed:', embeddingError)
  }

  // Fallback to keyword-based matching
  return fallbackKeywordMatch(supabase, userProfile)
}

async function addGPTReasoning(matches: any[], userProfile: string) {
  try {
    const prompt = `You are a franchise advisor. A user described themselves as:
"${userProfile}"

Here are franchise matches:
${matches.map((m, i) => `${i + 1}. ${m.name}: ${m.description || 'No description'}`).join('\n')}

For each franchise, explain briefly (1-2 sentences) why it might fit the user.
Respond in JSON as an array: [{ "name": "...", "reason": "..." }]`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    })

    const parsed = JSON.parse(response.choices[0].message.content || '{}')
    const reasons = Array.isArray(parsed) ? parsed : parsed.recommendations || parsed.franchises || []

    return matches.map((match, index) => ({
      ...match,
      similarity_score: Math.round((match.similarity || 0.5) * 100),
      match_reasons: [reasons[index]?.reason || 'Matches your preferences'].filter(Boolean),
    }))
  } catch (error) {
    console.error('GPT reasoning failed:', error)
    return matches.map((match) => ({
      ...match,
      similarity_score: Math.round((match.similarity || 0.5) * 100),
      match_reasons: ['Matches your profile criteria'],
    }))
  }
}

async function fallbackKeywordMatch(supabase: any, userProfile: string) {
  const profileLower = userProfile.toLowerCase()

  // Extract budget range
  let budgetMin = 0
  let budgetMax = 10000000
  if (profileLower.includes('under $50,000')) {
    budgetMax = 50000
  } else if (profileLower.includes('$50,000 to $100,000')) {
    budgetMin = 50000
    budgetMax = 100000
  } else if (profileLower.includes('$100,000 to $250,000')) {
    budgetMin = 100000
    budgetMax = 250000
  } else if (profileLower.includes('$250,000 to $500,000')) {
    budgetMin = 250000
    budgetMax = 500000
  } else if (profileLower.includes('over $500,000')) {
    budgetMin = 500000
  }

  // Get franchises within budget
  const { data: franchises } = await supabase
    .from('franchises')
    .select('*')
    .eq('is_active', true)
    .lte('initial_investment_min', budgetMax)
    .gte('initial_investment_max', budgetMin)
    .limit(50)

  if (!franchises) return []

  // Score each franchise
  const scored = franchises.map((f: any) => {
    let score = 50 // Base score

    // Category matching
    if (f.category && profileLower.includes(f.category.replace(/_/g, ' '))) {
      score += 20
    }

    // Business model matching
    if (f.business_model && profileLower.includes(f.business_model.replace(/_/g, ' '))) {
      score += 15
    }

    // Established brands bonus
    if (f.total_locations && f.total_locations > 50) {
      score += 10
    }

    return {
      ...f,
      similarity_score: score,
      match_reasons: ['Matches your budget and preferences'],
    }
  })

  return scored
    .sort((a: any, b: any) => b.similarity_score - a.similarity_score)
    .slice(0, 20)
}
