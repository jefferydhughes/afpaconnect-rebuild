import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { 
  User, 
  FileText, 
  Target, 
  Clock, 
  TrendingUp, 
  ArrowRight,
  CheckCircle,
  Star,
  Building2,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatInvestmentRange, getMatchTier } from '@/lib/utils'

async function getDashboardData(userId: string, userEmail: string) {
  const supabase = createClient()

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  // Get quiz results
  const { data: quizResults } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('email', userEmail)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get info requests
  const { data: infoRequests } = await supabase
    .from('info_requests')
    .select('*')
    .eq('email', userEmail)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get matched franchises from latest quiz
  let matchedFranchises: any[] = []
  if (quizResults && quizResults.length > 0 && quizResults[0].matched_franchises) {
    const { data: franchises } = await supabase
      .from('franchise')
      .select('*')
      .in('id', quizResults[0].matched_franchises.slice(0, 6))

    if (franchises) {
      const matchScores = quizResults[0].match_scores as Record<string, any> || {}
      matchedFranchises = franchises.sort((a, b) => {
        return (matchScores[b.id]?.score || 0) - (matchScores[a.id]?.score || 0)
      })
    }
  }

  return {
    profile,
    quizResults: quizResults || [],
    infoRequests: infoRequests || [],
    matchedFranchises,
    latestQuiz: quizResults?.[0] || null,
  }
}

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/dashboard')
  }

  // Role-based routing: use admin client so RLS doesn't block the profile read
  const adminClient = createAdminClient()
  const { data: roleCheck } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (roleCheck?.role === 'admin') redirect('/dashboard/admin')
  if (roleCheck?.role === 'advisor') redirect('/dashboard/advisor')
  if (roleCheck?.role === 'franchisor') redirect('/dashboard/franchisor')
  if (roleCheck?.role === 'franchise_rep') redirect('/dashboard/franchise-rep')

  const { profile, quizResults, infoRequests, matchedFranchises, latestQuiz } =
    await getDashboardData(user.id, user.email!)

  const matchScores = latestQuiz?.match_scores as Record<string, any> || {}

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!
              </h1>
              <p className="text-gray-600 mt-1">
                Your personalized franchise journey dashboard
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm text-gray-500">Member since</p>
              <p className="font-medium text-gray-900">
                {new Date(profile?.created_at || user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{quizResults.length}</p>
                  <p className="text-sm text-gray-500">Quizzes Taken</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{matchedFranchises.length}</p>
                  <p className="text-sm text-gray-500">Matches Found</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{infoRequests.length}</p>
                  <p className="text-sm text-gray-500">Info Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {latestQuiz ? `${Math.round((matchScores[matchedFranchises[0]?.id]?.score || 0))}%` : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">Best Match</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Latest Matches */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Top Matches</CardTitle>
                  <CardDescription>
                    Based on your most recent quiz results
                  </CardDescription>
                </div>
                {latestQuiz && (
                  <Link href={`/quiz/results?id=${latestQuiz.id}`}>
                    <Button variant="outline" size="sm">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </CardHeader>
              <CardContent>
                {matchedFranchises.length > 0 ? (
                  <div className="space-y-4">
                    {matchedFranchises.slice(0, 4).map((franchise) => {
                      const score = matchScores[franchise.id]?.score || 0
                      const tier = getMatchTier(score)
                      return (
                        <div
                          key={franchise.id}
                          className="flex items-center gap-4 p-4 rounded-lg border hover:border-brand-gold transition-colors"
                        >
                          <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            {franchise.logo_url ? (
                              <img
                                src={franchise.logo_url}
                                alt={franchise.name}
                                className="h-10 w-10 object-contain"
                              />
                            ) : (
                              <Building2 className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {franchise.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {formatInvestmentRange(franchise.initial_investment_min, franchise.initial_investment_max)}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={`${tier.bgColor} ${tier.color} border-0`}>
                              {score}% Match
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">No matches yet</h3>
                    <p className="text-gray-500 mb-4">
                      Take the quiz to discover franchises that match your goals
                    </p>
                    <Link href="/quiz">
                      <Button>Take the Quiz</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quiz History */}
            <Card>
              <CardHeader>
                <CardTitle>Quiz History</CardTitle>
                <CardDescription>Your previous quiz submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {quizResults.length > 0 ? (
                  <div className="space-y-3">
                    {quizResults.map((quiz) => (
                      <Link
                        key={quiz.id}
                        href={`/quiz/results?id=${quiz.id}`}
                        className="flex items-center justify-between p-4 rounded-lg border hover:border-brand-gold transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-brand-cream rounded-lg">
                            <FileText className="h-5 w-5 text-brand-navy" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              FranchiseFit360 Quiz
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(quiz.created_at).toLocaleDateString()} • {quiz.matched_franchises?.length || 0} matches
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    No quiz history yet
                  </p>
                )}
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
                <Link href="/quiz" className="block">
                  <Button className="w-full bg-brand-navy text-brand-gold hover:bg-brand-navy-light">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Take Quiz Again
                  </Button>
                </Link>
                <Link href="/directory" className="block">
                  <Button variant="outline" className="w-full">
                    <Building2 className="mr-2 h-4 w-4" />
                    Browse Directory
                  </Button>
                </Link>
                <Link href="/advisors" className="block">
                  <Button variant="outline" className="w-full">
                    <User className="mr-2 h-4 w-4" />
                    Find an Advisor
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Profile Completion */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">
                        {profile?.full_name && profile?.phone ? '100%' : profile?.full_name ? '50%' : '25%'}
                      </span>
                    </div>
                    <Progress 
                      value={profile?.full_name && profile?.phone ? 100 : profile?.full_name ? 50 : 25} 
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`h-4 w-4 ${user.email ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={user.email ? 'text-gray-900' : 'text-gray-400'}>
                        Email verified
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`h-4 w-4 ${profile?.full_name ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={profile?.full_name ? 'text-gray-900' : 'text-gray-400'}>
                        Name added
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`h-4 w-4 ${quizResults.length > 0 ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={quizResults.length > 0 ? 'text-gray-900' : 'text-gray-400'}>
                        Quiz completed
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Need Help */}
            <Card className="bg-brand-cream border-brand-gold">
              <CardContent className="p-6">
                <h3 className="font-semibold text-brand-navy mb-2">
                  Need Personalized Help?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Connect with a certified franchise advisor who can guide you through the process.
                </p>
                <Link href="/advisors">
                  <Button size="sm" className="w-full bg-brand-gold text-brand-navy hover:bg-brand-gold-light">
                    Find an Advisor
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
