import { createClient } from '@/lib/supabase/server'
import { 
  Search, 
  Users, 
  Phone,
  Mail,
  MoreHorizontal,
  Filter,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

async function getLeads(status?: string) {
  const supabase = createClient()
  
  let query = supabase
    .from('leads')
    .select(`
      *,
      profiles:attributed_advisor_id (full_name)
    `)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data } = await query.limit(100)

  return data || []
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
  searchParams: { status?: string }
}) {
  const leads = await getLeads(searchParams.status)

  // Calculate stats
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    converted: leads.filter(l => l.status === 'converted').length,
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Leads</h1>
          <p className="text-gray-600">{stats.total} total leads</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Leads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
            <p className="text-sm text-gray-500">New</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-yellow-600">{stats.contacted}</p>
            <p className="text-sm text-gray-500">Contacted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
            <p className="text-sm text-gray-500">Converted</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <form className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                name="search"
                placeholder="Search leads..."
                className="pl-10"
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
            <Button type="submit">
              <Filter className="mr-2 h-4 w-4" />
              Apply
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Lead
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Source
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Budget
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Advisor
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {lead.first_name && lead.last_name
                            ? `${lead.first_name} ${lead.last_name}`
                            : lead.email}
                        </p>
                        <p className="text-sm text-gray-500">{lead.email}</p>
                        {lead.phone && (
                          <p className="text-sm text-gray-500">{lead.phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize">
                        {lead.source?.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {lead.budget_range ? (
                        <span className="capitalize">{lead.budget_range.replace(/_/g, ' ')}</span>
                      ) : (
                        <span className="text-gray-400">Not specified</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {lead.profiles?.full_name || (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={`${statusColors[lead.status]?.bg} ${statusColors[lead.status]?.text} border-0 capitalize`}>
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {lead.email && (
                          <a href={`mailto:${lead.email}`}>
                            <Button size="sm" variant="ghost">
                              <Mail className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                        {lead.phone && (
                          <a href={`tel:${lead.phone}`}>
                            <Button size="sm" variant="ghost">
                              <Phone className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Update Status</DropdownMenuItem>
                            <DropdownMenuItem>Assign Advisor</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {leads.length === 0 && (
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
    </div>
  )
}
