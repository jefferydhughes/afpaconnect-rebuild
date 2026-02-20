export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  CheckCircle2,
  Users,
  Building2,
  TrendingUp,
  Star,
  Clock,
  Shield,
  Unlock,
  Goal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import HeroSection from '@/components/home/HeroSection'

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
    description: 'Connect with certified franchise advisors for personalized guidance.',
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

const successCards = [
  {
    icon: Users,
    title: 'Experience Peace of Mind',
    description: 'Know you\'re making the right decision with expert guidance on every step of the franchise journey.',
  },
  {
    icon: Unlock,
    title: 'Unlock the Best Opportunities',
    description: 'Get matched with franchises that fit your budget, goals, and lifestyle — options you may never have found on your own.',
  },
  {
    icon: Goal,
    title: 'Fast-Track Your Success',
    description: 'Save time, avoid costly mistakes, and move into ownership with clarity and confidence.',
  },
]

const painPoints = [
  'Not sure which franchise is the right fit',
  'Overwhelmed by too many options',
  'Afraid of making the wrong investment',
]

export default async function HomePage() {
  let featuredFranchises: any[] | null = null
  let displayName: string | null = null
  let hasSavedMatches = false
  let matchesHref = '/quiz'

  try {
    const supabase = createClient()
    const cookieStore = cookies()
    const lastQuizResultId = cookieStore.get('afpa_last_quiz_result_id')?.value?.trim() || null

    hasSavedMatches =
      Boolean(lastQuizResultId) &&
      isUuid(lastQuizResultId as string) &&
      (await quizResultExists(supabase, lastQuizResultId as string))
    matchesHref = hasSavedMatches
      ? `/quiz/results?id=${encodeURIComponent(lastQuizResultId as string)}`
      : '/quiz'

    if (hasSavedMatches) {
      displayName = await getQuizDisplayName(supabase, lastQuizResultId as string)
    }

    const featuredResult = await supabase
      .from('franchise')
      .select('id, name, slug, logo_url, category, initial_investment_min, initial_investment_max')
      .eq('is_featured', true)
      .eq('is_active', true)
      .limit(6)
    featuredFranchises = featuredResult.data
  } catch (error) {
    console.error('HomePage: failed to load Supabase-driven sections. Rendering fallback.', error)
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <HeroSection
        hasSavedMatches={hasSavedMatches}
        matchesHref={matchesHref}
        displayName={displayName}
      />

      {/* Strong Statement */}
      <section className="bg-gradient-to-r from-[#CEC8B1]/10 via-white to-[#859FAD]/10 py-16 border-y border-[#859FAD]/20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-2xl md:text-3xl font-bold text-[#062234] leading-tight">
            For aspiring franchise owners who want a{' '}
            <span className="text-[#C19B3F]">guided, faster path</span> to ownership—
            <br className="hidden md:block" />
            no guesswork, just results.
          </p>
        </div>
      </section>

      {/* Success Cards */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successCards.map((item, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-2xl bg-white backdrop-blur-sm border border-[#859FAD]/20 hover:border-[#C19B3F]/50 hover:shadow-[0_20px_60px_rgba(193,155,63,0.15)] transition-all duration-300 hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#C19B3F]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                <div className="relative">
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C19B3F]/10 to-[#859FAD]/10 flex items-center justify-center text-[#062234] group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <item.icon className="h-12 w-12" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-[#062234] mb-4 text-center">{item.title}</h3>
                  <p className="text-[#062234]/70 text-center leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-gradient-to-br from-[#062234] to-[#0a1929] text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-64 h-64 bg-[#C19B3F] rounded-full filter blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-[#859FAD] rounded-full filter blur-3xl" />
        </div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-12">Most aspiring entrepreneurs fail because they start alone.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
            {painPoints.map((problem, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <p className="text-lg text-white/90">{problem}</p>
              </div>
            ))}
          </div>
          <p className="text-[#CEC8B1] text-2xl font-bold">
            It doesn&apos;t have to be that way.
          </p>
        </div>
      </section>

      {/* Guide Section */}
      <section className="bg-gradient-to-br from-white to-[#CEC8B1]/10 py-24">
        <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <div className="inline-block px-4 py-2 rounded-full bg-[#C19B3F]/10 text-[#C19B3F] text-sm font-semibold mb-4">
              Your Success Partner
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#062234] mb-6">We guide you every step of the way.</h2>
            <p className="text-xl text-[#062234]/80 leading-relaxed mb-6">At the AFPA we educate entrepreneurs as they search for the perfect franchise. With personalized support, you&apos;ll never be left guessing.</p>
            <div className="flex flex-col gap-4">
              {[
                'Personalized franchise matching',
                'Expert consultation at every stage',
                'Access to exclusive opportunities',
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#C19B3F] flex-shrink-0" />
                  <span className="text-[#062234] font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/2">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1332&auto=format&fit=crop"
                alt="Advisor helping client"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#062234]/50 to-transparent" />
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
            Join thousands of aspiring franchise owners who&apos;ve found their path to
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

async function getQuizDisplayName(supabase: any, id: string): Promise<string | null> {
  const primary = await supabase.from('quiz_result').select('first_name').eq('id', id).maybeSingle()
  if (!primary.error && primary.data?.first_name) return primary.data.first_name

  const fallback = await supabase.from('quiz_results').select('first_name').eq('id', id).maybeSingle()
  if (!fallback.error && fallback.data?.first_name) return fallback.data.first_name

  return null
}
