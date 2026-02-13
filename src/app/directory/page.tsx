'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Search, Filter, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import FranchiseCard from '@/components/directory/FranchiseCard'
import RequestInfoModal from '@/components/directory/RequestInfoModal'
import FloatingCompareButton from '@/components/directory/FloatingCompareButton'

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

const pageSize = 12

async function getFranchises(params: {
  category?: string
  investment?: string
  search?: string
  page?: number
}) {
  const supabase = createClient()
  const page = params.page || 1
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('franchise')
    .select('*', { count: 'exact' })
    .order('is_featured', { ascending: false, nullsFirst: false })
    .order('name')
    .range(offset, offset + pageSize - 1)

  if (params.category && params.category !== 'all') {
    query = query.eq('category', params.category)
  }

  if (params.investment && params.investment !== 'all') {
    const range = INVESTMENT_RANGES.find(r => r.value === params.investment)
    if (range && range.min !== undefined) {
      query = query.lte('initial_investment_min', range.max)
      query = query.gte('initial_investment_max', range.min)
    }
  }

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

function DirectoryContent({
  searchParams,
}: {
  searchParams: { category?: string; investment?: string; search?: string; page?: string }
}) {
  const [compareList, setCompareList] = useState<any[]>([])
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [selectedFranchise, setSelectedFranchise] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [franchises, setFranchises] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filters, setFilters] = useState({
    category: searchParams.category || 'all',
    investment: searchParams.investment || 'all',
    search: searchParams.search || '',
    page: searchParams.page ? parseInt(searchParams.page) : 1,
  })

  const fetchFranchises = async () => {
    setIsLoading(true)
    const result = await getFranchises(filters)
    setFranchises(result.franchises)
    setTotal(result.total)
    setTotalPages(result.totalPages)
    setIsLoading(false)
  }

  useState(() => {
    fetchFranchises()
  })

  const handleAddToCompare = (franchise: any) => {
    setCompareList(prev => {
      const isAlreadyAdded = prev.some(f => f.name === franchise.name)
      if (isAlreadyAdded) {
        return prev.filter(f => f.name !== franchise.name)
      }
      if (prev.length >= 3) {
        return prev
      }
      return [...prev, franchise]
    })
  }

  const handleRemoveFromCompare = (franchise: any) => {
    setCompareList(prev => prev.filter(f => f.name !== franchise.name))
  }

  const handleOpenRequestModal = (franchise: any) => {
    setSelectedFranchise(franchise)
    setRequestModalOpen(true)
  }

  const isInCompare = (franchiseName: string) => {
    return compareList.some(f => f.name === franchiseName)
  }

  const currentPage = filters.page

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
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>

            <select
              name="category"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            <select
              name="investment"
              value={filters.investment}
              onChange={(e) => setFilters({ ...filters, investment: e.target.value })}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {INVESTMENT_RANGES.map((range) => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>

            <Button type="submit" onClick={(e) => { e.preventDefault(); fetchFranchises() }}>
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

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy" />
          </div>
        ) : franchises.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {franchises.map((franchise) => (
              <FranchiseCard 
                key={franchise.name} 
                franchise={franchise} 
                onAddToCompare={handleAddToCompare}
                isInCompare={isInCompare(franchise.name)}
                onOpenRequestModal={handleOpenRequestModal}
              />
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
                  ...(filters.category && filters.category !== 'all' && { category: filters.category }),
                  ...(filters.investment && filters.investment !== 'all' && { investment: filters.investment }),
                  ...(filters.search && { search: filters.search }),
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
                  ...(filters.category && filters.category !== 'all' && { category: filters.category }),
                  ...(filters.investment && filters.investment !== 'all' && { investment: filters.investment }),
                  ...(filters.search && { search: filters.search }),
                  page: String(currentPage + 1),
                }).toString()}`}
              >
                <Button variant="outline">Next</Button>
              </Link>
            )}
          </div>
        )}
      </div>

      <FloatingCompareButton 
        compareList={compareList} 
        onRemoveFromCompare={handleRemoveFromCompare} 
      />

      <RequestInfoModal
        isOpen={requestModalOpen}
        onOpenChange={setRequestModalOpen}
        franchise={selectedFranchise}
      />
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
