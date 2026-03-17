import { createAdminClient } from '@/lib/supabase/server'
import type { Advisor } from '@/types/database'
import Link from 'next/link'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AdvisorMap from './AdvisorMap'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Find an Advisor | AFPA Connect',
  description:
    'Find a certified franchise advisor near you. Browse our interactive map to connect with experienced advisors who can guide your journey to business ownership.',
}

async function getActiveAdvisors(): Promise<Advisor[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('advisor')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })

  // Only include advisors that have at least city + state for map placement
  return ((data as Advisor[]) ?? []).filter((a) => a.city && a.state)
}

export default async function FindAnAdvisorPage() {
  const advisors = await getActiveAdvisors()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-brand-navy text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Find a Certified Franchise Advisor
          </h1>
          <p className="text-lg text-brand-gold max-w-2xl mx-auto mb-6">
            Connect with an experienced franchise advisor near you to guide your
            journey to business ownership.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2 text-brand-gold">
              <CheckCircle className="h-5 w-5" />
              <span>Free Consultation</span>
            </div>
            <div className="flex items-center gap-2 text-brand-gold">
              <CheckCircle className="h-5 w-5" />
              <span>No Obligation</span>
            </div>
            <div className="flex items-center gap-2 text-brand-gold">
              <CheckCircle className="h-5 w-5" />
              <span>Personalized Guidance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map + List */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AdvisorMap advisors={advisors} />
      </div>

      {/* CTA */}
      <div className="bg-brand-cream py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-brand-navy mb-4">
            Not Ready to Talk Yet?
          </h2>
          <p className="text-gray-600 mb-6">
            Take our free 3-minute quiz to discover franchises that match your
            goals, budget, and lifestyle. No commitment required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/quiz">
              <Button
                size="lg"
                className="bg-brand-navy text-brand-gold hover:bg-brand-navy-light"
              >
                Start the Free Quiz
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/advisors">
              <Button size="lg" variant="outline">
                View All Advisors
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
