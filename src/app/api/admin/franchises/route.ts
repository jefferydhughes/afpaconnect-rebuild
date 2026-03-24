import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

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

  if (!profile || !['admin', 'home_office'].includes(profile.role)) return null
  return { user, admin }
}

// Create a new franchise
export async function POST(request: NextRequest) {
  const auth = await requireAdminUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  // Strip undefined/null id so the database auto-generates it
  delete body.id

  const { data: franchise, error } = await auth.admin
    .from('franchise')
    .insert(body)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(franchise)
}

// Update an existing franchise — supports UUID id or "slug:the-slug" format
export async function PATCH(request: NextRequest) {
  const auth = await requireAdminUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const identifier = request.nextUrl.searchParams.get('id')
  if (!identifier) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const body = await request.json()

  // Determine whether to look up by UUID or slug
  let query = auth.admin.from('franchise').update(body)

  if (identifier.startsWith('slug:')) {
    query = query.eq('slug', identifier.slice(5))
  } else {
    query = query.eq('id', identifier)
  }

  const { data: franchise, error } = await query.select('*').single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(franchise)
}
