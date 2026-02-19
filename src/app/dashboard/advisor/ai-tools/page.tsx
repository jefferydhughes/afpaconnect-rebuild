import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Target, Sparkles, Brain, TrendingUp, FileSearch, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function AdvisorAiToolsPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/dashboard/advisor/ai-tools')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'advisor') {
    redirect('/dashboard')
  }

  // Get this advisor's lead and quiz data for AI insights
  const { data: leads } = await supabase
    .from('leads')
    .select('budget_range, status, created_at')
    .eq('attributed_advisor_id', user.id)

  const { data: quizResults } = await supabase
    .from('quiz_results')
    .select('budget_range, investment_type, created_at')
    .eq('attributed_advisor_id', user.id)

  // Calculate insights
  const totalLeads = leads?.length || 0
  const conversionRate = totalLeads > 0
    ? Math.round((( leads?.filter(l => l.status === 'converted').length || 0) / totalLeads) * 100)
    : 0

  const budgetBreakdown = leads?.reduce((acc: Record<string, number>, lead) => {
    const range = lead.budget_range || 'unknown'
    acc[range] = (acc[range] || 0) + 1
    return acc
  }, {}) || {}

  const budgetEntries = Object.entries(budgetBreakdown) as Array<[string, number]>
  const topBudgetRange = budgetEntries.sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div>
            <p className="text-brand-gold text-sm font-medium mb-1">Advisor Dashboard</p>
            <h1 className="text-3xl font-bold">AI Tools & Insights</h1>
            <p className="text-gray-300 mt-1">
              AI-powered analytics and tools to help you close more deals
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* AI Insights Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-brand-gold bg-brand-cream">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-brand-navy rounded-lg">
                  <TrendingUp className="h-5 w-5 text-brand-gold" />
                </div>
                <p className="font-semibold text-brand-navy">Your Conversion Rate</p>
              </div>
              <p className="text-4xl font-bold text-brand-navy">{conversionRate}%</p>
              <p className="text-sm text-gray-600 mt-1">
                Based on {totalLeads} total lead{totalLeads !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Brain className="h-5 w-5 text-purple-600" />
                </div>
                <p className="font-semibold text-gray-900">Top Budget Range</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 capitalize">
                {topBudgetRange.replace(/_/g, ' ')}
              </p>
              <p className="text-sm text-gray-500 mt-1">Most common among your leads</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Sparkles className="h-5 w-5 text-green-600" />
                </div>
                <p className="font-semibold text-gray-900">Quiz Submissions</p>
              </div>
              <p className="text-4xl font-bold text-gray-900">{quizResults?.length || 0}</p>
              <p className="text-sm text-gray-500 mt-1">Via your affiliate link</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileSearch className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Franchise Matcher</CardTitle>
                  <CardDescription>Find the best franchise matches for a lead's profile</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Use our AI matching engine to instantly identify which franchises best align with a lead's
                investment budget, lifestyle preferences, and industry interests.
              </p>
              <Link href="/quiz">
                <Button className="bg-brand-navy text-brand-gold hover:bg-brand-navy-light">
                  Run AI Match for a Lead
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Lead Intelligence</CardTitle>
                  <CardDescription>AI-powered insights on your leads</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Understand lead behavior patterns, optimal follow-up timing, and personalized
                franchise recommendations based on quiz response data.
              </p>
              <Link href="/dashboard/advisor/leads">
                <Button variant="outline" className="border-brand-navy text-brand-navy hover:bg-brand-cream">
                  View Lead Details
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Target className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle>Franchise Directory</CardTitle>
                  <CardDescription>Browse and research franchise opportunities</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Access the full franchise directory to research investment requirements,
                training programs, and support structures for franchises you recommend.
              </p>
              <Link href="/directory">
                <Button variant="outline" className="border-brand-navy text-brand-navy hover:bg-brand-cream">
                  Browse Directory
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-brand-navy to-brand-navy-light text-white">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-gold/20 rounded-lg">
                  <Sparkles className="h-5 w-5 text-brand-gold" />
                </div>
                <div>
                  <CardTitle className="text-white">Pro Tips</CardTitle>
                  <CardDescription className="text-gray-300">Maximize your performance</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <span className="text-brand-gold">→</span>
                <p className="text-sm text-gray-200">Follow up with new leads within 24 hours to 3x your conversion rate</p>
              </div>
              <div className="flex gap-2">
                <span className="text-brand-gold">→</span>
                <p className="text-sm text-gray-200">Share your quiz link on LinkedIn to attract qualified investors</p>
              </div>
              <div className="flex gap-2">
                <span className="text-brand-gold">→</span>
                <p className="text-sm text-gray-200">Leads in the $50k-$150k range have the highest close rate</p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
