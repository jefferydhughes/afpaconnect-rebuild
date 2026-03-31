import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-role'
import {
  Search,
  Users,
  Filter,
  Download,
  LayoutGrid,
  LayoutList,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { Lead } from '@/types/database'
import LeadActions from '@/components/leads/LeadActions'
import PipelineView from '@/components/leads/PipelineView'
import Link from 'next/link'

type LeadWithAdvisor = Lead & {
  advisor_name?: string | null
}

async function getLeads(status?: string, search?: string) {
  const supabase = createAdminClient()

  let query = supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (search) {
    query = query.or(
      `email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`
    )
  }

  const { data, error } = await query.limit(200)

  if (error) {
    console.error('Error fetching leads:', error)
    return []
  }

  return (data || []) as LeadWithAdvisor[]
}

async function getAdvisorNames(advisorIds: string[]) {
  if (advisorIds.length === 0) return {}
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', advisorIds)
  return (data || []).reduce(
    (acc, p) => {
      acc[p.id] = p.full_name || p.email
      return acc
    },
    {} as Record<string, string>
  )
}

const statusColors: Record<string, { bg: string; text: string }> = {
  new: { bg: 'bg-blue-100', text: 'text-blue-700' },
  contacted: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  qualified: { bg: 'bg-purple-100', text: 'text-purple-700' },
  nurturing: { bg: 'bg-orange-100', text: 'text-orange-700' },
  converted: { bg: 'bg-green-100', text: 'text-green-700' },
  unqualified: { bg: 'bg-gray-100', text: 'text-gray-700' },
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string; view?: string }
}) {
  await requireAdmin('/dashboard/admin/leads')

  const leads = await getLeads(searchParams.status, searchParams.search)

  // Resolve advisor names
  const advisorIds = Array.from(
    new Set(
      leads
        .map((l) => l.attributed_advisor_id)
        .filter(Boolean) as string[]
    )
  )
  const advisorNames = await getAdvisorNames(advisorIds)
  const enrichedLeads = leads.map((l) => ({
    ...l,
    advisor_name: l.attributed_advisor_id
      ? advisorNames[l.attributed_advisor_id] || null
      : null
  }))

  // Stats (from full dataset before status filter)
  const allLeads = searchParams.status && searchParams.status !== 'all'
    ? await getLeads()
    : leads
  const stats = {
    total: allLeads.length,
    new: allLeads.filter((l) => String(l.status) === 'new').length,
    contacted: allLeads.filter((l) => String(l.status) === 'contacted').length,
    qualified: allLeads.filter((l) => String(l.status) === 'qualified').length,
    converted: allLeads.filter((l) => String(l.status) === 'converted').length,
  }

  const isPipeline = searchParams.view === 'pipeline'

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Pipeline</h1>
          <p className="text-gray-600">{stats.total} total leads across all stages</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/admin/leads?view=${isPipeline ? 'table' : 'pipeline'}${searchParams.status ? '&status=' + searchParams.status : ''}`}
          >
            <Button size="sm" variant="ghost" className="!bg-gray-500 !text-white !border">
              {isPipeline ? (
                <><LayoutList className="mr-2 h-4 w-4" />Table View</>
              ) : (
                <><LayoutGrid className="mr-2 h-4 w-4" />Pipeline View</>
              )}
            </Button>
          </Link>
          <Button size="sm" variant="ghost" className="!bg-gray-500 !text-white !border-0 hover:!bg-gray-500 hover:!text-white">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-900', bg: 'bg-white' },
          { label: 'New', value: stats.new, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Contacted', value: stats.contacted, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Qualified', value: stats.qualified, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Converted', value: stats.converted, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((s) => (
          <Card key={s.label} className={s.bg}>
            <CardContent className="p-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <form className="flex flex-wrap gap-4">
            <input type="hidden" name="view" value={searchParams.view || 'table'} />
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                name="search"
                placeholder="Search by name or email..."
                className="pl-10"
                defaultValue={searchParams.search || ''}
              />
            </div>
            <select
              name="status"
              defaultValue={searchParams.status || 'all'}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="nurturing">Nurturing</option>
              <option value="converted">Converted</option>
              <option value="unqualified">Unqualified</option>
            </select>
            <Button type="submit" variant="ghost" className="!bg-gray-500 !text-white !border-0 hover:!bg-gray-500 hover:!text-white">
              <Filter className="mr-2 h-4 w-4" />
              Apply
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Pipeline or Table View */}
      {isPipeline ? (
        <PipelineView leads={enrichedLeads} />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Lead</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Source</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Budget</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Advisor</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {enrichedLeads.map((lead) => {
                    const name =
                      lead.first_name && lead.last_name
                        ? `${lead.first_name} ${lead.last_name}`
                        : lead.email
                    return (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <Link
                            href={`/dashboard/admin/leads/${lead.id}`}
                            className="block group"
                          >
                            <p className="font-medium text-gray-900 group-hover:text-brand-navy">
                              {name}
                            </p>
                            <p className="text-sm text-gray-500">{lead.email}</p>
                            {lead.phone && (
                              <p className="text-sm text-gray-400">{lead.phone}</p>
                            )}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="capitalize">
                            {lead.source?.replace(/_/g, ' ') || 'Unknown'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {lead.budget_range ? (
                            <span className="capitalize">
                              {lead.budget_range.replace(/_/g, ' ')}
                            </span>
                          ) : (
                            <span className="text-gray-400">Not specified</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {lead.advisor_name ? (
                            <span className="text-brand-navy font-medium">
                              {lead.advisor_name}
                            </span>
                          ) : (
                            <span className="text-gray-400">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={`${
                              statusColors[String(lead.status)]?.bg || 'bg-gray-100'
                            } ${
                              statusColors[String(lead.status)]?.text || 'text-gray-700'
                            } border-0 capitalize`}
                          >
                            {lead.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <LeadActions
                            leadId={lead.id}
                            leadName={name}
                            email={lead.email}
                            phone={lead.phone}
                            status={String(lead.status)}
                            advisorId={lead.attributed_advisor_id}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {enrichedLeads.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">No leads found</h3>
                <p className="text-gray-500">
                  Leads will appear here when users complete the quiz
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
