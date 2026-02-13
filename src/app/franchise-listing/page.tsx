'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  TrendingUp,
  Globe,
  Mail,
  Calendar,
  Award,
  FileText,
  ArrowLeft,
  Share2,
  Heart,
  Star,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  formatCurrency, 
  formatInvestmentRange, 
  getCategoryLabel,
  getBusinessModelLabel,
  getTimeCommitmentLabel 
} from '@/lib/utils'
import RequestInfoModal from '@/components/directory/RequestInfoModal'

function slugify(name: string) {
  if (!name) return "";
  return name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function safeNumber(val: unknown): number | null {
  if (val === null || val === undefined) return null
  if (typeof val === 'number' && Number.isFinite(val)) return val

  const cleaned = String(val).replace(/[^0-9.]/g, '')
  if (!cleaned) return null

  const num = parseFloat(cleaned)
  return Number.isNaN(num) ? null : num
}

function parseJsonObject(value: unknown): Record<string, unknown> {
  if (!value) return {}
  if (typeof value === 'object') return value as Record<string, unknown>
  if (typeof value !== 'string') return {}

  try {
    const parsed = JSON.parse(value)
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

function resolveFinancials(brand: any) {
  const parsedFdd = parseJsonObject(brand?.parsed_fdd)
  const fddData = parseJsonObject(brand?.fdd_data)
  const parsed = Object.keys(parsedFdd).length ? parsedFdd : fddData

  return {
    investment_min:
      safeNumber(brand?.initial_investment_min) ??
      safeNumber(parsed.initial_investment_min),
    investment_max:
      safeNumber(brand?.initial_investment_max) ??
      safeNumber(parsed.initial_investment_max),
    franchise_fee:
      safeNumber(brand?.franchise_fee) ??
      safeNumber(parsed.franchise_fee),
    royalty:
      safeNumber(brand?.royalty_fee_percentage) ??
      safeNumber(parsed.royalty_fee_percentage),
    brand_fund:
      safeNumber(brand?.marketing_fee_percentage) ??
      safeNumber(parsed.marketing_fee_percentage),
    net_worth:
      safeNumber(brand?.net_worth_required) ??
      safeNumber(parsed.net_worth_required),
  }
}

async function getFranchiseByParams(params: { slug?: string; name?: string; id?: string }) {
  const supabase = createClient()
  
  let franchise = null

  if (params.id) {
    const { data } = await supabase
      .from('franchise')
      .select('*')
      .eq('id', params.id)
      .single()
    if (data) franchise = data
  }

  if (!franchise && params.slug) {
    const searchSlug = params.slug.trim().toLowerCase()
    
    const { data: allData } = await supabase.from('franchise').select('*')
    const all = allData || []
    
    franchise = all.find((f) => {
      const fSlug = f.slug || slugify(f.name)
      return fSlug === searchSlug
    })

    if (!franchise) {
      const searchTerms = searchSlug.replace(/-/g, ' ').trim()
      franchise = all.find((f) => f.name?.toLowerCase() === searchTerms)
    }

    if (!franchise) {
      const searchTerms = searchSlug.replace(/-/g, ' ').trim()
      franchise = all.find(
        (f) => f.name?.toLowerCase().includes(searchTerms) || searchTerms.includes(f.name?.toLowerCase())
      )
    }
  }

  if (!franchise && params.name) {
    const searchName = params.name.trim().toLowerCase().replace(/-/g, ' ')
    
    const { data: allData } = await supabase.from('franchise').select('*')
    const all = allData || []
    
    franchise = all.find((f) => f.name?.toLowerCase() === searchName)
  }

  return franchise
}

function FranchiseListingContent() {
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [brand, setBrand] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [requestModalOpen, setRequestModalOpen] = useState(false)

  const slugParam = searchParams.get("slug")
  const nameParam = searchParams.get("name")
  const idParam = searchParams.get("id")

  useEffect(() => {
    async function loadBrand() {
      setLoading(true)
      setErrorMsg("")

      try {
        const match = await getFranchiseByParams({ 
          slug: slugParam, 
          name: nameParam, 
          id: idParam 
        })

        if (!match) {
          setBrand(null)
          setErrorMsg("Brand not found.")
        } else {
          setBrand(match)
        }
      } catch (err) {
        console.error("Error loading brand:", err)
        setErrorMsg("There was a problem loading this brand.")
        setBrand(null)
      }

      setLoading(false)
    }

    loadBrand()
  }, [slugParam, nameParam, idParam])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy" />
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Brand Not Found</h2>
            <p className="text-gray-600 mb-4">{errorMsg}</p>
            <Link href="/directory">
              <Button>Browse Franchise Directory</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const {
    name,
    logo_url,
    category,
    description,
    full_description,
    established_year,
    total_locations,
    business_model,
    time_commitment,
    training_duration_weeks,
    support_level,
    franchisee_satisfaction_score,
    website_url,
    fdd_url,
    territories_available,
    experience_required
  } = brand

  const totalLocations = total_locations ? parseInt(String(total_locations), 10) : null

  const formatMoney = (v: number | null | undefined) => typeof v === 'number' ? `$${v.toLocaleString()}` : '-'
  const formatPercent = (v: number | null | undefined) => typeof v === 'number' ? `${v}%` : '-'

  const financials = resolveFinancials(brand)
  const hasFinancials = Object.values(financials).some((v) => v !== null)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <nav className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <ol className="flex items-center text-sm text-gray-600 overflow-x-auto whitespace-nowrap">
            <li>
              <Link href="/directory" className="hover:text-brand-navy transition-colors flex items-center">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Franchises
              </Link>
            </li>
            {category && (
              <>
                <li className="mx-2 text-gray-400">/</li>
                <li>
                  <Link href={`/directory?category=${encodeURIComponent(category)}`} className="hover:text-brand-navy transition-colors">
                    {getCategoryLabel(category)}
                  </Link>
                </li>
              </>
            )}
            <li className="mx-2 text-gray-400">/</li>
            <li className="font-medium text-gray-900 truncate">{name}</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative mb-6 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #0A3540 0%, #2E6A7C 50%, #3D5A9F 100%)' }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-6 pt-6 lg:flex-row lg:items-center lg:gap-8 lg:pb-8 lg:pt-7">
          <div className="flex flex-1 flex-col gap-3 lg:max-w-[680px]">
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-2 pr-4 backdrop-blur border border-white/10 w-fit">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
                {logo_url ? (
                  <Image src={logo_url} alt={name} width={48} height={48} className="h-full w-full object-contain p-1.5" unoptimized />
                ) : (
                  <span className="text-xs font-semibold text-slate-500">{name?.[0] || "F"}</span>
                )}
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-white lg:text-2xl">{name}</h1>
            </div>

            {category && (
              <span className="inline-flex w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
                {getCategoryLabel(category)}
              </span>
            )}

            <p className="max-w-xl text-sm leading-relaxed text-white/80 lg:text-base">
              {description || "Explore investment, financials, and fit score insights to see if this franchise matches your goals."}
            </p>

            <div className="mt-2 flex flex-wrap gap-3">
              <Button onClick={() => setRequestModalOpen(true)} className="rounded-full bg-white text-slate-900 hover:bg-gray-100">
                Request Information
              </Button>
              <Button variant="outline" className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20">
                Book a Call
              </Button>
            </div>
          </div>

          {/* Hero financial summary card - Desktop Only */}
          <div className="hidden lg:flex flex-col gap-3 bg-slate-900/80 backdrop-blur rounded-2xl p-5 text-sm text-slate-100 shadow-2xl border border-white/10 w-[360px] shrink-0">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-teal-200">At a Glance</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">Investment Range</p>
                <p className="mt-1 text-sm font-semibold">{formatMoney(financials.investment_min)} - {formatMoney(financials.investment_max)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">Franchise Fee</p>
                <p className="mt-1 text-sm font-semibold">{formatMoney(financials.franchise_fee)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">Royalty</p>
                <p className="mt-1 text-sm font-semibold">{formatPercent(financials.royalty)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">Brand Fund</p>
                <p className="mt-1 text-sm font-semibold">{formatPercent(financials.brand_fund)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Page Body */}
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 lg:flex-row lg:gap-8">
        {/* Main Column */}
        <main className="flex-1 space-y-8">
          {/* Overview */}
          <section id="overview">
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-2">Brand Overview</h2>
              <p className="mt-1 text-sm text-gray-500">
                Learn how this franchise operates, who they serve, and what makes their model unique.
              </p>

              <div className="mt-4 space-y-4 text-sm text-gray-700">
                <p className="whitespace-pre-line">
                  {full_description || description || "This profile is based on the most recent franchise disclosure filing."}
                </p>
              </div>

              <div className="mt-5 grid gap-3 text-sm text-gray-700 md:grid-cols-3">
                {established_year && (
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Founded</p>
                    <p className="mt-1 text-base font-semibold text-gray-900">{established_year}</p>
                  </div>
                )}
                {totalLocations && (
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Locations</p>
                    <p className="mt-1 text-base font-semibold text-gray-900">{totalLocations.toLocaleString()} total units</p>
                  </div>
                )}
                {business_model && (
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Business Model</p>
                    <p className="mt-1 text-base font-semibold text-gray-900">{getBusinessModelLabel(business_model)}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Financials */}
          <section id="financials">
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-2">Investment & Financials</h2>
              <p className="mt-1 text-sm text-gray-500">
                Understand the capital requirements and ongoing fees to launch and operate this franchise.
              </p>

              {hasFinancials ? (
                <div className="mt-5 grid gap-5 lg:grid-cols-[1.7fr_1.3fr]">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Expected Investment Range</p>
                    <p className="mt-1 text-sm text-gray-600">
                      Plan for total startup costs between <span className="font-semibold">{formatMoney(financials.investment_min)} - {formatMoney(financials.investment_max)}</span>.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-xl bg-gray-50 p-4 text-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Key Fees</p>
                      <dl className="mt-2 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <dt className="text-gray-600">Franchise Fee</dt>
                          <dd className="font-semibold text-gray-900">{formatMoney(financials.franchise_fee)}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <dt className="text-gray-600">Royalty</dt>
                          <dd className="font-semibold text-gray-900">{formatPercent(financials.royalty)}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <dt className="text-gray-600">Brand Fund</dt>
                          <dd className="font-semibold text-gray-900">{formatPercent(financials.brand_fund)}</dd>
                        </div>
                        {financials.net_worth !== null && (
                          <div className="flex items-center justify-between gap-2">
                            <dt className="text-gray-600">Net Worth Required</dt>
                            <dd className="font-semibold text-gray-900">{formatMoney(financials.net_worth)}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">
                  Detailed financials are not yet available for this brand.
                </p>
              )}
            </div>
          </section>

          {/* Business Details */}
          <section id="details">
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-2">Business Details</h2>
              
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {business_model && (
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Business Model</p>
                    <p className="mt-2 text-gray-900">{getBusinessModelLabel(business_model)}</p>
                  </div>
                )}
                {time_commitment && (
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Time Commitment</p>
                    <p className="mt-2 text-gray-900">{getTimeCommitmentLabel(time_commitment)}</p>
                  </div>
                )}
                {training_duration_weeks && (
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Training Duration</p>
                    <p className="mt-2 text-gray-900">{training_duration_weeks} weeks</p>
                  </div>
                )}
                {support_level && (
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Support Level</p>
                    <p className="mt-2 text-gray-900 capitalize">{support_level}</p>
                  </div>
                )}
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Experience Required</p>
                  <p className="mt-2 text-gray-900">{experience_required ? 'Yes' : 'No experience necessary'}</p>
                </div>
                {franchisee_satisfaction_score && (
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Franchisee Satisfaction</p>
                    <p className="mt-2 text-gray-900 flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      {franchisee_satisfaction_score}/5
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>

        {/* Sticky Sidebar */}
        <aside className="mt-2 w-full max-w-md shrink-0 lg:mt-0 lg:w-80 lg:sticky lg:top-24">
          <div className="space-y-4">
            {/* CTA Card */}
            <div className="rounded-2xl bg-brand-navy p-6 text-white shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Interested in {name}?</h2>
              <div className="space-y-3">
                <Button onClick={() => setRequestModalOpen(true)} className="w-full bg-brand-gold text-brand-navy hover:bg-brand-gold/90">
                  <Mail className="mr-2 h-4 w-4" />
                  Request Information
                </Button>
                {website_url && (
                  <a href={website_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">
                      <Globe className="mr-2 h-4 w-4" />
                      Visit Website
                    </Button>
                  </a>
                )}
                {fdd_url && (
                  <a href={fdd_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">
                      <FileText className="mr-2 h-4 w-4" />
                      View FDD
                    </Button>
                  </a>
                )}
              </div>
              <p className="text-xs text-gray-300 mt-4 text-center">Free consultation - No obligation</p>
            </div>

            {/* Documents */}
            <div className="rounded-2xl bg-white p-5 text-sm text-gray-800 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">Documents & Disclosures</h3>
              <p className="mt-1 text-xs text-gray-500">Always review the current Franchise Disclosure Document (FDD) with your advisor before making decisions.</p>
              <div className="mt-3 space-y-2">
                {fdd_url && (
                  <a href={fdd_url} target="_blank" rel="noreferrer" className="block w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-center text-xs font-medium text-gray-700 hover:border-brand-gold hover:text-brand-navy">
                    Download FDD (PDF)
                  </a>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <RequestInfoModal
        isOpen={requestModalOpen}
        onOpenChange={setRequestModalOpen}
        franchise={brand}
      />
    </div>
  )
}

export default function FranchiseListingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy" />
      </div>
    }>
      <FranchiseListingContent />
    </Suspense>
  )
}
