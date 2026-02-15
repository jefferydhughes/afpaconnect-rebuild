import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BarChart3, TrendingUp, Users, FileText, Building2, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

async function getAnalyticsData() {
  const supabase = createClient()

  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(now.getDate() - 30)
  const sixtyDaysAgo = new Date(now)
  sixtyDaysAgo.setDate(now.getDate() - 60)

  const [
    { count: totalUsers },
    { count: totalQuizzes },
    { count: totalLeads },
    { count: convertedLeads },
    { count: recentUsers },
    { count: recentQuizzes },
    { count: recentLeads },
    { count: prevQuizzes },
    { count: prevLeads },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('quiz_results').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'converted'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo.toISOString()),
    supabase.from('quiz_results').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo.toISOString()),
    supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo.toISOString()),
    supabase.from('quiz_results').select('*', { count: 'exact', head: true })
      .gte('created_at', sixtyDaysAgo.toISOString())
      .lt('created_at', thirtyDaysAgo.toISOString()),
    supabase.from('leads').select('*', { count: 'exact', head: true })
      .gte('created_at', sixtyDaysAgo.toISOString())
      .lt('created_at', thirtyDaysAgo.toISOString()),
  ])

  const quizGrowth = prevQuizzes && prevQuizzes > 0
    ? Math.round(((( recentQuizzes || 0) - prevQuizzes) / prevQuizzes) * 100)
    : 0
  const leadGrowth = prevLeads && prevLeads > 0
    ? Math.round((((recentLeads || 0) - prevLeads) / prevLeads) * 100)
    : 0
  const conversionRate = (totalQuizzes || 0) > 0
    ? Math.round(((convertedLeads || 0) / (totalQuizzes || 1)) * 100)
    : 0

  return {
    totals: {
      users: totalUsers || 0,
      quizzes: totalQuizzes || 0,
      leads: totalLeads || 0,
      converted: convertedLeads || 0,
    },
    last30Days: {
      users: recentUsers || 0,
      quizzes: recentQuizzes || 0,
      leads: recentLeads || 0,
    },
    growth: {
      quizzes: quizGrowth,
      leads: leadGrowth,
    },
    conversionRate,
  }
}

export default async function AdminAnalyticsPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/dashboard/admin/analytics')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  const analytics = await getAnalyticsData()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div>
            <p className="text-brand-gold text-sm font-medium mb-1">Admin Dashboard</p>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-gray-300 mt-1">Platform performance and key metrics</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* All-Time Totals */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All-Time Totals</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500">Total Users</p>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{analytics.totals.users}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500">Quiz Completions</p>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{analytics.totals.quizzes}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500">Total Leads</p>
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-amber-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{analytics.totals.leads}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500">Conversion Rate</p>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{analytics.conversionRate}%</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Last 30 Days */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Last 30 Days</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500">New Users</p>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{analytics.last30Days.users}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500">Quiz Submissions</p>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{analytics.last30Days.quizzes}</p>
                {analytics.growth.quizzes !== 0 && (
                  <p className={`text-sm mt-1 ${analytics.growth.quizzes > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analytics.growth.quizzes > 0 ? '+' : ''}{analytics.growth.quizzes}% vs prev 30 days
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500">New Leads</p>
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-amber-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{analytics.last30Days.leads}</p>
                {analytics.growth.leads !== 0 && (
                  <p className={`text-sm mt-1 ${analytics.growth.leads > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analytics.growth.leads > 0 ? '+' : ''}{analytics.growth.leads}% vs prev 30 days
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>How users move through the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Total Registered Users', value: analytics.totals.users, color: 'bg-blue-500', pct: 100 },
                { label: 'Quiz Completions', value: analytics.totals.quizzes, color: 'bg-purple-500', pct: analytics.totals.users > 0 ? Math.round((analytics.totals.quizzes / analytics.totals.users) * 100) : 0 },
                { label: 'Leads Generated', value: analytics.totals.leads, color: 'bg-amber-500', pct: analytics.totals.quizzes > 0 ? Math.round((analytics.totals.leads / analytics.totals.quizzes) * 100) : 0 },
                { label: 'Converted', value: analytics.totals.converted, color: 'bg-green-500', pct: analytics.totals.leads > 0 ? Math.round((analytics.totals.converted / analytics.totals.leads) * 100) : 0 },
              ].map((stage) => (
                <div key={stage.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">{stage.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{stage.value} <span className="text-gray-400 font-normal">({stage.pct}%)</span></span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${stage.color} rounded-full transition-all`}
                      style={{ width: `${stage.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
