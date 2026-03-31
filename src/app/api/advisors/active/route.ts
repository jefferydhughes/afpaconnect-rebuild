import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET /api/advisors/active — list all active advisors (uses admin client to bypass RLS)
export async function GET() {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, advisor_specialties, advisor_image_url')
      .eq('role', 'advisor')
      .eq('advisor_is_active', true)
      .order('full_name')

    if (error) {
      console.error('Error fetching advisors:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ advisors: data || [] })
  } catch (err: any) {
    console.error('Advisors API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
