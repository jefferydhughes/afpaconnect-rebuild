import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Webhook endpoint for the AI agent to update ticket status.
 * Called by Claude Code Agent SDK or GitHub Actions after diagnosing/fixing an issue.
 *
 * Auth: requires SUPPORT_TICKET_WEBHOOK_SECRET header
 *
 * POST /api/admin/support-tickets/webhook
 * Body: {
 *   ticket_id: string,
 *   action: 'diagnosis' | 'fix_started' | 'fix_complete' | 'fix_failed',
 *   ai_diagnosis?: string,
 *   ai_fix_summary?: string,
 *   ai_fix_branch?: string,
 *   ai_fix_pr_url?: string,
 *   ai_error?: string,
 * }
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-webhook-secret')
  const expectedSecret = process.env.SUPPORT_TICKET_WEBHOOK_SECRET

  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { ticket_id, action } = body

  if (!ticket_id || !action) {
    return NextResponse.json({ error: 'Missing ticket_id or action' }, { status: 400 })
  }

  const admin = createAdminClient()

  const updateData: Record<string, unknown> = {
    ai_attempted_at: new Date().toISOString(),
  }

  switch (action) {
    case 'diagnosis':
      updateData.status = 'ai_diagnosing'
      updateData.ai_fix_status = 'diagnosing'
      updateData.ai_diagnosis = body.ai_diagnosis || null
      break

    case 'fix_started':
      updateData.status = 'in_progress'
      updateData.ai_fix_status = 'fixing'
      break

    case 'fix_complete':
      updateData.status = 'ai_fixed'
      updateData.ai_fix_status = body.ai_fix_pr_url ? 'pr_created' : 'deployed'
      updateData.ai_fix_summary = body.ai_fix_summary || null
      updateData.ai_fix_branch = body.ai_fix_branch || null
      updateData.ai_fix_pr_url = body.ai_fix_pr_url || null
      break

    case 'fix_failed':
      updateData.ai_fix_status = 'failed'
      updateData.ai_error = body.ai_error || 'Unknown error'
      // Don't change status — leave it for human review
      break

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  }

  const { data: ticket, error } = await admin
    .from('support_tickets')
    .update(updateData)
    .eq('id', ticket_id)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(ticket)
}
