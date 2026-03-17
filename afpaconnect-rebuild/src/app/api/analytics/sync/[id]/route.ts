import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

/**
 * POST /api/analytics/sync/[id]
 * Triggers a data sync for the given platform connection.
 * In production, this would call the respective platform API using the stored
 * OAuth tokens.  Currently returns a stub response — wire up the real sync
 * functions here once platform OAuth credentials are configured.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { data: conn } = await admin
    .from('platform_connections')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!conn) return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
  if (conn.status !== 'connected') {
    return NextResponse.json({ error: 'Platform is not connected' }, { status: 400 })
  }

  // TODO: call the real platform sync function based on conn.platform
  // e.g. syncGMBMetrics(conn), syncMetaAdsMetrics(conn), syncGoogleAnalytics(conn)

  await admin
    .from('platform_connections')
    .update({ last_sync_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', params.id)

  return NextResponse.json({ success: true, message: 'Sync triggered' })
}
