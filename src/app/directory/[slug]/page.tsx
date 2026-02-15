import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createAdminClient } from '@/lib/supabase/server'
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  TrendingUp,
  CheckCircle,
  Globe,
  Phone,
  Mail,
  Calendar,
  Award,
  FileText,
  ArrowLeft,
  Share2,
  Heart
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

type FranchisePayload = {
  franchise: any
  relatedFranchises: any[]
  canonicalSlug: string
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/&amp;/g, ' and ')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeRequestedSlug(slug: string): string {
  return slugify(decodeURIComponent(slug).replace(/andamp/gi, 'and'))
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)))
}

async function resolveReadableTableName(
  supabase: any,
  preferredTable: string,
  alternatives: string[]
): Promise<string> {
  const firstTry = await supabase.from(preferredTable).select('id').limit(1)
  if (!firstTry.error) return preferredTable

  for (const table of alternatives) {
    const probe = await supabase.from(table).select('id').limit(1)
    if (!probe.error) return table
  }

  return preferredTable
}

async function getFranchise(slug: string): Promise<FranchisePayload | null> {
  const supabase = createAdminClient()
  const franchiseTable = await resolveReadableTableName(supabase, 'franchise', ['franchises'])
  const normalizedSlug = normalizeRequestedSlug(slug)
  const slugCandidates = unique([
    decodeURIComponent(slug).toLowerCase(),
    normalizedSlug,
    decodeURIComponent(slug).toLowerCase().replace(/andamp/g, 'and'),
  ])

  let franchise: any = null
  for (const candidate of slugCandidates) {
    const bySlug = await supabase.from(franchiseTable).select('*').eq('slug', candidate).maybeSingle()
    if (bySlug.data) {
      franchise = bySlug.data
      break
    }
  }

  if (!franchise) {
    const byId = await supabase.from(franchiseTable).select('*').eq('id', slug).maybeSingle()
    if (byId.data) {
      franchise = byId.data
    }
  }

  if (!franchise) {
    const nameLike = normalizedSlug.replace(/-/g, ' ')
    const byName = await supabase
      .from(franchiseTable)
      .select('*')
      .ilike('name', `%${nameLike}%`)
      .limit(10)

    if (byName.data && byName.data.length > 0) {
      const exact = byName.data.find((item: any) => slugify(item.slug || item.name || '') === normalizedSlug)
      franchise = exact || byName.data[0]
    }
  }

  if (!franchise) return null

  const canonicalSlug = franchise.slug || slugify(franchise.name || franchise.id)
  let relatedFranchises: any[] = []
  if (franchise.category) {
    const related = await supabase
      .from(franchiseTable)
      .select('id, name, slug, logo_url, category, initial_investment_min, initial_investment_max')
      .eq('category', franchise.category)
      .neq('id', franchise.id)
      .limit(3)
    relatedFranchises = related.data || []
  }

  return { franchise, relatedFranchises, canonicalSlug }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const data = await getFranchise(params.slug)
  
  if (!data) {
    return { title: 'Franchise Not Found' }
  }

  return {
    title: `${data.franchise.name} Franchise Opportunity`,
    description: data.franchise.description || `Learn about the ${data.franchise.name} franchise opportunity. Investment range: ${formatInvestmentRange(data.franchise.initial_investment_min, data.franchise.initial_investment_max)}`,
  }
}

export default async function FranchiseDetailPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const data = await getFranchise(params.slug)

  if (!data) {
    notFound()
  }

  if (data.canonicalSlug && data.canonicalSlug !== params.slug) {
    redirect(`/directory/${data.canonicalSlug}`)
  }

  const { franchise, relatedFranchises } = data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/directory" className="text-gray-500 hover:text-brand-navy flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Directory
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900">{franchise.name}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Logo */}
            <div className="h-24 w-24 md:h-32 md:w-32 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border">
              {franchise.logo_url ? (
                <Image
                  src={franchise.logo_url}
                  alt={franchise.name}
                  width={128}
                  height={128}
                  className="object-contain"
                />
              ) : (
                <Building2 className="h-12 w-12 text-gray-400" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{franchise.name}</h1>
                    {franchise.is_featured && (
                      <Badge className="bg-brand-gold text-brand-navy">Featured</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="outline">{getCategoryLabel(franchise.category)}</Badge>
                    {franchise.established_year && (
                      <span className="text-sm text-gray-500">
                        Est. {franchise.established_year}
                      </span>
                    )}
                    {franchise.total_locations && (
                      <span className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {franchise.total_locations.toLocaleString()} locations
                      </span>
                    )}
                  </div>
                </div>
                <div className="hidden md:flex gap-2">
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {franchise.description && (
                <p className="mt-4 text-gray-600">{franchise.description}</p>
              )}

              {/* Quick Stats */}
              <div className="mt-6 flex flex-wrap gap-6">
                <div>
                  <p className="text-sm text-gray-500">Investment Range</p>
                  <p className="text-lg font-bold text-brand-navy">
                    {formatInvestmentRange(franchise.initial_investment_min, franchise.initial_investment_max)}
                  </p>
                </div>
                {franchise.franchise_fee && (
                  <div>
                    <p className="text-sm text-gray-500">Franchise Fee</p>
                    <p className="text-lg font-bold text-brand-navy">
                      {formatCurrency(franchise.franchise_fee)}
                    </p>
                  </div>
                )}
                {franchise.royalty_fee_percentage && (
                  <div>
                    <p className="text-sm text-gray-500">Royalty Fee</p>
                    <p className="text-lg font-bold text-brand-navy">
                      {franchise.royalty_fee_percentage}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Full Description */}
            {franchise.full_description && (
              <Card>
                <CardHeader>
                  <CardTitle>About {franchise.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-gray max-w-none">
                    {franchise.full_description}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Financial Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-brand-gold" />
                  Financial Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-gray-600">Initial Investment</span>
                      <span className="font-semibold">
                        {formatInvestmentRange(franchise.initial_investment_min, franchise.initial_investment_max)}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-gray-600">Franchise Fee</span>
                      <span className="font-semibold">
                        {franchise.franchise_fee ? formatCurrency(franchise.franchise_fee) : 'Contact for details'}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-gray-600">Royalty Fee</span>
                      <span className="font-semibold">
                        {franchise.royalty_fee_percentage ? `${franchise.royalty_fee_percentage}%` : 'Varies'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-gray-600">Liquid Capital Required</span>
                      <span className="font-semibold">
                        {franchise.liquid_capital_required ? formatCurrency(franchise.liquid_capital_required) : 'Contact for details'}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-gray-600">Net Worth Required</span>
                      <span className="font-semibold">
                        {franchise.net_worth_required ? formatCurrency(franchise.net_worth_required) : 'Contact for details'}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-gray-600">Marketing Fee</span>
                      <span className="font-semibold">
                        {franchise.marketing_fee_percentage ? `${franchise.marketing_fee_percentage}%` : 'Varies'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-brand-gold" />
                  Business Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-6">
                  {franchise.business_model && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-brand-cream rounded-lg">
                        <Building2 className="h-5 w-5 text-brand-navy" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Business Model</p>
                        <p className="font-medium">{getBusinessModelLabel(franchise.business_model)}</p>
                      </div>
                    </div>
                  )}
                  {franchise.time_commitment && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-brand-cream rounded-lg">
                        <Clock className="h-5 w-5 text-brand-navy" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Time Commitment</p>
                        <p className="font-medium">{getTimeCommitmentLabel(franchise.time_commitment)}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-brand-cream rounded-lg">
                      <Users className="h-5 w-5 text-brand-navy" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Experience Required</p>
                      <p className="font-medium">
                        {franchise.experience_required ? 'Yes' : 'No experience necessary'}
                      </p>
                    </div>
                  </div>
                  {franchise.training_duration_weeks && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-brand-cream rounded-lg">
                        <Calendar className="h-5 w-5 text-brand-navy" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Training Duration</p>
                        <p className="font-medium">{franchise.training_duration_weeks} weeks</p>
                      </div>
                    </div>
                  )}
                  {franchise.support_level && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-brand-cream rounded-lg">
                        <Award className="h-5 w-5 text-brand-navy" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Support Level</p>
                        <p className="font-medium capitalize">{franchise.support_level}</p>
                      </div>
                    </div>
                  )}
                  {franchise.franchisee_satisfaction_score && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-brand-cream rounded-lg">
                        <TrendingUp className="h-5 w-5 text-brand-navy" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Franchisee Satisfaction</p>
                        <p className="font-medium">{franchise.franchisee_satisfaction_score}/5</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Territories */}
            {franchise.territories_available && franchise.territories_available.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-brand-gold" />
                    Available Territories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {franchise.territories_available.map((territory) => (
                      <Badge key={territory} variant="outline">
                        {territory}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* CTA Card */}
            <Card className="border-brand-gold bg-brand-cream sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-brand-navy mb-4">
                  Interested in {franchise.name}?
                </h3>
                <div className="space-y-3">
                  <Button className="w-full bg-brand-navy text-brand-gold hover:bg-brand-navy-light">
                    <Mail className="mr-2 h-4 w-4" />
                    Request Information
                  </Button>
                  {franchise.website_url && (
                    <a href={franchise.website_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full">
                        <Globe className="mr-2 h-4 w-4" />
                        Visit Website
                      </Button>
                    </a>
                  )}
                  {franchise.fdd_url && (
                    <a href={franchise.fdd_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        View FDD
                      </Button>
                    </a>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Free consultation • No obligation
                </p>
              </CardContent>
            </Card>

            {/* Take Quiz CTA */}
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Not sure if this is the right fit?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Take our free quiz to get personalized franchise recommendations
                </p>
                <Link href="/quiz">
                  <Button variant="outline" className="w-full">
                    Take the Quiz
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Related Franchises */}
            {relatedFranchises.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Similar Franchises</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedFranchises.map((related) => (
                    <Link
                      key={related.id}
                      href={`/directory/${related.slug || related.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:border-brand-gold transition-colors"
                    >
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {related.logo_url ? (
                          <Image
                            src={related.logo_url}
                            alt={related.name}
                            width={40}
                            height={40}
                            className="object-contain"
                          />
                        ) : (
                          <Building2 className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {related.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatInvestmentRange(related.initial_investment_min, related.initial_investment_max)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
