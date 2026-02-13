import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { 
  Users, 
  Target, 
  TrendingUp, 
  Phone,
  Mail,
  Calendar,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Building2,
  ExternalLink,
  Copy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

async function getAdvisorData(userId: string) {
  const supabase = createClient()

  // Get advisor profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!profile || profile.role !== 'advisor') {
    return null
  }

  // Get leads attributed to this advisor
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('attributed_advisor_id', userId)
    .order('created_at', { ascending: false })

  // Get quiz results attributed to this advisor
  const { data: quizResults } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('attributed_advisor_id', userId)
    .order('created_at', { ascending: false })

  // Calculate stats
  const totalLeads = leads?.length || 0
  const newLeads = leads?.filter(l => l.status === 'new').length || 0
  const contactedLeads = leads?.filter(l => l.status === 'contacted').length || 0
  const convertedLeads = leads?.filter(l => l.status === 'converted').length || 0
  
  // This month's leads
  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)
  const thisMonthLeads = leads?.filter(l => new Date(l.created_at) >= thisMonth).length || 0

  return {
    profile,
    leads: leads || [],
    quizResults: quizResults || [],
    stats: {
      totalLeads,
      newLeads,
      contactedLeads,
      convertedLeads,
      thisMonthLeads,
      conversionRate: totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0,
    },
  }
}

const statusColors: Record<string, { bg: string; text: string }> = {
  new: { bg: 'bg-blue-100', text: 'text-blue-700' },
  contacted: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  qualified: { bg: 'bg-purple-100', text: 'text-purple-700' },
  nurturing: { bg: 'bg-orange-100', text: 'text-orange-700' },
  converted: { bg: 'bg-green-100', text: 'text-green-700' },
  unqualified: { bg: 'bg-gray-100', text: 'text-gray-700' },
}

export default async function AdvisorDashboardPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirect=/dashboard/advisor')
  }

  const data = await getAdvisorData(user.id)

  if (!data) {
    redirect('/dashboard')
  }

  const { profile, leads, stats } = data
  const affiliateLink = `https://afpaconnect.com/quiz?advisor=${user.id}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brand-gold text-sm font-medium mb-1">Advisor Dashboard</p>
              <h1 className="text-3xl font-bold">
                Welcome, {profile?.full_name?.split(' ')[0] || 'Advisor'}!
              </h1>
              <p className="text-gray-300 mt-1">
                Manage your leads and track your performance
              </p>
            </div>
            <div className="hidden md:block">
              <Link href="/dashboard/advisor/settings">
                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-brand-navy">
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
                  <p className="text-xs text-gray-500">Total Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.newLeads}</p>
                  <p className="text-xs text-gray-500">New Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Phone className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.contactedLeads}</p>
                  <p className="text-xs text-gray-500">Contacted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.convertedLeads}</p>
                  <p className="text-xs text-gray-500">Converted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.thisMonthLeads}</p>
                  <p className="text-xs text-gray-500">This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-cream rounded-lg">
                  <TrendingUp className="h-5 w-5 text-brand-navy" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
                  <p className="text-xs text-gray-500">Conversion</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Affiliate Link */}
        <Card className="mb-8 border-brand-gold bg-brand-cream">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-brand-navy mb-1">Your Affiliate Link</h3>
                <p className="text-sm text-gray-600">
                  Share this link with prospects. All quiz submissions will be attributed to you.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <code className="px-3 py-2 bg-white rounded-lg text-sm border flex-1 md:flex-none truncate max-w-xs">
                  {affiliateLink}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(affiliateLink)}
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <a href={affiliateLink} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="flex-shrink-0">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Leads Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Leads</CardTitle>
                  <CardDescription>Your latest quiz submissions and inquiries</CardDescription>
                </div>
                <Link href="/dashboard/advisor/leads">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {leads.length > 0 ? (
                  <div className="space-y-3">
                    {leads.slice(0, 8).map((lead) => (
                      <div
                        key={lead.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:border-brand-gold transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-brand-cream flex items-center justify-center">
                            <span className="font-semibold text-brand-navy">
                              {lead.first_name?.[0] || lead.email[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {lead.first_name && lead.last_name 
                                ? `${lead.first_name} ${lead.last_name}`
                                : lead.email}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="h-3 w-3" />
                              {new Date(lead.created_at).toLocaleDateString()}
                              {lead.budget_range && (
                                <>
                                  <span>•</span>
                                  <span className="capitalize">{lead.budget_range.replace(/_/g, ' ')}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={`${statusColors[lead.status]?.bg} ${statusColors[lead.status]?.text} border-0`}>
                            {lead.status}
                          </Badge>
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
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">No leads yet</h3>
                    <p className="text-gray-500 mb-4">
                      Share your affiliate link to start receiving leads
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Lead Pipeline */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'New', value: stats.newLeads, color: 'bg-blue-500' },
                    { label: 'Contacted', value: stats.contactedLeads, color: 'bg-yellow-500' },
                    { label: 'Qualified', value: leads.filter(l => l.status === 'qualified').length, color: 'bg-purple-500' },
                    { label: 'Converted', value: stats.convertedLeads, color: 'bg-green-500' },
                  ].map((stage) => (
                    <div key={stage.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{stage.label}</span>
                        <span className="font-medium">{stage.value}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${stage.color} transition-all`}
                          style={{
                            width: `${stats.totalLeads > 0 ? (stage.value / stats.totalLeads) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/advisor/leads" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Manage All Leads
                  </Button>
                </Link>
                <Link href="/dashboard/advisor/ai-tools" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="mr-2 h-4 w-4" />
                    AI Insights
                  </Button>
                </Link>
                <Link href="/directory" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="mr-2 h-4 w-4" />
                    Browse Franchises
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Performance Tips */}
            <Card className="bg-gradient-to-br from-brand-navy to-brand-navy-light text-white">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">💡 Pro Tip</h3>
                <p className="text-sm text-gray-200 mb-4">
                  Leads who receive a follow-up call within 24 hours are 3x more likely to convert. 
                  Check your new leads daily!
                </p>
                <div className="text-xs text-gray-300">
                  You have {stats.newLeads} new lead{stats.newLeads !== 1 ? 's' : ''} waiting
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
