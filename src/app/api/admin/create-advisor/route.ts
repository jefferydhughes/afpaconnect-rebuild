import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Advisor, Profile } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    // Verify caller is admin
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const profile = profileData as Pick<Profile, 'role'> | null

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { email, name, ...rest } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Insert into the advisor table
    const advisorTable = adminClient.from('advisor') as any
    const { data: advisorData, error: insertError } = await advisorTable
      .insert({
        email,
        name: name || null,
        created_by: user.id,
        ...rest,
      })
      .select('id')
      .single()

    const advisor = advisorData as Pick<Advisor, 'id'> | null

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    if (!advisor) {
      return NextResponse.json({ error: 'Advisor creation failed' }, { status: 500 })
    }

    return NextResponse.json({ id: advisor.id, success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
