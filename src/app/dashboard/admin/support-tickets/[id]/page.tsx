import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-role'
import {
  ArrowLeft,
  Bot,
  Clock,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  GitBranch,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import TicketActions from '@/components/admin/TicketActions'

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  ai_diagnosing: 'AI Diagnosing',
  ai_fixed: 'AI Fixed',
  resolved: 'Resolved',
  closed: 'Closed',
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
}

const CATEGORY_LABELS: Record<string, string> = {
  bug: 'Bug',
  feature_request: 'Feature Request',
  content_issue: 'Content Issue',
  access_issue: 'Access Issue',
  performance: 'Performance',
  other: 'Other',
}

const AI_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Waiting', color: 'text-gray-500' },
  diagnosing: { label: 'Diagnosing...', color: 'text-purple-600' },
  fixing: { label: 'Fixing...', color: 'text-yellow-600' },
  pr_created: { label: 'PR Created', color: 'text-blue-600' },
  deployed: { label: 'Deployed', color: 'text-green-600' },
  failed: { label: 'Failed', color: 'text-red-600' },
  skipped: { label: 'Skipped', color: 'text-gray-400' },
}

export default async function TicketDetailPage({
  params,
}: {
  params: { id: string }
}) {
  await requireAdmin('/dashboard/admin/support-tickets')

  const admin = createAdminClient()
  const { data: ticket } = await admin
    .from('support_tickets')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!ticket) notFound()

  const aiStatus = AI_STATUS_CONFIG[ticket.ai_fix_status] || AI_STATUS_CONFIG.pending

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand-navy text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin/support-tickets">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex-1">
              <p className="text-brand-gold text-sm font-medium">Admin → Support Tickets</p>
              <h1 className="text-2xl font-bold">{ticket.title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${PRIORITY_COLORS[ticket.priority]} text-sm`}>
                {ticket.priority}
              </Badge>
              <Badge variant="outline" className="border-white/40 text-white text-sm">
                {STATUS_LABELS[ticket.status] || ticket.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray max-w-none text-gray-700 whitespace-pre-wrap">
                  {ticket.description}
                </div>
                {ticket.page_url && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-1">Affected Page</p>
                    <a
                      href={ticket.page_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {ticket.page_url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Agent Section */}
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bot className="h-5 w-5 text-purple-600" />
                  AI Agent
                  <span className={`text-sm font-normal ${aiStatus.color}`}>
                    — {aiStatus.label}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticket.ai_diagnosis && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Diagnosis</p>
                    <div className="bg-purple-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                      {ticket.ai_diagnosis}
                    </div>
                  </div>
                )}

                {ticket.ai_fix_summary && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Fix Summary</p>
                    <div className="bg-green-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                      {ticket.ai_fix_summary}
                    </div>
                  </div>
                )}

                {ticket.ai_fix_branch && (
                  <div className="flex items-center gap-2 text-sm">
                    <GitBranch className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-500">Branch:</span>
                    <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">
                      {ticket.ai_fix_branch}
                    </code>
                  </div>
                )}

                {ticket.ai_fix_pr_url && (
                  <a
                    href={ticket.ai_fix_pr_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Pull Request
                  </a>
                )}

                {ticket.ai_error && (
                  <div>
                    <p className="text-sm font-semibold text-red-700 mb-1">Error</p>
                    <div className="bg-red-50 rounded-lg p-4 text-sm text-red-700 whitespace-pre-wrap">
                      {ticket.ai_error}
                    </div>
                  </div>
                )}

                {ticket.ai_fix_status === 'pending' && (
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500 text-center">
                    AI agent has not processed this ticket yet.
                    Tickets are picked up automatically or can be triggered via the webhook API.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Admin Notes */}
            <TicketActions ticket={ticket} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wider text-gray-500">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400">Category</p>
                  <p className="text-sm font-medium">{CATEGORY_LABELS[ticket.category] || ticket.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Priority</p>
                  <Badge className={`${PRIORITY_COLORS[ticket.priority]} text-xs`}>
                    {ticket.priority}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <p className="text-sm font-medium">{STATUS_LABELS[ticket.status]}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Submitted By</p>
                  <p className="text-sm font-medium">
                    {ticket.submitted_by_name || ticket.submitted_by_email || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Created</p>
                  <p className="text-sm font-medium">
                    {new Date(ticket.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                {ticket.resolved_at && (
                  <div>
                    <p className="text-xs text-gray-400">Resolved</p>
                    <p className="text-sm font-medium">
                      {new Date(ticket.resolved_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
                {ticket.ai_attempted_at && (
                  <div>
                    <p className="text-xs text-gray-400">AI Last Attempted</p>
                    <p className="text-sm font-medium">
                      {new Date(ticket.ai_attempted_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Webhook Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wider text-gray-500">
                  AI Agent Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gray-500 space-y-2">
                <p>
                  Ticket ID for webhook:
                </p>
                <code className="block bg-gray-100 px-2 py-1 rounded font-mono text-xs break-all">
                  {ticket.id}
                </code>
                <p className="mt-2">
                  POST updates to <code className="bg-gray-100 px-1 py-0.5 rounded">/api/admin/support-tickets/webhook</code> with
                  the <code className="bg-gray-100 px-1 py-0.5 rounded">x-webhook-secret</code> header.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
