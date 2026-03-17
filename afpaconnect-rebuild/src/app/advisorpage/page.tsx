import { createAdminClient } from '@/lib/supabase/server'
import type { Advisor } from '@/types/database'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Mail,
  ExternalLink,
  Calendar,
  Play,
  Check,
  Smartphone,
} from 'lucide-react'
import CalendarEmbed from './CalendarEmbed'

export const dynamic = 'force-dynamic'

function toSlug(name: string | null): string {
  return (name ?? '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function fallbackAdvisor(): Advisor {
  return {
    id: 'fallback',
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
    created_by: null,
    name: 'David Floyd',
    title: 'Franchise Consultant',
    email: 'david@theperfectfranchise.com',
    phone: null,
    bio: null,
    image_url:
      'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=800&auto=format&fit=crop',
    video_url: null,
    calendar_embed_code: null,
    blog_url: null,
    personal_quote: "I don't push franchises. I protect people from buying the wrong one.",
    testimonials: [
      {
        quote:
          'Working with David saved me months of wasted research and helped me confidently choose the right franchise.',
        author: 'Jane D., Successful Franchisee',
      },
    ],
    credentials: null,
    specialties: null,
    linkedin: null,
    years_experience: null,
    is_active: true,
    is_leadership: null,
    display_order: null,
    city: null,
    state: null,
    latitude: null,
    longitude: null,
  }
}

async function getAdvisorFromSearchParams(searchParams: { id?: string; name?: string }): Promise<Advisor> {
  const supabase = createAdminClient()

  if (searchParams.id) {
    const { data } = await supabase
      .from('advisor')
      .select('*')
      .eq('id', searchParams.id)
      .eq('is_active', true)
      .maybeSingle()

    if (data) return data as Advisor
  }

  if (searchParams.name) {
    const requestedName = decodeURIComponent(searchParams.name).trim()
    const requestedSlug = toSlug(requestedName)

    const { data } = await supabase.from('advisor').select('*').eq('is_active', true)
    const advisors = (data ?? []) as Advisor[]

    const match = advisors.find((a) => {
      const advisorName = (a.name ?? '').trim()
      return advisorName.toLowerCase() === requestedName.toLowerCase() || toSlug(advisorName) === requestedSlug
    })

    if (match) return match
  }

  return fallbackAdvisor()
}

export default async function AdvisorPage({
  searchParams,
}: {
  searchParams: { id?: string; name?: string }
}) {
  const advisor = await getAdvisorFromSearchParams(searchParams)

  const advisorName = advisor.name ?? 'Franchise Consultant'
  const advisorTitle = advisor.title ?? 'Franchise Consultant'
  const advisorEmail = advisor.email ?? 'hello@theperfectfranchise.com'
  const advisorImage =
    advisor.image_url ??
    'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=800&auto=format&fit=crop'

  const mailtoSubject = encodeURIComponent('Franchise Consultation Request')
  const mailtoBody = encodeURIComponent(
    `Hi ${advisorName},\n\nI'm interested in learning more about franchise opportunities and would like to schedule a consultation.\n\nThank you!`,
  )

  return (
    <div className="font-sans text-gray-800 bg-white">
      <style>{`
        .calendar-embed-container iframe {
          width: 100%;
          height: 650px;
          border: none;
        }
      `}</style>

      <section
        className="relative bg-cover bg-center py-24 text-white"
        style={{
          backgroundImage:
            "url('https://plus.unsplash.com/premium_photo-1661719082819-148ab813356e?q=80&w=1920&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 items-center px-4 sm:px-6 lg:px-8">
          <div className="lg:col-span-3 space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold text-white drop-shadow-md">
              Want to Own a Business But Don&apos;t Know Where to Start?
            </h1>
            <p className="text-lg text-gray-200 drop-shadow-md">
              I&apos;ll help you avoid expensive mistakes, discover franchises that actually work, and walk you through
              the process - for free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold text-base">
                <Link href="/quiz">Find My Perfect Franchise</Link>
              </Button>

              {advisor.calendar_embed_code ? (
                <Button asChild className="px-6 py-3 text-slate-700 font-semibold rounded-lg shadow-lg bg-white hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center gap-2 justify-center">
                  <a href="#calendar">
                    <Smartphone className="w-5 h-5" />
                    Book a Free Strategy Call
                  </a>
                </Button>
              ) : (
                <Button asChild className="px-6 py-3 text-slate-700 font-semibold rounded-lg shadow-lg bg-white hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center gap-2 justify-center">
                  <a href={`mailto:${advisorEmail}?subject=${mailtoSubject}`}>
                    <Smartphone className="w-5 h-5" />
                    Book a Free Strategy Call
                  </a>
                </Button>
              )}
            </div>
          </div>

          <aside className="lg:col-span-1 bg-white/90 backdrop-blur-sm text-gray-800 shadow-xl rounded-lg p-6 sticky top-24">
            <img
              src={advisorImage}
              alt={`${advisorName}, Franchise Consultant`}
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />

            <p className="text-center font-medium text-lg text-gray-900">{advisorName}</p>
            <p className="text-sm text-center text-gray-500">{advisorTitle}</p>
            <div className="mt-4 space-y-2">
              {advisor.calendar_embed_code ? (
                <a
                  href="#calendar"
                  className="w-full px-4 py-2 text-white rounded-md bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Book a Call
                </a>
              ) : (
                <a
                  href={`mailto:${advisorEmail}?subject=${mailtoSubject}`}
                  className="w-full px-4 py-2 text-white rounded-md bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Book a Call
                </a>
              )}

              {advisor.video_url && (
                <a
                  href="#video"
                  className="w-full px-4 py-2 border rounded-md border-slate-300 text-slate-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Watch Intro Video
                </a>
              )}

              <a
                href={`mailto:${advisorEmail}?subject=${mailtoSubject}&body=${mailtoBody}`}
                className="w-full px-4 py-2 border rounded-md border-slate-300 text-slate-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email Me
              </a>

              {advisor.blog_url && (
                <a
                  href={advisor.blog_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2 border rounded-md border-slate-300 text-slate-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Read my Blog
                </a>
              )}
            </div>
          </aside>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8 text-amber-400">Most franchise buyers make these mistakes...</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-lg shadow font-medium">Google random brands until overwhelmed</div>
            <div className="p-6 bg-white rounded-lg shadow font-medium">Fall for slick sales reps</div>
            <div className="p-6 bg-white rounded-lg shadow font-medium">Buy businesses that do not fit their lifestyle</div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto text-center space-y-6 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold">What You Get When We Work Together</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">Personalized franchise matching</div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">Financial pre-qualification help</div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">Step-by-step guidance</div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">Introductions to top franchises</div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">Funding and legal resources</div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">Post-purchase support</div>
          </div>
          <Button asChild className="mt-8 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
            <Link href="/quiz">Which Franchise is Right For You?</Link>
          </Button>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-blue-600 to-cyan-500">
        <div className="max-w-5xl mx-auto text-center space-y-6 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">The Perfect Franchise Framework</h2>
          <p className="text-lg text-white/90">We do not sell you a franchise - we match you with the right one.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-medium">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg shadow text-white">Personality Match</div>
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg shadow text-white">Financial Fit</div>
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg shadow text-white">Lifestyle Alignment</div>
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg shadow text-white">Growth Opportunity</div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-2xl font-bold mb-6 text-amber-400">Why People Trust Us</h2>

            {(advisor.testimonials ?? []).map((testimonial, index) => (
              <blockquote key={index} className="bg-gray-50 p-6 rounded-lg shadow mb-4">
                <p className="mb-2">&ldquo;{testimonial.quote}&rdquo;</p>
                <footer className="text-right font-medium text-gray-700">- {testimonial.author}</footer>
              </blockquote>
            ))}

            {advisor.personal_quote && (
              <blockquote className="bg-gray-50 p-6 rounded-lg shadow">
                <p>&ldquo;{advisor.personal_quote}&rdquo;</p>
              </blockquote>
            )}
          </div>

          <div className="flex flex-col items-center justify-center">
            <img src={advisorImage} alt={advisorName} className="w-40 h-40 rounded-full mb-4 object-cover" />
            <p className="font-medium">{advisorName}</p>
            <p className="text-sm text-gray-500">{advisorTitle}</p>
          </div>
        </div>
      </section>

      {advisor.video_url && (
        <section id="video" className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Watch My Introduction Video</h2>
            <div className="rounded-xl overflow-hidden bg-black shadow-xl">
              <video className="w-full h-auto" controls poster={advisorImage}>
                <source src={advisor.video_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </section>
      )}

      <section className="py-12 text-center text-white bg-gradient-to-br from-blue-600 to-cyan-500">
        <div className="px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-4">Limited Spots Available</h2>
          <p className="mb-6">
            I only work with 5-7 serious candidates per month to give personalized attention.
            <br />
            Franchise territories sell fast - do not miss yours.
          </p>
          {advisor.calendar_embed_code ? (
            <a
              href="#calendar"
              className="inline-flex px-6 py-3 text-white font-semibold rounded-lg bg-orange-500 hover:bg-orange-600 transition-opacity"
            >
              Book Your Free Call
            </a>
          ) : (
            <a
              href={`mailto:${advisorEmail}?subject=${mailtoSubject}`}
              className="inline-flex px-6 py-3 text-white font-semibold rounded-lg bg-orange-500 hover:bg-orange-600 transition-opacity"
            >
              Book Your Free Call
            </a>
          )}
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Here are the Important Reasons Why People <span className="text-orange-500">Engage</span> Us
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gray-50 rounded-xl shadow-md border border-gray-100">
              <div className="flex justify-center items-center mb-4">
                <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-lg">
                  <Check className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Goal Clarification and Education</h3>
              <p className="text-gray-600">
                We help you reassess your career path, clarify your goals, and provide essential insights into the
                franchising world.
              </p>
            </div>

            <div className="text-center p-8 bg-gray-50 rounded-xl shadow-md border border-gray-100">
              <div className="flex justify-center items-center mb-4">
                <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-lg">
                  <Check className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Time-Saving and Risk Reduction</h3>
              <p className="text-gray-600">
                We streamline discovery by matching you with top franchise brands that align with your skills,
                minimizing risk and optimizing your exploration.
              </p>
            </div>

            <div className="text-center p-8 bg-gray-50 rounded-xl shadow-md border border-gray-100">
              <div className="flex justify-center items-center mb-4">
                <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-lg">
                  <Check className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Empowered Decision Making</h3>
              <p className="text-gray-600">
                We support you in making informed decisions by turning fears into facts, ensuring you maximize your
                investment in a new franchise opportunity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {advisor.calendar_embed_code && (
        <section id="calendar" className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Schedule a Meeting with {advisorName}</h2>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden calendar-embed-container">
              <CalendarEmbed html={advisor.calendar_embed_code} />
            </div>
          </div>
        </section>
      )}

      <section className="py-16 text-center text-white bg-gradient-to-br from-blue-600 to-cyan-500">
        <div className="px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to See What Franchises You Qualify For?</h2>
          <p className="mb-6">Your future business might be just one call away.</p>

          {advisor.calendar_embed_code ? (
            <a
              href="#calendar"
              className="inline-flex px-8 py-4 text-white font-semibold rounded-lg shadow bg-orange-500 hover:bg-orange-600 transition-opacity items-center gap-2"
            >
              <Smartphone className="w-5 h-5" />
              Book Your Free Discovery Call
            </a>
          ) : (
            <a
              href={`mailto:${advisorEmail}?subject=${mailtoSubject}`}
              className="inline-flex px-8 py-4 text-white font-semibold rounded-lg shadow bg-orange-500 hover:bg-orange-600 transition-opacity items-center gap-2"
            >
              <Smartphone className="w-5 h-5" />
              Book Your Free Discovery Call
            </a>
          )}
        </div>
      </section>
    </div>
  )
}