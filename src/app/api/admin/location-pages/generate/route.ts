import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

async function requireAdminUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') return null
  return user
}

// POST /api/admin/location-pages/generate
// Body: { brand, city, province?, country?, population?, market_size?,
//         franchise_description?, franchise_category? }
// Returns AI-enriched fields to merge into a location_pages record
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdminUser()
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 503 })
    }

    const body = await request.json()
    const {
      brand,
      city,
      province,
      country = 'USA',
      population,
      market_size,
      franchise_description,
      franchise_category,
    } = body

    if (!brand || !city) {
      return NextResponse.json({ error: 'brand and city are required' }, { status: 400 })
    }

    const locationStr = [city, province, country].filter(Boolean).join(', ')
    const populationStr = population ? `Population: ${Number(population).toLocaleString()}.` : ''
    const marketStr = market_size ? `Market size: ${market_size}.` : ''
    const descStr = franchise_description ? `Brand description: ${franchise_description}` : ''
    const catStr = franchise_category ? `Category: ${franchise_category}.` : ''

    const prompt = `You are an expert franchise marketing copywriter. Generate SEO-optimized content for a franchise opportunity landing page.

Brand: ${brand}
Location: ${locationStr}
${catStr}
${populationStr}
${marketStr}
${descStr}

Respond with ONLY a valid JSON object matching this exact schema — no markdown, no extra text:
{
  "meta_title": "string (max 60 chars, include brand name and city)",
  "meta_description": "string (max 155 chars, compelling, include city and investment opportunity)",
  "content": "string (2-3 paragraphs of localized SEO content explaining why this city is a great market for this franchise. Reference local demographics, economy, and demand. Written for prospective franchisees.)",
  "selling_points": ["string", "string", "string"] (3-5 unique, specific reasons why this market is attractive for this brand),
  "demographics": "string (brief description of the local population and demographic profile)",
  "economy": "string (brief description of the local economy and key economic drivers)",
  "households": "string (household statistics relevant to the franchise opportunity)",
  "median_income": "string (median household income context)",
  "kids_per_household": "string (relevant if education/children-focused franchise, otherwise omit or set to null)",
  "key_industries": "string (top industries in the area)"
}`

    const openai = new OpenAI({ apiKey })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) {
      return NextResponse.json({ error: 'No response from OpenAI' }, { status: 502 })
    }

    let parsed: any
    try {
      parsed = JSON.parse(raw)
    } catch {
      return NextResponse.json({ error: 'Failed to parse OpenAI JSON response', raw }, { status: 502 })
    }

    return NextResponse.json({
      meta_title: parsed.meta_title || null,
      meta_description: parsed.meta_description || null,
      ai_generated_content: parsed.content || null,
      unique_selling_points: parsed.selling_points || [],
      local_info: {
        demographics: parsed.demographics || null,
        economy: parsed.economy || null,
        households: parsed.households || null,
        median_income: parsed.median_income || null,
        kids_per_household: parsed.kids_per_household || null,
        key_industries: parsed.key_industries || null,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
