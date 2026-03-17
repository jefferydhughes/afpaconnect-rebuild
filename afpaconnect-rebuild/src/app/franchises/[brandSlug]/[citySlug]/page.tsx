import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createAdminClient } from '@/lib/supabase/server'
import {
  Building2,
  MapPin,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
  Globe,
  Mail,
  Phone,
  Calendar,
  ArrowLeft,
  BarChart3,
  Home,
  Briefcase,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatInvestmentRange, getCategoryLabel } from '@/lib/utils'

type PageParams = { brandSlug: string; citySlug: string }

// ── Data helpers ─────────────────────────────────────────────────────────────

async function getLocationPageData(brandSlug: string, citySlug: string) {
  const admin = createAdminClient()

  // 1. Location page record (must exist)
  const { data: locationPage } = await admin
    .from('location_pages')
    .select('*')
    .eq('brand_slug', brandSlug)
    .eq('city_slug', citySlug)
    .maybeSingle()

  if (!locationPage) return null

  // 2. Franchise record — try slug match, fall back to name-based search
  const franchiseTable = await (async () => {
    const probe = await admin.from('franchise').select('id').limit(1)
    return probe.error ? 'franchises' : 'franchise'
  })()

  let franchise: any = null
  const bySlug = await admin.from(franchiseTable).select('*').eq('slug', brandSlug).maybeSingle()
  if (bySlug.data) {
    franchise = bySlug.data
  } else {
    const byName = await admin
      .from(franchiseTable)
      .select('*')
      .ilike('name', `%${brandSlug.replace(/-/g, ' ')}%`)
      .limit(5)
    if (byName.data?.length) {
      franchise = byName.data[0]
    }
  }

  // 3. One active advisor for the advisor card
  const { data: advisorData } = await admin
    .from('advisor')
    .select('id, name, title, email, phone, image_url, calendar_embed_code, calendar_url, bio, specialties')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .limit(1)
    .maybeSingle()

  return { locationPage, franchise, advisor: advisorData }
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: PageParams }) {
  const admin = createAdminClient()
  const { data: page } = await admin
    .from('location_pages')
    .select('meta_title, meta_description, brand, city, province')
    .eq('brand_slug', params.brandSlug)
    .eq('city_slug', params.citySlug)
    .maybeSingle()

  if (!page) return { title: 'Franchise Opportunity' }

  const location = [page.city, page.province].filter(Boolean).join(', ')
  const title = page.meta_title || `${page.brand} Franchise Opportunity in ${location}`
  const description =
    page.meta_description ||
    `Explore the ${page.brand} franchise opportunity in ${location}. Learn about investment requirements, local market insights, and how to get started.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

// ── JSON-LD schema ────────────────────────────────────────────────────────────

function buildJsonLd(locationPage: any, franchise: any, siteUrl: string) {
  const location = [locationPage.city, locationPage.province, locationPage.country]
    .filter(Boolean)
    .join(', ')
  const pageUrl = `${siteUrl}/franchises/${locationPage.brand_slug}/${locationPage.city_slug}`

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Franchises', item: `${siteUrl}/franchises` },
      {
        '@type': 'ListItem',
        position: 3,
        name: locationPage.brand,
        item: `${siteUrl}/franchises/${locationPage.brand_slug}`,
      },
      { '@type': 'ListItem', position: 4, name: locationPage.city, item: pageUrl },
    ],
  }

  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `${locationPage.brand} – ${location}`,
    description: locationPage.meta_description || undefined,
    url: franchise?.website_url || undefined,
    image: franchise?.logo_url || undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: locationPage.city,
      addressRegion: locationPage.province || undefined,
      addressCountry: locationPage.country || 'US',
    },
  }

  return [breadcrumb, localBusiness]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function titleCase(slug: string) {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatPopulation(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`
  return n.toLocaleString()
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BrandCityPage({ params }: { params: PageParams }) {
  const result = await getLocationPageData(params.brandSlug, params.citySlug)

  if (!result) notFound()

  const { locationPage: lp, franchise, advisor } = result
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://americanfranchiseprofessionalsalliance.com')

  const locationLabel = [lp.city, lp.province].filter(Boolean).join(', ')
  const localInfo: any = lp.local_info || {}
  const jsonLd = buildJsonLd(lp, franchise, siteUrl)

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* ── Breadcrumb ── */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-brand-navy flex items-center gap-1">
                <Home className="h-3.5 w-3.5" />
                Home
              </Link>
              <span>/</span>
              <Link href="/directory" className="hover:text-brand-navy">
                Franchises
              </Link>
              <span>/</span>
              <Link
                href={`/directory/${params.brandSlug}`}
                className="hover:text-brand-navy"
              >
                {lp.brand}
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{lp.city}</span>
            </nav>
          </div>
        </div>

        {/* ── Hero ── */}
        <div className="bg-brand-navy text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Logo */}
              {franchise?.logo_url && (
                <div className="h-20 w-20 md:h-28 md:w-28 rounded-xl bg-white flex items-center justify-center overflow-hidden flex-shrink-0 p-2">
                  <Image
                    src={franchise.logo_url}
                    alt={lp.brand}
                    width={112}
                    height={112}
                    className="object-contain"
                  />
                </div>
              )}

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge className="bg-brand-gold text-brand-navy text-xs">
                    {lp.market_size ? `${lp.market_size} Market` : 'Franchise Opportunity'}
                  </Badge>
                  {franchise?.category && (
                    <Badge variant="outline" className="border-white/40 text-white text-xs">
                      {getCategoryLabel(franchise.category)}
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {lp.brand} in {locationLabel}
                </h1>

                <p className="text-white/80 text-lg mb-4">
                  Franchise opportunity now available in {lp.city}
                  {lp.province ? `, ${lp.province}` : ''}
                </p>

                <div className="flex flex-wrap gap-6">
                  {franchise && (franchise.initial_investment_min || franchise.initial_investment_max) && (
                    <div>
                      <p className="text-white/60 text-xs uppercase tracking-wide">Investment Range</p>
                      <p className="text-brand-gold font-bold text-lg">
                        {formatInvestmentRange(franchise.initial_investment_min, franchise.initial_investment_max)}
                      </p>
                    </div>
                  )}
                  {lp.population && (
                    <div>
                      <p className="text-white/60 text-xs uppercase tracking-wide">Metro Population</p>
                      <p className="text-white font-bold text-lg">{formatPopulation(lp.population)}</p>
                    </div>
                  )}
                  {franchise?.total_locations && (
                    <div>
                      <p className="text-white/60 text-xs uppercase tracking-wide">Locations</p>
                      <p className="text-white font-bold text-lg">
                        {franchise.total_locations.toLocaleString()}+
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* ── Main column ── */}
            <div className="lg:col-span-2 space-y-8">

              {/* Brand overview */}
              {franchise && (franchise.description || franchise.full_description) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-brand-gold" />
                      About {lp.brand}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-gray max-w-none text-gray-700 leading-relaxed">
                    {franchise.full_description || franchise.description}
                  </CardContent>
                </Card>
              )}

              {/* Why this city — AI content */}
              {lp.ai_generated_content && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-brand-gold" />
                      Why {lp.city}?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                    {lp.ai_generated_content}
                  </CardContent>
                </Card>
              )}

              {/* Local market insights */}
              {(lp.population || localInfo.demographics || localInfo.economy || localInfo.median_income) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-brand-gold" />
                      Local Market Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {lp.population && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                          <Users className="h-5 w-5 text-brand-navy mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Population</p>
                            <p className="font-semibold text-gray-900">{lp.population.toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                      {lp.market_size && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                          <TrendingUp className="h-5 w-5 text-brand-navy mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Market Size</p>
                            <p className="font-semibold text-gray-900">{lp.market_size}</p>
                          </div>
                        </div>
                      )}
                      {localInfo.median_income && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                          <DollarSign className="h-5 w-5 text-brand-navy mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Median Income</p>
                            <p className="font-semibold text-gray-900">{localInfo.median_income}</p>
                          </div>
                        </div>
                      )}
                      {localInfo.households && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                          <Home className="h-5 w-5 text-brand-navy mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Households</p>
                            <p className="font-semibold text-gray-900">{localInfo.households}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Detailed local info */}
                    <div className="mt-4 space-y-3">
                      {localInfo.demographics && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Demographics</p>
                          <p className="text-sm text-gray-700">{localInfo.demographics}</p>
                        </div>
                      )}
                      {localInfo.economy && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Economy</p>
                          <p className="text-sm text-gray-700">{localInfo.economy}</p>
                        </div>
                      )}
                      {localInfo.key_industries && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Key Industries</p>
                          <p className="text-sm text-gray-700">{localInfo.key_industries}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Unique selling points */}
              {lp.unique_selling_points && lp.unique_selling_points.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-brand-gold" />
                      Why This Opportunity Stands Out
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {lp.unique_selling_points.map((point: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Investment details */}
              {franchise && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-brand-gold" />
                      Financial Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x">
                      <div className="space-y-0 pr-0 sm:pr-6">
                        {[
                          ['Initial Investment', formatInvestmentRange(franchise.initial_investment_min, franchise.initial_investment_max)],
                          ['Franchise Fee', franchise.franchise_fee ? formatCurrency(franchise.franchise_fee) : 'Contact for details'],
                          ['Royalty Fee', franchise.royalty_fee_percentage ? `${franchise.royalty_fee_percentage}%` : 'Varies'],
                        ].map(([label, value]) => (
                          <div key={label} className="flex justify-between py-3 border-b last:border-b-0">
                            <span className="text-gray-600 text-sm">{label}</span>
                            <span className="font-semibold text-sm">{value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-0 pl-0 sm:pl-6">
                        {[
                          ['Liquid Capital', franchise.liquid_capital_required ? formatCurrency(franchise.liquid_capital_required) : 'Contact for details'],
                          ['Net Worth', franchise.net_worth_required ? formatCurrency(franchise.net_worth_required) : 'Contact for details'],
                          ['Marketing Fee', franchise.marketing_fee_percentage ? `${franchise.marketing_fee_percentage}%` : 'Varies'],
                        ].map(([label, value]) => (
                          <div key={label} className="flex justify-between py-3 border-b last:border-b-0">
                            <span className="text-gray-600 text-sm">{label}</span>
                            <span className="font-semibold text-sm">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Advisor card */}
              {advisor && (
                <Card className="border-brand-gold/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-brand-gold" />
                      Your Franchise Advisor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Headshot */}
                      <div className="flex-shrink-0">
                        {advisor.image_url ? (
                          <Image
                            src={advisor.image_url}
                            alt={advisor.name || 'Advisor'}
                            width={96}
                            height={96}
                            className="rounded-full object-cover h-24 w-24"
                          />
                        ) : (
                          <div className="h-24 w-24 rounded-full bg-brand-navy flex items-center justify-center">
                            <span className="text-brand-gold text-2xl font-bold">
                              {(advisor.name || 'A').charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{advisor.name}</h3>
                        {advisor.title && (
                          <p className="text-brand-navy font-medium text-sm">{advisor.title}</p>
                        )}
                        {advisor.bio && (
                          <p className="mt-2 text-sm text-gray-600 line-clamp-3">{advisor.bio}</p>
                        )}
                        {advisor.specialties && advisor.specialties.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {advisor.specialties.slice(0, 4).map((s: string) => (
                              <Badge key={s} variant="outline" className="text-xs">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Contact row */}
                        <div className="mt-4 flex flex-wrap gap-3">
                          {advisor.email && (
                            <a href={`mailto:${advisor.email}`}>
                              <Button size="sm" variant="outline">
                                <Mail className="h-4 w-4 mr-1.5" />
                                Email
                              </Button>
                            </a>
                          )}
                          {advisor.phone && (
                            <a href={`tel:${advisor.phone}`}>
                              <Button size="sm" variant="outline">
                                <Phone className="h-4 w-4 mr-1.5" />
                                Call
                              </Button>
                            </a>
                          )}
                          {advisor.calendar_url && !advisor.calendar_embed_code && (
                            <a href={advisor.calendar_url} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" className="bg-brand-navy text-brand-gold hover:bg-brand-navy/90">
                                <Calendar className="h-4 w-4 mr-1.5" />
                                Schedule Call
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Calendar embed */}
                    {advisor.calendar_embed_code && (
                      <div
                        className="mt-6 rounded-lg overflow-hidden border"
                        dangerouslySetInnerHTML={{ __html: advisor.calendar_embed_code }}
                      />
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* ── Sidebar ── */}
            <div className="space-y-6">
              {/* Sticky CTA */}
              <Card className="border-brand-gold bg-brand-cream sticky top-24">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-brand-navy mb-1">
                    Interested in {lp.brand}?
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Opportunities available in {locationLabel}. Get details from a franchise advisor today.
                  </p>

                  <div className="space-y-3">
                    <Link href={`/contact?brand=${params.brandSlug}&city=${params.citySlug}`}>
                      <Button className="w-full bg-brand-navy text-brand-gold hover:bg-brand-navy/90">
                        <Mail className="mr-2 h-4 w-4" />
                        Request Information
                      </Button>
                    </Link>
                    {franchise?.website_url && (
                      <a href={franchise.website_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full">
                          <Globe className="mr-2 h-4 w-4" />
                          Visit Website
                        </Button>
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-4 text-center">
                    Free consultation &bull; No obligation
                  </p>
                </CardContent>
              </Card>

              {/* Quiz CTA */}
              <Card>
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Not sure if this is the right fit?
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Take our free quiz to find your ideal franchise match.
                  </p>
                  <Link href="/quiz">
                    <Button variant="outline" className="w-full">
                      Take the Free Quiz
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Back link */}
              <Link
                href={`/directory/${params.brandSlug}`}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-navy transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                View full {lp.brand} listing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
