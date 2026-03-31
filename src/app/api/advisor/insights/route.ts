import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      budget_range,
      preferred_categories,
      business_model_preference,
      time_commitment,
      experience_level,
      goals,
      ai_profile_summary,
      first_name,
    } = body

    const prompt = `You are an expert franchise consultant AI. Analyze this candidate's quiz data and generate actionable advisor insights.

Candidate Profile:
- Name: ${first_name || 'Unknown'}
- Budget Range: ${budget_range || 'Not specified'}
- Preferred Categories: ${(preferred_categories || []).join(', ') || 'None specified'}
- Business Model Preference: ${business_model_preference || 'Not specified'}
- Time Commitment: ${time_commitment || 'Not specified'}
- Experience Level: ${experience_level || 'Not specified'}
- Goals: ${(goals || []).join(', ') || 'None specified'}
${ai_profile_summary ? `- AI Profile Summary: ${ai_profile_summary}` : ''}

Return a JSON object with these fields:
1. archetype: A short label for this candidate type (e.g., "The Hands-On Operator", "The Passive Investor", "The Career Changer")
2. motivations: Array of 3-5 key motivations driving this person toward franchise ownership
3. decision_style: One word or short phrase (e.g., "Collaborative", "Analytical", "Intuitive", "Deliberate")
4. readiness_level: "High", "Medium", or "Low"
5. talking_points: Array of 5-7 specific, actionable talking points for the advisor's first call with this candidate. Be specific to their profile, not generic.
6. concerns: Array of 3-5 potential concerns or objections this candidate likely has based on their profile

Be specific and actionable. Every insight should help the advisor have a better conversation.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1200,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    }

    const insights = JSON.parse(content)

    return NextResponse.json(insights)
  } catch (err: any) {
    console.error('AI insights error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
