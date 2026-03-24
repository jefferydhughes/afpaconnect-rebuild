'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  LifeBuoy,
  Plus,
  Search,
  AlertCircle,
  Clock,
  CheckCircle,
  Bot,
  ChevronDown,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import CreateTicketModal from '@/components/admin/CreateTicketModal'

type Ticket = {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  page_url: string | null
  submitted_by_email: string | null
  submitted_by_name: string | null
  ai_fix_status: string
  ai_diagnosis: string | null
  ai_fix_pr_url: string | null
  created_at: string
  resolved_at: string | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  open: { label: 'Open', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  ai_diagnosing: { label: 'AI Diagnosing', color: 'bg-purple-100 text-purple-800', icon: Bot },
  ai_fixed: { label: 'AI Fixed', color: 'bg-green-100 text-green-800', icon: Bot },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-600', icon: CheckCircle },
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700' },
}

const CATEGORY_LABELS: Record<string, string> = {
  bug: 'Bug',
  feature_request: 'Feature Request',
  content_issue: 'Content Issue',
  access_issue: 'Access Issue',
  performance: 'Performance',
  other: 'Other',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (priorityFilter !== 'all') params.set('priority', priorityFilter)

    const res = await fetch(`/api/admin/support-tickets?${params}`)
    const data = await res.json()
    if (res.ok) {
      setTickets(data.tickets)
      setTotal(data.total)
    }
    setLoading(false)
  }, [statusFilter, priorityFilter])

  useEffect(() => { fetchTickets() }, [fetchTickets])

  async function handleDelete(id: string) {
    if (!confirm('Delete this ticket?')) return
    const res = await fetch(`/api/admin/support-tickets?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Ticket deleted')
      fetchTickets()
    } else {
      toast.error('Failed to delete')
    }
  }

  const filteredTickets = search
    ? tickets.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase())
      )
    : tickets

  // Stats
  const openCount = tickets.filter(t => t.status === 'open').length
  const aiCount = tickets.filter(t => ['ai_diagnosing', 'ai_fixed'].includes(t.status)).length
  const resolvedCount = tickets.filter(t => ['resolved', 'closed'].includes(t.status)).length

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LifeBuoy className="h-7 w-7 text-brand-navy" />
            Support Tickets
          </h1>
          <p className="text-gray-500 text-sm mt-1">{total} total tickets</p>
        </div>
        <Button
          className="bg-brand-navy text-brand-gold hover:bg-brand-navy-light"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{openCount}</p>
              <p className="text-xs text-gray-500">Open</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Bot className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{aiCount}</p>
              <p className="text-xs text-gray-500">AI Processing</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{resolvedCount}</p>
              <p className="text-xs text-gray-500">Resolved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tickets..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="ai_diagnosing">AI Diagnosing</option>
              <option value="ai_fixed">AI Fixed</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Ticket List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-navy" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-16">
              <LifeBuoy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-500 mb-4">
                {search ? 'Try a different search term.' : 'Create your first support ticket to get started.'}
              </p>
              <Button
                className="bg-brand-navy text-brand-gold"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Ticket
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {filteredTickets.map(ticket => {
                const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open
                const priorityCfg = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.medium
                const StatusIcon = statusCfg.icon

                return (
                  <div key={ticket.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={`/dashboard/admin/support-tickets/${ticket.id}`}
                            className="font-medium text-gray-900 hover:text-brand-navy truncate"
                          >
                            {ticket.title}
                          </Link>
                          <Badge className={`text-xs shrink-0 ${priorityCfg.color}`}>
                            {priorityCfg.label}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-500 line-clamp-1 mb-2">
                          {ticket.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                          <Badge variant="outline" className="text-xs">
                            {CATEGORY_LABELS[ticket.category] || ticket.category}
                          </Badge>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusCfg.label}
                          </span>
                          {ticket.ai_fix_status !== 'pending' && ticket.ai_fix_status !== 'skipped' && (
                            <span className="inline-flex items-center gap-1 text-purple-600">
                              <Bot className="h-3 w-3" />
                              AI: {ticket.ai_fix_status}
                            </span>
                          )}
                          {ticket.ai_fix_pr_url && (
                            <a
                              href={ticket.ai_fix_pr_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              PR
                            </a>
                          )}
                          <span>{timeAgo(ticket.created_at)}</span>
                          {ticket.submitted_by_email && (
                            <span>by {ticket.submitted_by_name || ticket.submitted_by_email}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Link href={`/dashboard/admin/support-tickets/${ticket.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-brand-navy">
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-gray-400 hover:text-red-600"
                          onClick={() => handleDelete(ticket.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateTicketModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreated={fetchTickets}
      />
    </div>
  )
}
