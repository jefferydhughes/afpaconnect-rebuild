import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Admin client uses `cache: 'no-store'`, which makes this fetch dynamic.
// Tell Next.js not to try to statically prerender this route.
export const dynamic = 'force-dynamic'

// GET /api/advisors/active — list all advisors (uses admin client to bypass RLS)
export async function GET() {
  try {
    const supabase = createAdminClient()

    // Query advisors by role. Don't filter on advisor_is_active since
    // it defaults to false and most advisors haven't had it explicitly set.
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, advisor_specialties, advisor_image_url, advisor_is_active')
      .eq('role', 'advisor')
      .order('full_name')

    if (error) {
      console.error('Error fetching advisors:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ advisors: data || [] })
  } catch (err: any) {
    console.error('Advisors API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
