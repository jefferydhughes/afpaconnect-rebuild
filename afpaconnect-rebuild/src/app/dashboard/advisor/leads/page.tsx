import Link from 'next/link'
import { requireAdvisor } from '@/lib/require-role'
import { createClient } from '@/lib/supabase/server'
import { Users, Phone, Mail, Clock, ArrowLeft, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import type { Lead } from '@/types/database'

const statusColors: Record<string, { bg: string; text: string }> = {
  new: { bg: 'bg-blue-100', text: 'text-blue-700' },
  contacted: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  qualified: { bg: 'bg-purple-100', text: 'text-purple-700' },
  nurturing: { bg: 'bg-orange-100', text: 'text-orange-700' },
  converted: { bg: 'bg-green-100', text: 'text-green-700' },
  unqualified: { bg: 'bg-gray-100', text: 'text-gray-700' },
}
export default async function AdvisorLeadsPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string }
}) {
  const { user } = await requireAdvisor('/dashboard/advisor/leads')
  const supabase = createClient()
  let query = supabase.from('leads').select('*').eq('attributed_advisor_id', user.id).order('created_at', { ascending: false })
  if (searchParams.status && searchParams.status !== 'all') { query = query.eq('status', searchParams.status) }
  const { data: leads } = await query
  const allLeads = (leads || []) as Lead[]
  const filtered = searchParams.search
    ? allLeads.filter((l) => l.email?.toLowerCase().includes(searchParams.search!.toLowerCase()) || l.first_name?.toLowerCase().includes(searchParams.search!.toLowerCase()) || l.last_name?.toLowerCase().includes(searchParams.search!.toLowerCase()))
    : allLeads
  const stats = {
    total: allLeads.length,
    new: allLeads.filter((l) => l.status === 'new').length,
    contacted: allLeads.filter((l) => l.status === 'contacted').length,
    converted: allLeads.filter((l) => l.status === 'converted').length,
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/advisor"><Button variant="ghost" size="sm" className="text-white hover:bg-white/10"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button></Link>
            <div>
              <p className="text-brand-gold text-sm font-medium mb-1">Advisor Dashboard</p>
              <h1 className="text-3xl font-bold">My Leads</h1>
              <p className="text-gray-300 mt-1">{stats.total} total leads attributed to you</p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="p-4"><p className="text-2xl font-bold text-gray-900">{stats.total}</p><p className="text-sm text-gray-500">Total</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-2xl font-bold text-blue-600">{stats.new}</p><p className="text-sm text-gray-500">New</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-2xl font-bold text-yellow-600">{stats.contacted}</p><p className="text-sm text-gray-500">Contacted</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{stats.converted}</p><p className="text-sm text-gray-500">Converted</p></CardContent></Card>
        </div>
        <Card className="mb-6"><CardContent className="p-4"><form className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input name="search" placeholder="Search by name or email..." defaultValue={searchParams.search} className="pl-10" /></div>
          <select name="status" defaultValue={searchParams.status || 'all'} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="all">All Status</option><option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="nurturing">Nurturing</option><option value="converted">Converted</option><option value="unqualified">Unqualified</option></select>
          <Button type="submit"><Filter className="mr-2 h-4 w-4" />Filter</Button>
          {(searchParams.status || searchParams.search) && (<Link href="/dashboard/advisor/leads"><Button variant="outline">Clear</Button></Link>)}
        </form></CardContent></Card>
        <Card><CardContent className="p-0">
          {filtered.length > 0 ? (
            <div className="divide-y">{filtered.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-brand-cream flex items-center justify-center flex-shrink-0">
                    <span className="font-semibold text-brand-navy">{lead.first_name?.[0] || lead.email?.[0]?.toUpperCase() || '?'}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{lead.first_name && lead.last_name ? lead.first_name + ' ' + lead.last_name : lead.email}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{lead.email}</span>
                      {lead.budget_range && (<><span>·</span><span className="capitalize">{lead.budget_range.replace(/_/g, ' ')}</span></>)}
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(lead.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={(statusColors[String(lead.status)]?.bg || 'bg-gray-100') + ' ' + (statusColors[String(lead.status)]?.text || 'text-gray-700') + ' border-0 capitalize'}>{lead.status}</Badge>
                  <div className="flex gap-1">
                    {lead.email && (<a href={'mailto:' + lead.email}><Button size="sm" variant="ghost" className="h-8 w-8 p-0"><Mail className="h-4 w-4" /></Button></a>)}
                    {lead.phone && (<a href={'tel:' + lead.phone}><Button size="sm" variant="ghost" className="h-8 w-8 p-0"><Phone className="h-4 w-4" /></Button></a>)}
                  </div>
                </div>
              </div>
            ))}</div>
          ) : (
            <div className="text-center py-16">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No leads found</h3>
              <p className="text-gray-500">{searchParams.search || searchParams.status ? 'Try adjusting your filters' : 'Share your affiliate link to start receiving leads'}</p>
            </div>
          )}
        </CardContent></Card>
      </div>
    </div>
  )
}
