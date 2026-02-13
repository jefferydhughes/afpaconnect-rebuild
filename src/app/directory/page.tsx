import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Filter, Building2, MapPin, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatInvestmentRange, getCategoryLabel } from '@/lib/utils'

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'food_beverage', label: 'Food & Beverage' },
  { value: 'home_services', label: 'Home Services' },
  { value: 'health_wellness', label: 'Health & Wellness' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'business_services', label: 'Business Services' },
  { value: 'retail', label: 'Retail' },
  { value: 'childrens_services', label: "Children's Services" },
  { value: 'fitness', label: 'Fitness' },
  { value: 'technology', label: 'Technology' },
  { value: 'senior_care', label: 'Senior Care' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'pet_services', label: 'Pet Services' },
  { value: 'education', label: 'Education' },
  { value: 'beauty', label: 'Beauty & Spa' },
]

const INVESTMENT_RANGES = [
  { value: 'all', label: 'Any Investment' },
  { value: 'under_50k', label: 'Under $50K', min: 0, max: 50000 },
  { value: '50k_100k', label: '$50K - $100K', min: 50000, max: 100000 },
  { value: '100k_250k', label: '$100K - $250K', min: 100000, max: 250000 },
  { value: '250k_500k', label: '$250K - $500K', min: 250000, max: 500000 },
  { value: 'over_500k', label: 'Over $500K', min: 500000, max: 10000000 },
]

async function getFranchises(params: {
  category?: string
  investment?: string
  search?: string
  page?: number
}) {
  const supabase = createClient()
  const pageSize = 12
  const page = params.page || 1
  const offset = (page - 1) * pageSize

  // Query the franchise table - primary key is 'name'
  let query = supabase
    .from('franchise')
    .select('*', { count: 'exact' })
    .order('is_featured', { ascending: false, nullsFirst: false })
    .order('name')
    .range(offset, offset + pageSize - 1)

  // Apply category filter if provided
  if (params.category && params.category !== 'all') {
    query = query.eq('category', params.category)
  }

  // Apply investment filter if provided
  if (params.investment && params.investment !== 'all') {
    const range = INVESTMENT_RANGES.find(r => r.value === params.investment)
    if (range && range.min !== undefined) {
      query = query.lte('initial_investment_min', range.max)
      query = query.gte('initial_investment_max', range.min)
    }
  }

  // Apply search filter if provided
  if (params.search) {
    query = query.ilike('name', `%${params.search}%`)
  }

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching franchises:', error)
    return { franchises: [], total: 0, totalPages: 0 }
  }

  return {
    franchises: data || [],
    total: count || 0,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

function FranchiseCard({ franchise }: { franchise: any }) {
  // Use slug if available, otherwise encode the name (since name is the primary key)
  const linkSlug = franchise.slug || encodeURIComponent(franchise.name)
  
  // Parse total_locations as it's stored as text
  const totalLocations = franchise.total_locations ? parseInt(franchise.total_locations, 10) : null

  return (
    <Link href={`/directory/${linkSlug}`}>
      <Card className="h-full hover:shadow-lg transition-shadow group">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {franchise.logo_url ? (
                <Image
                  src={franchise.logo_url}
                  alt={franchise.name}
                  width={64}
                  height={64}
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <Building2 className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-brand-navy group-hover:text-brand-gold transition-colors truncate">
                  {franchise.name}
                </h3>
                {franchise.is_featured && (
                  <Badge className="bg-brand-gold text-brand-navy flex-shrink-0">
                    Featured
                  </Badge>
                )}
              </div>
              {franchise.category && (
                <Badge variant="outline" className="mt-1">
                  {getCategoryLabel(franchise.category)}
                </Badge>
              )}
            </div>
          </div>

          {franchise.description && (
            <p className="mt-4 text-sm text-gray-600 line-clamp-2">
              {franchise.description}
            </p>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
              <span className="font-medium text-brand-navy">
                {formatInvestmentRange(franchise.initial_investment_min, franchise.initial_investment_max)}
              </span>
            </div>
            {totalLocations && totalLocations > 0 && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                {totalLocations.toLocaleString()} locations
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

async function DirectoryContent({
  searchParams,
}: {
  searchParams: { category?: string; investment?: string; search?: string; page?: string }
}) {
  const { franchises, total, totalPages } = await getFranchises({
    category: searchParams.category,
    investment: searchParams.investment,
    search: searchParams.search,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
  })

  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1

  return (
    <>
      {/* Filters */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                name="search"
                placeholder="Search franchises..."
                defaultValue={searchParams.search}
                className="pl-10"
              />
            </div>

            <select
              name="category"
              defaultValue={searchParams.category || 'all'}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            <select
              name="investment"
              defaultValue={searchParams.investment || 'all'}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {INVESTMENT_RANGES.map((range) => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>

            <Button type="submit">
              <Filter className="h-4 w-4 mr-2" />
              Apply
            </Button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{franchises.length}</span> of{' '}
            <span className="font-semibold">{total}</span> franchises
          </p>
          <Link href="/quiz">
            <Button variant="outline" className="hidden sm:flex">
              Get Personalized Matches
            </Button>
          </Link>
        </div>

        {franchises.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {franchises.map((franchise) => (
              <FranchiseCard key={franchise.name} franchise={franchise} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No franchises found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters.</p>
            <Link href="/directory"><Button variant="outline">Clear Filters</Button></Link>
          </Card>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {currentPage > 1 && (
              <Link 
                href={`/directory?${new URLSearchParams({
                  ...(searchParams.category && { category: searchParams.category }),
                  ...(searchParams.investment && { investment: searchParams.investment }),
                  ...(searchParams.search && { search: searchParams.search }),
                  page: String(currentPage - 1),
                }).toString()}`}
              >
                <Button variant="outline">Previous</Button>
              </Link>
            )}
            <span className="px-4 text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
            {currentPage < totalPages && (
              <Link 
                href={`/directory?${new URLSearchParams({
                  ...(searchParams.category && { category: searchParams.category }),
                  ...(searchParams.investment && { investment: searchParams.investment }),
                  ...(searchParams.search && { search: searchParams.search }),
                  page: String(currentPage + 1),
                }).toString()}`}
              >
                <Button variant="outline">Next</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default function DirectoryPage({
  searchParams,
}: {
  searchParams: { category?: string; investment?: string; search?: string; page?: string }
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold">Franchise Directory</h1>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            Browse 600+ franchise opportunities across all industries.
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy mx-auto" />
            <p className="mt-4 text-gray-600">Loading franchises...</p>
          </div>
        }
      >
        <DirectoryContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
