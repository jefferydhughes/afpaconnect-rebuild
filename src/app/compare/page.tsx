'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Check, AlertTriangle, Loader2, Info, Building2, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { formatInvestmentRange, getCategoryLabel, getBusinessModelLabel } from '@/lib/utils'

const comparisonFields = [
  { key: "initial_investment", label: "Investment", type: "currency_range" },
  { key: "category", label: "Category", type: "text" },
  { key: "business_model", label: "Business Model", type: "text" },
  { key: "franchise_fee", label: "Franchise Fee", type: "currency" },
  { key: "royalty_fee_percentage", label: "Royalty Fee", type: "percentage" },
  { key: "marketing_fee_percentage", label: "Marketing Fee", type: "percentage" },
  { key: "training_duration_weeks", label: "Training", type: "weeks" },
  { key: "territories_available", label: "Available Territories", type: "array" },
  { key: "total_locations", label: "Total Locations", type: "number" },
];

function CompareContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [franchisesToCompare, setFranchisesToCompare] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeMobileFranchise, setActiveMobileFranchise] = useState<any>(null)
  const [sortBy, setSortBy] = useState('name_asc')

  const idsParam = searchParams.get('ids') || ''
  const ids = idsParam.split(',').map(id => id.replace(/\+/g, ' ').trim()).filter(Boolean)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      
      if (ids.length > 0) {
        const { data, error } = await supabase
          .from('franchise')
          .select('*')
          .in('name', ids)
        
        if (data) {
          setFranchisesToCompare(data)
          if (data.length > 0) {
            setActiveMobileFranchise(data[0])
          }
        }
      }
      
      setIsLoading(false)
    }

    fetchData()
  }, [ids.join(',')])

  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number') return "N/A";
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const sortedFranchises = useMemo(() => {
    if (!franchisesToCompare.length) return [];

    const sorted = [...franchisesToCompare]
    
    switch (sortBy) {
      case 'investment_asc':
        return sorted.sort((a, b) => (a.initial_investment_min || 0) - (b.initial_investment_min || 0))
      case 'investment_desc':
        return sorted.sort((a, b) => (b.initial_investment_max || 0) - (a.initial_investment_max || 0))
      case 'name_asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      default:
        return sorted
    }
  }, [franchisesToCompare, sortBy])

  useEffect(() => {
    if (sortedFranchises.length > 0 && !activeMobileFranchise) {
      setActiveMobileFranchise(sortedFranchises[0])
    }
  }, [sortedFranchises])

  const renderFieldValue = (franchise: any, field: any) => {
    const value = franchise[field.key]
    switch (field.type) {
      case "currency_range": return `${formatCurrency(franchise.initial_investment_min)} - ${formatCurrency(franchise.initial_investment_max)}`
      case "currency": return value ? formatCurrency(Number(value)) : "N/A"
      case "percentage": return value ? `${value}%` : "N/A"
      case "weeks": return value ? `${value} weeks` : "N/A"
      case "array": return Array.isArray(value) ? value.join(', ') : "N/A"
      case "text": return value ? value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "N/A"
      case "number": return value ? Number(value).toLocaleString() : "N/A"
      default: return value || "N/A"
    }
  }

  const truncateName = (name: string, maxLength = 20) => {
    if (!name) return ''
    return name.length > maxLength ? name.substring(0, maxLength) + '…' : name
  }

  const scrollToFranchise = (direction: 'left' | 'right') => {
    if (!activeMobileFranchise) return
    const currentIndex = sortedFranchises.findIndex(f => f.name === activeMobileFranchise.name)
    let newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0) newIndex = 0
    if (newIndex >= sortedFranchises.length) newIndex = sortedFranchises.length - 1
    setActiveMobileFranchise(sortedFranchises[newIndex])
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-brand-navy animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Franchise Comparison
          </h1>
          <p className="text-white/90 mb-6">
            Compare franchises side-by-side to find the best fit for your goals.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="sort-by" className="text-sm font-medium text-white">Rank By:</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort-by" className="w-[200px] bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select ranking" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="investment_asc">Lowest Investment</SelectItem>
                  <SelectItem value="investment_desc">Highest Investment</SelectItem>
                  <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button asChild className="bg-white text-brand-navy hover:bg-gray-100">
              <Link href="/directory">
                Continue Looking
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sortedFranchises.length === 0 ? (
          <Card className="text-center p-12 bg-white border-0 shadow-lg">
            <Info className="w-12 h-12 text-brand-gold mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Franchises Selected</h2>
            <p className="text-gray-600 mb-6">Please select up to 3 franchises from the directory to compare.</p>
            <Button asChild className="bg-brand-navy text-brand-gold hover:bg-brand-navy-light">
                <Link href="/directory">Go to Directory</Link>
            </Button>
          </Card>
        ) : (
          <Card className="overflow-hidden shadow-lg border-0 bg-white">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-4 font-semibold text-gray-900 min-w-48">Criteria</th>
                        {sortedFranchises.map((franchise) => (
                          <th key={franchise.name} className="text-center p-4 font-semibold text-gray-900 min-w-64 border-l border-gray-200">
                            <div className="flex flex-col items-center space-y-2">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-200">
                                {franchise.logo_url ? (
                                  <Image 
                                    src={franchise.logo_url} 
                                    alt={`${franchise.name} logo`} 
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-contain" 
                                    unoptimized
                                  />
                                ) : (
                                  <Building2 className="w-5 h-5 text-gray-400"/>
                                )}
                              </div>
                              <div className="font-bold text-base text-gray-900">{franchise.name}</div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonFields.map((field, index) => (
                        <tr key={field.key} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="p-4 font-medium text-gray-700 border-r border-gray-200">
                            {field.label}
                          </td>
                          {sortedFranchises.map((franchise) => (
                            <td key={franchise.name} className="p-4 text-center border-l border-gray-200">
                              <div className="flex items-center justify-center gap-2">
                                <span className="font-medium text-gray-900">
                                  {renderFieldValue(franchise, field)}
                                </span>
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden">
              <div className="relative">
                {sortedFranchises.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 hover:bg-white rounded-full h-8 w-8 shadow-md"
                      onClick={() => scrollToFranchise('left')}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 hover:bg-white rounded-full h-8 w-8 shadow-md"
                      onClick={() => scrollToFranchise('right')}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </>
                )}
                <div className="flex overflow-x-auto border-b border-gray-200 bg-gray-50" style={{ scrollbarWidth: 'none' }}>
                  {sortedFranchises.map((f) => (
                    <button
                      key={f.name}
                      onClick={() => setActiveMobileFranchise(f)}
                      className={`flex-shrink-0 p-4 text-sm font-semibold text-center transition-colors whitespace-nowrap min-w-[140px] max-w-[180px] ${
                        activeMobileFranchise?.name === f.name
                          ? 'bg-white text-brand-navy border-b-2 border-brand-navy'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                      title={f.name}
                    >
                      {truncateName(f.name)}
                    </button>
                  ))}
                </div>
              </div>

                            {activeMobileFranchise && (
                <div className="p-4">
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-0 pb-6">
                      <div className="w-20 h-20 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {activeMobileFranchise.logo_url ? (
                          <Image 
                            src={activeMobileFranchise.logo_url} 
                            alt={`${activeMobileFranchise.name} logo`} 
                            width={80}
                            height={80}
                            className="w-full h-full object-contain p-1" 
                            unoptimized
                          /> 
                        ) : (
                          <Building2 className="w-10 h-10 text-gray-400"/>
                        )}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{activeMobileFranchise.name}</h2>
                        <Badge variant="outline" className="mt-1">
                          {getCategoryLabel(activeMobileFranchise.category)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 space-y-3">
                      {comparisonFields.map((field) => (
                        <div key={field.key} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <h4 className="text-sm font-semibold text-gray-500 mb-2">{field.label}</h4>
                          <div className="flex justify-between items-center text-md">
                            <span className="font-semibold text-gray-900">
                              {renderFieldValue(activeMobileFranchise, field)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                    <div className="pt-6 space-y-3">
                      {activeMobileFranchise.website_url && (
                        <Button asChild size="lg" className="w-full bg-brand-navy text-brand-gold hover:bg-brand-navy-light">
                          <a href={activeMobileFranchise.website_url} target="_blank" rel="noopener noreferrer">
                            Visit Website <ArrowRight className="w-4 h-4 ml-2" />
                          </a>
                        </Button>
                      )}
                      <Button asChild size="lg" className="w-full bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                        <Link href="/directory">Continue Looking</Link>
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-brand-navy animate-spin" />
      </div>
    }>
      <CompareContent />
    </Suspense>
  )
}
