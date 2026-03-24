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

// List tickets
export async function GET(request: NextRequest) {
  const auth = await requireAdminUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = 20
  const from = (page - 1) * pageSize

  let query = auth.admin
    .from('support_tickets')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)

  if (status && status !== 'all') query = query.eq('status', status)
  if (priority && priority !== 'all') query = query.eq('priority', priority)

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ tickets: data || [], total: count || 0 })
}

// Create ticket
export async function POST(request: NextRequest) {
  const auth = await requireAdminUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  const { data: ticket, error } = await auth.admin
    .from('support_tickets')
    .insert({
      title: body.title,
      description: body.description,
      category: body.category || 'bug',
      priority: body.priority || 'medium',
      page_url: body.page_url || null,
      screenshot_url: body.screenshot_url || null,
      submitted_by_email: body.submitted_by_email || auth.user.email,
      submitted_by_name: body.submitted_by_name || null,
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(ticket)
}

// Update ticket
export async function PATCH(request: NextRequest) {
  const auth = await requireAdminUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const body = await request.json()

  // If resolving, set resolved_at
  if (body.status === 'resolved' || body.status === 'closed') {
    body.resolved_at = new Date().toISOString()
  }

  const { data: ticket, error } = await auth.admin
    .from('support_tickets')
    .update(body)
    .eq('id', id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(ticket)
}

// Delete ticket
export async function DELETE(request: NextRequest) {
  const auth = await requireAdminUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await auth.admin
    .from('support_tickets')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
