import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const VALID_ROLES = ['admin', 'advisor', 'franchisor', 'franchise_rep', 'user'] as const

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: callerProfile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!callerProfile || callerProfile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { role, full_name, associated_franchise_id } = body

  if (role !== undefined && !VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  // Require franchise association when setting franchisor or franchise_rep
  if ((role === 'franchisor' || role === 'franchise_rep') && !associated_franchise_id) {
    return NextResponse.json(
      { error: 'A franchise must be selected for franchisor and franchise_rep roles' },
      { status: 400 }
    )
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (role !== undefined) update.role = role
  if (full_name !== undefined) update.full_name = full_name

  // Set or clear the franchise association based on role
  if (role === 'franchisor' || role === 'franchise_rep') {
    update.associated_franchise_id = associated_franchise_id
  } else if (role !== undefined) {
    // Changing to a non-franchise role — clear the association
    update.associated_franchise_id = null
  } else if (associated_franchise_id !== undefined) {
    update.associated_franchise_id = associated_franchise_id
  }

  const { data, error } = await admin
    .from('profiles')
    .update(update)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
