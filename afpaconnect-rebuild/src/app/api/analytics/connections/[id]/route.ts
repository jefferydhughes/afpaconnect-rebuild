import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // Verify ownership before deleting
  const { data: conn } = await admin
    .from('platform_connections')
    .select('user_id')
    .eq('id', params.id)
    .single()

  if (!conn || conn.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await admin
    .from('platform_connections')
    .update({ status: 'disconnected', access_token: null, refresh_token: null, updated_at: new Date().toISOString() })
    .eq('id', params.id)

  return NextResponse.json({ success: true })
}
