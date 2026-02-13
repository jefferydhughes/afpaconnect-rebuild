import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  CheckCircle, 
  Star, 
  AlertTriangle, 
  Building2,
  ArrowRight,
  Phone,
  Mail,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatInvestmentRange, getMatchTier, getCategoryLabel } from '@/lib/utils'

async function getQuizResults(id: string) {
  const supabase = createClient()
  
  // Get quiz result
  const { data: quizResult, error } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !quizResult) {
    return null
  }

  // Get matched franchises
  let franchises: any[] = []
  if (quizResult.matched_franchises && quizResult.matched_franchises.length > 0) {
    const { data } = await supabase
      .from('franchises')
      .select('*')
      .in('id', quizResult.matched_franchises)

    if (data) {
      // Sort by match score
      const matchScores = quizResult.match_scores as Record<string, any> || {}
      franchises = data.sort((a, b) => {
        const scoreA = matchScores[a.id]?.score || 0
        const scoreB = matchScores[b.id]?.score || 0
        return scoreB - scoreA
      })
    }
  }

  return { quizResult, franchises }
}

function FranchiseCard({ 
  franchise, 
  matchScore 
}: { 
  franchise: any
  matchScore: { score: number; reasons: string[] }
}) {
  const tier = getMatchTier(matchScore.score)

  return (
    <Card className={`h-full ${tier.bgColor} border-t-4 ${tier.borderColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-lg bg-white border flex items-center justify-center overflow-hidden">
              {franchise.logo_url ? (
                <Image
                  src={franchise.logo_url}
                  alt={franchise.name}
                  width={64}
                  height={64}
                  className="object-contain"
                />
              ) : (
                <Building2 className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{franchise.name}</CardTitle>
              <Badge variant="secondary" className="mt-1">
                {getCategoryLabel(franchise.category)}
              </Badge>
            </div>
          </div>
          <div className="match-badge-excellent">
            {matchScore.score}% Match
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className={`flex items-center gap-2 ${tier.color}`}>
          {matchScore.score >= 70 ? (
            <CheckCircle className="h-5 w-5" />
          ) : matchScore.score >= 50 ? (
            <Star className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
          <span className="font-semibold">{tier.label}</span>
        </div>

        {matchScore.reasons && matchScore.reasons.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Why it&apos;s a match:</p>
            <ul className="space-y-1">
              {matchScore.reasons.slice(0, 3).map((reason, i) => (
                <li key={i} className="flex items-start text-sm text-gray-600">
                  <span className="text-brand-gold mr-2">●</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-gray-700">Investment Range</p>
          <p className="text-lg font-bold text-brand-navy">
            {formatInvestmentRange(franchise.initial_investment_min, franchise.initial_investment_max)}
          </p>
        </div>

        {franchise.description && (
          <p className="text-sm text-gray-600 line-clamp-3">
            {franchise.description}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-4 border-t">
        <Button variant="outline" className="flex-1" asChild>
          <Link href={`/directory/${franchise.slug}`}>
            <BarChart3 className="h-4 w-4 mr-2" />
            View Details
          </Link>
        </Button>
        <Button className="flex-1 bg-brand-navy text-brand-gold hover:bg-brand-navy-light">
          Request Info
        </Button>
      </CardFooter>
    </Card>
  )
}

function ResultsContent({ id }: { id: string }) {
  return (
    <Suspense fallback={<ResultsLoading />}>
      <ResultsData id={id} />
    </Suspense>
  )
}

async function ResultsData({ id }: { id: string }) {
  const data = await getQuizResults(id)

  if (!data) {
    redirect('/quiz')
  }

  const { quizResult, franchises } = data
  const matchScores = quizResult.match_scores as Record<string, any> || {}

  // Categorize matches
  const bestFits = franchises.filter(f => (matchScores[f.id]?.score || 0) >= 70)
  const goodFits = franchises.filter(f => {
    const score = matchScores[f.id]?.score || 0
    return score >= 50 && score < 70
  })
  const considerCarefully = franchises.filter(f => (matchScores[f.id]?.score || 0) < 50)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Banner */}
        <Card className="mb-8">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Quiz Complete! Here Are Your Results
              </h1>
            </div>
            <p className="text-gray-600">
              We&apos;ve analyzed your answers to find franchises that fit your goals, budget, and personality.
            </p>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="p-6">
              <p className="text-3xl font-bold text-green-600">{bestFits.length}</p>
              <p className="text-sm font-medium text-gray-700">Best Fits</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <p className="text-3xl font-bold text-yellow-600">{goodFits.length}</p>
              <p className="text-sm font-medium text-gray-700">Good Fits</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <p className="text-3xl font-bold text-orange-600">{considerCarefully.length}</p>
              <p className="text-sm font-medium text-gray-700">Consider Carefully</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <p className="text-3xl font-bold text-gray-900">{franchises.length}</p>
              <p className="text-sm font-medium text-gray-700">Total Matches</p>
            </CardContent>
          </Card>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Your Personalized Franchise Matches</h2>
          <p className="mt-2 text-gray-600">Based on your quiz answers, here are your best fits.</p>
        </div>

        {/* Results Sections */}
        <div className="space-y-12">
          {bestFits.length > 0 && (
            <section>
              <div className="flex items-center mb-6">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Best Fits ({bestFits.length})</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Excellent matches with minimal considerations - great options to explore
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bestFits.map((franchise) => (
                  <FranchiseCard
                    key={franchise.id}
                    franchise={franchise}
                    matchScore={matchScores[franchise.id] || { score: 0, reasons: [] }}
                  />
                ))}
              </div>
            </section>
          )}

          {goodFits.length > 0 && (
            <section>
              <div className="flex items-center mb-6">
                <Star className="h-6 w-6 text-yellow-500 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Good Fits ({goodFits.length})</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Strong matches with minor considerations - good options to explore
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goodFits.map((franchise) => (
                  <FranchiseCard
                    key={franchise.id}
                    franchise={franchise}
                    matchScore={matchScores[franchise.id] || { score: 0, reasons: [] }}
                  />
                ))}
              </div>
            </section>
          )}

          {considerCarefully.length > 0 && (
            <section>
              <div className="flex items-center mb-6">
                <AlertTriangle className="h-6 w-6 text-orange-500 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Consider Carefully ({considerCarefully.length})</h3>
              </div>
              <p className="text-gray-600 mb-6">
                These franchises have some misalignment with your preferences - research thoroughly
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {considerCarefully.slice(0, 6).map((franchise) => (
                  <FranchiseCard
                    key={franchise.id}
                    franchise={franchise}
                    matchScore={matchScores[franchise.id] || { score: 0, reasons: [] }}
                  />
                ))}
              </div>
            </section>
          )}

          {franchises.length === 0 && (
            <Card className="text-center p-8">
              <CardContent>
                <p className="text-lg text-gray-600">No franchises found matching your criteria.</p>
                <p className="text-gray-500 mt-2">Try retaking the quiz with broader preferences.</p>
                <Link href="/quiz" className="mt-4 inline-block">
                  <Button>Retake Quiz</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* CTA */}
        <Card className="mt-12 bg-brand-navy text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Need Help Deciding?</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Connect with a certified franchise advisor who can guide you through the 
              decision process and answer your questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/advisors">
                <Button size="lg" className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light">
                  <Phone className="h-4 w-4 mr-2" />
                  Talk to an Advisor
                </Button>
              </Link>
              <Link href="/directory">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-brand-navy">
                  Browse All Franchises
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ResultsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy mx-auto" />
        <p className="mt-4 text-gray-600">Loading your results...</p>
      </div>
    </div>
  )
}

export default function QuizResultsPage({
  searchParams,
}: {
  searchParams: { id?: string }
}) {
  if (!searchParams.id) {
    redirect('/quiz')
  }

  return <ResultsContent id={searchParams.id} />
}
