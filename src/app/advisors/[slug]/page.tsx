import { createAdminClient } from '@/lib/supabase/server'
import type { Advisor } from '@/types/database'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  MapPin, Award, Briefcase, Linkedin, BookOpen,
  Quote, Star, ExternalLink, User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import CalendarEmbed from '@/app/advisorpage/CalendarEmbed'
import AdvisorCookieSetter from '@/components/advisor/AdvisorCookieSetter'

function toSlug(name: string | null): string {
  return (name ?? '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

async function getAdvisorBySlug(slug: string): Promise<Advisor | null> {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('advisor')
      .select('*')
      .eq('is_active', true)

    if (!data) return null
    return (data as Advisor[]).find((a) => toSlug(a.name) === slug) ?? null
  } catch (error) {
    console.error('AdvisorProfilePage: failed to fetch advisor', error)
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const advisor = await getAdvisorBySlug(params.slug)
  if (!advisor) return { title: 'Advisor Not Found | AFPA Connect' }

  const description =
    advisor.bio?.slice(0, 160) ??
    `Meet ${advisor.name}, ${advisor.title ?? 'Franchise Advisor'} at AFPA Connect. Book a free consultation today.`

  return {
    title: `${advisor.name} | AFPA Connect`,
    description,
    openGraph: {
      title: `${advisor.name} | AFPA Connect`,
      description,
      images: advisor.image_url ? [{ url: advisor.image_url }] : [],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${advisor.name} | AFPA Connect`,
      description,
      images: advisor.image_url ? [advisor.image_url] : [],
    },
  }
}

export default async function AdvisorProfilePage({
  params,
}: {
  params: { slug: string }
}) {
  const advisor = await getAdvisorBySlug(params.slug)

  if (!advisor) {
    notFound()
  }

  const firstName = advisor.name?.split(' ')[0] ?? 'This advisor'

  return (
    <div className="min-h-screen bg-slate-50">
      <AdvisorCookieSetter advisorId={advisor.id} />

      {/* ── Hero ── */}
      <div className="bg-brand-navy text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">

            {/* Photo */}
            <div className="w-40 h-40 md:w-48 md:h-48 shrink-0 rounded-full overflow-hidden bg-slate-700 border-4 border-brand-gold shadow-xl flex items-center justify-center">
              {advisor.image_url ? (
                <Image
                  src={advisor.image_url}
                  alt={advisor.name ?? 'Advisor photo'}
                  width={192}
                  height={192}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-20 h-20 text-gray-400" />
              )}
            </div>

            {/* Name / title / meta */}
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-1">{advisor.name}</h1>

              {advisor.title && (
                <p className="text-brand-gold text-xl font-semibold mb-3">{advisor.title}</p>
              )}

              {(advisor.city || advisor.state) && (
                <div className="flex items-center justify-center md:justify-start gap-1.5 text-gray-300 mb-3">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>{[advisor.city, advisor.state].filter(Boolean).join(', ')}</span>
                </div>
              )}

              {advisor.years_experience != null && (
                <div className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-4 py-1.5 text-sm text-gray-200 mb-4">
                  <Briefcase className="w-4 h-4" />
                  {advisor.years_experience}+ Years of Experience
                </div>
              )}

              {/* Social links */}
              <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
                {advisor.linkedin && (
                  <a
                    href={advisor.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${advisor.name} on LinkedIn`}
                    className="text-gray-300 hover:text-brand-gold transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {advisor.blog_url && (
                  <a
                    href={advisor.blog_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${advisor.name}'s blog`}
                    className="text-gray-300 hover:text-brand-gold transition-colors"
                  >
                    <BookOpen className="w-5 h-5" />
                  </a>
                )}
              </div>

              {/* CTA buttons in hero */}
              {advisor.calendar_embed_code && (
                <div className="mt-5">
                  <a href="#calendar">
                    <Button className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light font-semibold px-6">
                      Schedule a Free Consultation
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

        {/* Credentials */}
        {advisor.credentials && advisor.credentials.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {advisor.credentials.map((cred, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 bg-brand-navy text-white text-sm font-medium px-3 py-1.5 rounded-full"
              >
                <Award className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                {cred}
              </span>
            ))}
          </div>
        )}

        {/* Bio */}
        {advisor.bio && (
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">About {firstName}</h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">{advisor.bio}</p>
          </section>
        )}

        {/* Personal quote */}
        {advisor.personal_quote && (
          <blockquote className="border-l-4 border-brand-gold bg-amber-50 rounded-r-xl pl-6 pr-6 py-5">
            <Quote className="w-6 h-6 text-brand-gold mb-2" />
            <p className="text-lg italic text-slate-800 font-medium">{advisor.personal_quote}</p>
          </blockquote>
        )}

        {/* Specialties */}
        {advisor.specialties && advisor.specialties.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Areas of Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {advisor.specialties.map((spec, i) => (
                <span
                  key={i}
                  className="bg-slate-100 text-slate-700 text-sm px-3 py-1.5 rounded-full border border-slate-200"
                >
                  {spec}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Video */}
        {advisor.video_url && (
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Introduction Video</h2>
            <div className="rounded-xl overflow-hidden aspect-video bg-slate-900 shadow-lg">
              <video
                src={advisor.video_url}
                controls
                poster={advisor.image_url ?? undefined}
                className="w-full h-full object-contain"
              />
            </div>
          </section>
        )}

        {/* Calendar booking */}
        {advisor.calendar_embed_code && (
          <section id="calendar">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Schedule a Free Consultation</h2>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <CalendarEmbed html={advisor.calendar_embed_code} />
            </div>
          </section>
        )}

        {/* Testimonials */}
        {advisor.testimonials && advisor.testimonials.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">What Clients Say</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {advisor.testimonials.map((t, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-6"
                >
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star key={si} className="w-4 h-4 fill-brand-gold text-brand-gold" />
                    ))}
                  </div>
                  <p className="text-slate-700 italic mb-3">&ldquo;{t.quote}&rdquo;</p>
                  <p className="text-sm font-semibold text-slate-900">&mdash; {t.author}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-brand-navy text-white rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to Explore Franchise Opportunities?</h2>
          <p className="text-gray-300 mb-6 max-w-xl mx-auto">
            {firstName} is here to guide you through every step of finding the right franchise fit.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={advisor.created_by ? `/quiz?advisor=${advisor.created_by}` : '/quiz'}>
              <Button
                size="lg"
                className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light font-semibold px-8"
              >
                Take the Free Quiz
              </Button>
            </Link>
            {advisor.linkedin && (
              <a href={advisor.linkedin} target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 px-8"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Connect on LinkedIn
                </Button>
              </a>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
