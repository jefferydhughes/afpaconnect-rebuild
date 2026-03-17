import { createAdminClient } from '@/lib/supabase/server'
import type { Advisor } from '@/types/database'
import Link from 'next/link'
import Image from 'next/image'
import { Award, CalendarDays, Linkedin, Star, Target, TrendingUp, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

function toSlug(name: string | null): string {
  return (name ?? '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export const metadata = {
  title: 'Leadership Team | AFPA Connect',
  description:
    "Meet the visionary leaders guiding AFPA's mission to connect entrepreneurs with exceptional franchise opportunities.",
}

async function getLeaders() {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('advisor')
      .select('*')
      .eq('is_active', true)
      .eq('is_leadership', true)
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true })
    return (data as Advisor[] | null) ?? []
  } catch (error) {
    console.error('LeadershipTeamPage: failed to fetch leaders.', error)
    return []
  }
}

const values = [
  {
    title: 'Visionary Leadership',
    description:
      'Our leadership team brings decades of experience in franchise development, operations, and strategic growth.',
    Icon: Award,
  },
  {
    title: 'Industry Expertise',
    description: 'Deep knowledge of franchising trends, best practices, and what makes franchises succeed.',
    Icon: Target,
  },
  {
    title: 'Commitment to Excellence',
    description: 'Dedicated to maintaining the highest standards in franchise consulting and advisory services.',
    Icon: Star,
  },
  {
    title: 'Proven Results',
    description: 'A track record of successful franchise placements and satisfied clients across industries.',
    Icon: TrendingUp,
  },
]

export default async function LeadershipTeamPage() {
  const leaders = await getLeaders()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="bg-brand-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Leadership Team</h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Meet the visionary leaders guiding AFPA&apos;s mission to connect entrepreneurs with exceptional franchise
            opportunities
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {leaders.length === 0 ? (
            <div className="text-center py-20">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No leadership team members available at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {leaders.map((leader) => (
                <Card key={leader.id} className="overflow-hidden hover:shadow-xl transition-shadow bg-white">
                  <CardContent className="p-8 text-center">
                    <div className="w-48 h-48 mx-auto mb-6 overflow-hidden rounded-full bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center">
                      {leader.image_url ? (
                        <Image
                          src={leader.image_url}
                          alt={leader.name ?? 'Leadership team member'}
                          width={192}
                          height={192}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="h-16 w-16 text-gray-300" />
                      )}
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{leader.name}</h3>
                    {leader.title && (
                      <p className="text-brand-gold font-semibold text-lg mb-4">{leader.title}</p>
                    )}

                    {leader.linkedin && (
                      <div className="flex justify-center mb-6">
                        <a
                          href={leader.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-brand-navy transition-colors"
                          aria-label={`${leader.name} on LinkedIn`}
                        >
                          <Linkedin className="w-7 h-7" />
                        </a>
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      <Link href={`/advisors/${toSlug(leader.name)}`}>
                        <Button className="w-full bg-brand-navy text-brand-gold hover:bg-brand-navy-light py-5 text-base font-semibold">
                          View Profile
                        </Button>
                      </Link>
                      {leader.calendar_embed_code && (
                        <Link href={`/advisors/${toSlug(leader.name)}#calendar`}>
                          <Button variant="outline" className="w-full py-5 text-base font-semibold border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white">
                            <CalendarDays className="w-4 h-4 mr-2" />
                            Schedule a Call
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Leadership Philosophy */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Leadership Philosophy</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Guiding principles that drive our commitment to excellence in franchise consulting.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map(({ title, description, Icon }) => (
              <div key={title} className="text-center">
                <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-brand-navy" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Franchise Journey?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Connect with our franchise advisors to explore opportunities that match your goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/advisors">
              <Button size="lg" className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light font-semibold px-8">
                Meet Our Advisors
              </Button>
            </Link>
            <Link href="/quiz">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 font-semibold px-8"
              >
                Take Free Quiz
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
