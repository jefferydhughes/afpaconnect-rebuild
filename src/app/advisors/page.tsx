import { createClient } from '@/lib/supabase/server'
import type { Advisor } from '@/types/database'
import Link from 'next/link'
import Image from 'next/image'
import {
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Star,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

async function getAdvisors() {
  const supabase = createClient()

  const { data: advisorsData } = await supabase
    .from('advisor')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })

  const advisors = advisorsData as Advisor[] | null
  return advisors || []
}

export const metadata = {
  title: 'Find a Franchise Advisor',
  description: 'Connect with certified franchise advisors who can guide you through the franchise buying process.',
}

export default async function AdvisorsPage() {
  const advisors = await getAdvisors()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-brand-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">
              Find Your Franchise Advisor
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Connect with certified franchise advisors who understand your goals
              and can guide you to the perfect franchise opportunity.
            </p>
            <div className="flex flex-wrap gap-4">
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
      </div>

      {/* Why Work with an Advisor */}
      <div className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Why Work with a Franchise Advisor?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-brand-gold" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Expert Guidance</h3>
              <p className="text-gray-600">
                Get personalized recommendations based on your goals, budget, and lifestyle preferences.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-brand-gold" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Save Time</h3>
              <p className="text-gray-600">
                Skip the research overwhelm. Advisors know which franchises match your criteria.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-brand-gold" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Free Service</h3>
              <p className="text-gray-600">
                Our advisors are compensated by franchisors, not you. Consultations are always free.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Advisors Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Our Advisors</h2>
            <p className="text-gray-600">
              {advisors.length} certified franchise advisor{advisors.length !== 1 ? 's' : ''} ready to help
            </p>
          </div>
          <Link href="/quiz">
            <Button variant="outline">
              Or Take Our Quiz First
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {advisors.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advisors.map((advisor) => (
              <Card key={advisor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {advisor.image_url ? (
                        <img
                          src={advisor.image_url}
                          alt={advisor.name || 'Advisor'}
                          className="object-cover w-full h-full rounded-full"
                        />
                      ) : (
                        <User className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {advisor.name || 'Franchise Advisor'}
                      </h3>
                      {advisor.title && (
                        <p className="text-sm text-brand-gold">{advisor.title}</p>
                      )}
                      {advisor.city && advisor.state && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {advisor.city}, {advisor.state}
                        </p>
                      )}
                    </div>
                  </div>

                  {advisor.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {advisor.bio}
                    </p>
                  )}

                  {advisor.specialties && advisor.specialties.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Specialties:</p>
                      <div className="flex flex-wrap gap-1">
                        {advisor.specialties.slice(0, 4).map((specialty) => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {advisor.calendar_embed_code ? (
                      <Link href={`/advisors/${advisor.id}`} className="flex-1">
                        <Button className="w-full bg-brand-navy text-brand-gold hover:bg-brand-navy-light">
                          <Calendar className="mr-2 h-4 w-4" />
                          Schedule Call
                        </Button>
                      </Link>
                    ) : advisor.email ? (
                      <a href={`mailto:${advisor.email}`} className="flex-1">
                        <Button className="w-full bg-brand-navy text-brand-gold hover:bg-brand-navy-light">
                          <Mail className="mr-2 h-4 w-4" />
                          Contact
                        </Button>
                      </a>
                    ) : (
                      <Button className="flex-1 bg-brand-navy text-brand-gold hover:bg-brand-navy-light">
                        <Mail className="mr-2 h-4 w-4" />
                        Contact
                      </Button>
                    )}
                    {advisor.phone && (
                      <a href={`tel:${advisor.phone}`}>
                        <Button variant="outline">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Advisors Coming Soon
            </h3>
            <p className="text-gray-600 mb-4">
              Our advisor network is growing. In the meantime, take our quiz to get personalized franchise recommendations.
            </p>
            <Link href="/quiz">
              <Button>Take the Free Quiz</Button>
            </Link>
          </Card>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-brand-cream py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-brand-navy mb-4">
            Not Ready to Talk Yet?
          </h2>
          <p className="text-gray-600 mb-6">
            Take our free 3-minute quiz to discover franchises that match your goals,
            budget, and lifestyle. No commitment required.
          </p>
          <Link href="/quiz">
            <Button size="lg" className="bg-brand-navy text-brand-gold hover:bg-brand-navy-light">
              Start the Free Quiz
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
