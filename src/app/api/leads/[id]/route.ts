import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET /api/leads/[id] — full lead detail with quiz data and franchise matches
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient()
    const { id } = params

    // Fetch lead
    const { data: lead, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Fetch linked quiz result
    let quizResult = null
    if (lead.quiz_result_id) {
      const { data } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('id', lead.quiz_result_id)
        .single()
      quizResult = data
    } else if (lead.email) {
      const { data } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('email', lead.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      quizResult = data
    }

    // Fetch matched franchises
    let franchises: any[] = []
    const matchedIds = (quizResult?.matched_franchises as string[]) || []
    if (matchedIds.length > 0) {
      const { data } = await supabase
        .from('franchise')
        .select(
          'id, name, slug, category, logo_url, initial_investment_min, initial_investment_max, business_model, time_commitment'
        )
        .in('id', matchedIds)
      franchises = data || []
    }

    // Fetch assigned advisor profile
    let advisor = null
    if (lead.attributed_advisor_id) {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, advisor_image_url, advisor_specialties')
        .eq('id', lead.attributed_advisor_id)
        .single()
      advisor = data
    }

    return NextResponse.json({
      lead,
      quizResult,
      franchises,
      advisor,
    })
  } catch (err: any) {
    console.error('Lead detail error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH /api/leads/[id] — update status, advisor, notes
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient()
    const { id } = params
    const body = await req.json()

    const allowedFields = [
      'status',
      'attributed_advisor_id',
      'notes',
      'last_contacted_at',
      'next_follow_up_at',
    ]

    const updates: Record<string, any> = {}
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updates[key] = body[key]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ lead: data })
  } catch (err: any) {
    console.error('Lead update error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
