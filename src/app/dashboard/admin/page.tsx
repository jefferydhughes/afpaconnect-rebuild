import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { 
  Users, 
  Building2, 
  FileText, 
  TrendingUp, 
  Settings,
  PlusCircle,
  ArrowRight,
  BarChart3,
  UserCheck,
  Mail,
  Calendar,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

async function getAdminData() {
  const supabase = createClient()

  // Get counts
  const [
    { count: franchiseCount },
    { count: userCount },
    { count: advisorCount },
    { count: quizCount },
    { count: leadCount },
    { count: newLeadCount },
  ] = await Promise.all([
    supabase.from('franchises').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'advisor'),
    supabase.from('quiz_results').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new'),
  ])

  // Get recent activity
  const { data: recentQuizzes } = await supabase
    .from('quiz_results')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: recentLeads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  // This month stats
  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)

  const { count: thisMonthQuizzes } = await supabase
    .from('quiz_results')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thisMonth.toISOString())

  const { count: thisMonthLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thisMonth.toISOString())

  return {
    stats: {
      franchises: franchiseCount || 0,
      users: userCount || 0,
      advisors: advisorCount || 0,
      quizzes: quizCount || 0,
      leads: leadCount || 0,
      newLeads: newLeadCount || 0,
      thisMonthQuizzes: thisMonthQuizzes || 0,
      thisMonthLeads: thisMonthLeads || 0,
    },
    recentQuizzes: recentQuizzes || [],
    recentLeads: recentLeads || [],
  }
}

export default async function AdminDashboardPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirect=/dashboard/admin')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'home_office'].includes(profile.role)) {
    redirect('/dashboard')
  }

  const { stats, recentQuizzes, recentLeads } = await getAdminData()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brand-gold text-sm font-medium mb-1">Admin Dashboard</p>
              <h1 className="text-3xl font-bold">AFPA Platform Overview</h1>
              <p className="text-gray-300 mt-1">
                Manage franchises, users, and monitor platform activity
              </p>
            </div>
            <div className="hidden md:flex gap-3">
              <Link href="/dashboard/admin/franchises/new">
                <Button className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Franchise
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Franchises</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.franchises}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <Link href="/dashboard/admin/franchises" className="text-sm text-brand-gold hover:underline mt-2 inline-block">
                Manage →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.users}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <Link href="/dashboard/admin/users" className="text-sm text-brand-gold hover:underline mt-2 inline-block">
                Manage →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Quiz Submissions</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.quizzes}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                +{stats.thisMonthQuizzes} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Leads</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.leads}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-green-100 text-green-700 border-0">
                  {stats.newLeads} new
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-brand-cream border-brand-gold">
            <CardContent className="p-4 flex items-center gap-4">
              <UserCheck className="h-8 w-8 text-brand-navy" />
              <div>
                <p className="text-2xl font-bold text-brand-navy">{stats.advisors}</p>
                <p className="text-sm text-gray-600">Active Advisors</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <Calendar className="h-8 w-8 text-gray-400" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.thisMonthLeads}</p>
                <p className="text-sm text-gray-600">Leads This Month</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <BarChart3 className="h-8 w-8 text-gray-400" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.quizzes > 0 ? Math.round((stats.leads / stats.quizzes) * 100) : 0}%
                </p>
                <p className="text-sm text-gray-600">Quiz → Lead Rate</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <AlertCircle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.newLeads}</p>
                <p className="text-sm text-gray-600">Needs Follow-up</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Quizzes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Quiz Submissions</CardTitle>
                  <CardDescription>Latest users who completed the quiz</CardDescription>
                </div>
                <Link href="/dashboard/admin/quizzes">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {quiz.first_name && quiz.last_name
                              ? `${quiz.first_name} ${quiz.last_name}`
                              : quiz.email}
                          </p>
                          <p className="text-sm text-gray-500">
                            {quiz.budget_range?.replace(/_/g, ' ')} • {quiz.matched_franchises?.length || 0} matches
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(quiz.created_at).toLocaleDateString()}
                        </p>
                        {quiz.attributed_advisor_id && (
                          <Badge variant="outline" className="text-xs">
                            Via Advisor
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Leads */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Leads</CardTitle>
                  <CardDescription>Latest converted leads from quizzes</CardDescription>
                </div>
                <Link href="/dashboard/admin/leads">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {lead.first_name && lead.last_name
                              ? `${lead.first_name} ${lead.last_name}`
                              : lead.email}
                          </p>
                          <p className="text-sm text-gray-500">{lead.email}</p>
                        </div>
                      </div>
                      <Badge
                        className={`border-0 ${
                          lead.status === 'new'
                            ? 'bg-blue-100 text-blue-700'
                            : lead.status === 'converted'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {lead.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/admin/franchises" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="mr-2 h-4 w-4" />
                    Manage Franchises
                  </Button>
                </Link>
                <Link href="/dashboard/admin/users" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                </Link>
                <Link href="/dashboard/admin/advisors" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Manage Advisors
                  </Button>
                </Link>
                <Link href="/dashboard/admin/leads" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="mr-2 h-4 w-4" />
                    View All Leads
                  </Button>
                </Link>
                <Link href="/dashboard/admin/settings" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Platform Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database</span>
                    <Badge className="bg-green-100 text-green-700 border-0">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">AI Matching</span>
                    <Badge className="bg-green-100 text-green-700 border-0">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email Service</span>
                    <Badge className="bg-green-100 text-green-700 border-0">Connected</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
