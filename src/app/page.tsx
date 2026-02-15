import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Building2, 
  TrendingUp,
  Star,
  Clock,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const features = [
  {
    icon: Clock,
    title: '3-Minute Quiz',
    description: 'Answer simple questions about your goals, budget, and preferences.',
  },
  {
    icon: TrendingUp,
    title: 'AI-Powered Matching',
    description: 'Our algorithm analyzes 600+ franchises to find your perfect fit.',
  },
  {
    icon: Users,
    title: 'Expert Advisors',
    description: 'Connect with certified franchise consultants for personalized guidance.',
  },
  {
    icon: Shield,
    title: 'Verified Listings',
    description: 'Every franchise is vetted with FDD data and satisfaction scores.',
  },
]

const stats = [
  { value: '600+', label: 'Franchise Brands' },
  { value: '10K+', label: 'Matches Made' },
  { value: '95%', label: 'Satisfaction Rate' },
  { value: '50+', label: 'Expert Advisors' },
]

const categories = [
  { name: 'Food & Beverage', icon: '🍕', count: 120 },
  { name: 'Home Services', icon: '🏠', count: 85 },
  { name: 'Health & Fitness', icon: '💪', count: 65 },
  { name: 'Automotive', icon: '🚗', count: 45 },
  { name: 'Business Services', icon: '💼', count: 90 },
  { name: "Children's Services", icon: '🧒', count: 55 },
]

export default async function HomePage() {
  const supabase = createClient()
  const adminSupabase = createAdminClient()
  const cookieStore = cookies()
  const lastQuizResultId = cookieStore.get('afpa_last_quiz_result_id')?.value?.trim() || null
  const hasSavedMatches =
    Boolean(lastQuizResultId) &&
    isUuid(lastQuizResultId as string) &&
    (await quizResultExists(adminSupabase, lastQuizResultId as string))
  const matchesHref = hasSavedMatches
    ? `/quiz/results?id=${encodeURIComponent(lastQuizResultId as string)}`
    : '/quiz'
  
  // Fetch featured franchises
  const { data: featuredFranchises } = await supabase
    .from('franchises')
    .select('id, name, slug, logo_url, category, initial_investment_min, initial_investment_max')
    .eq('is_featured', true)
    .eq('is_active', true)
    .limit(6)

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-cream via-white to-brand-cream py-20 lg:py-28">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="text-center lg:text-left">
              <h1 className="heading-hero">
                Find Your Perfect{' '}
                <span className="text-brand-gold">Franchise Match</span>{' '}
                in Minutes
              </h1>
              <p className="mt-6 text-lg text-gray-600 lg:text-xl">
                Take our free AI-powered quiz and discover franchise opportunities 
                tailored to your goals, budget, and lifestyle. Join thousands who've 
                found their path to business ownership.
              </p>
              
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link href={matchesHref}>
                  <Button size="lg" className="w-full sm:w-auto bg-brand-navy text-brand-gold hover:bg-brand-navy-light text-lg px-8 py-6">
                    {hasSavedMatches ? 'View My Matches' : 'Take the Free Quiz'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/directory">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6">
                    Browse Directory
                  </Button>
                </Link>
              </div>

              <div className="mt-8 flex items-center justify-center gap-4 lg:justify-start">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-white bg-gray-200"
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-brand-navy">10,000+</span> people found their franchise
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute -top-4 -right-4 h-72 w-72 rounded-full bg-brand-gold/20 blur-3xl" />
              <div className="absolute -bottom-4 -left-4 h-72 w-72 rounded-full bg-brand-navy/10 blur-3xl" />
              <Card className="relative overflow-hidden border-0 shadow-2xl">
                <CardContent className="p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold">
                      <Star className="h-6 w-6 text-brand-navy" />
                    </div>
                    <div>
                      <p className="font-semibold text-brand-navy">Quiz Preview</p>
                      <p className="text-sm text-gray-500">3 minutes to your match</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-brand-cream p-4">
                      <p className="text-sm font-medium text-brand-navy">What's your investment budget?</p>
                      <div className="mt-3 space-y-2">
                        {['Under $50K', '$50K - $100K', '$100K - $250K'].map((option) => (
                          <div
                            key={option}
                            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm"
                          >
                            <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                            {option}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-brand-navy md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="heading-section">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600">
              Your franchise journey starts with a simple quiz
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={feature.title} className="relative text-center">
                {index < features.length - 1 && (
                  <div className="absolute right-0 top-8 hidden h-0.5 w-full bg-gray-200 lg:block" style={{ left: '60%', width: '80%' }} />
                )}
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-cream">
                  <feature.icon className="h-8 w-8 text-brand-navy" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-brand-navy">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href={matchesHref}>
              <Button size="lg" className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light">
                {hasSavedMatches ? 'View My Matches' : 'Start Your Free Quiz'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-brand-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="heading-section">Explore by Category</h2>
            <p className="mt-4 text-lg text-gray-600">
              Browse 600+ franchise opportunities across popular industries
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/directory?category=${encodeURIComponent(category.name.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'))}`}
                className="group"
              >
                <Card className="h-full transition-all hover:shadow-lg hover:border-brand-gold">
                  <CardContent className="flex items-center gap-4 p-6">
                    <span className="text-4xl">{category.icon}</span>
                    <div>
                      <h3 className="font-semibold text-brand-navy group-hover:text-brand-gold transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500">{category.count}+ franchises</p>
                    </div>
                    <ArrowRight className="ml-auto h-5 w-5 text-gray-400 group-hover:text-brand-gold transition-colors" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/directory">
              <Button variant="outline" size="lg">
                View All Franchises
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Franchises */}
      {featuredFranchises && featuredFranchises.length > 0 && (
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="heading-section">Featured Franchises</h2>
              <p className="mt-4 text-lg text-gray-600">
                Hand-picked opportunities from top franchise brands
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredFranchises.map((franchise) => (
                <Link key={franchise.id} href={`/directory/${franchise.slug}`}>
                  <Card className="h-full transition-all hover:shadow-lg group">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
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
                        <div className="flex-1">
                          <h3 className="font-semibold text-brand-navy group-hover:text-brand-gold transition-colors">
                            {franchise.name}
                          </h3>
                          <p className="text-sm text-gray-500 capitalize">
                            {franchise.category?.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </div>
                      {(franchise.initial_investment_min || franchise.initial_investment_max) && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-sm text-gray-600">Investment Range</p>
                          <p className="font-semibold text-brand-navy">
                            ${franchise.initial_investment_min?.toLocaleString() || 'N/A'} - ${franchise.initial_investment_max?.toLocaleString() || 'N/A'}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-brand-navy">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Ready to Find Your Perfect Franchise?
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Join thousands of aspiring franchise owners who've found their path to 
            business ownership with our AI-powered matching system.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href={matchesHref}>
              <Button size="lg" className="w-full sm:w-auto bg-brand-gold text-brand-navy hover:bg-brand-gold-light text-lg px-8 py-6">
                {hasSavedMatches ? 'View My Matches' : 'Take the Free Quiz Now'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/advisors">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-brand-navy text-lg px-8 py-6">
                Talk to an Advisor
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

async function quizResultExists(supabase: any, id: string): Promise<boolean> {
  const primary = await supabase.from('quiz_result').select('id').eq('id', id).maybeSingle()
  if (!primary.error) return Boolean(primary.data?.id)

  const fallback = await supabase.from('quiz_results').select('id').eq('id', id).maybeSingle()
  if (!fallback.error) return Boolean(fallback.data?.id)

  return false
}
