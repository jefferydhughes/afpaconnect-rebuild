'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Plus, Check, MapPin, Calendar, ChevronDown, ChevronUp, Flag, Building2 } from 'lucide-react'
import { formatInvestmentRange, getCategoryLabel } from '@/lib/utils'

interface FranchiseCardProps {
  franchise: any
  onAddToCompare?: (franchise: any) => void
  isInCompare?: boolean
  onAddToRequests?: (franchise: any) => void
  isInRequests?: boolean
  onOpenRequestModal?: (franchise: any) => void
}

export default function FranchiseCard({ 
  franchise, 
  onAddToCompare, 
  isInCompare = false,
  onAddToRequests,
  isInRequests = false,
  onOpenRequestModal
}: FranchiseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!franchise) {
    return null
  }

  const {
    name, 
    logo_url, 
    category, 
    initial_investment_min, 
    initial_investment_max,
    description, 
    full_description, 
    established_year, 
    usa_locations, 
    total_locations, 
    canadian_locations,
    is_featured
  } = franchise

  const slugName = name.toLowerCase().replace(/\s+/g, '-')
  const detailHref = `/directory/${franchise.slug || franchise.id || slugName}`

  const isPremiumListing = is_featured

  const getDisplayDescription = () => {
    let textToShow = description
    
    if (!description && full_description) {
      textToShow = full_description.substring(0, 160)
    }
    
    if (!textToShow) return null
    
    if (isExpanded) {
      return full_description || textToShow
    } else {
      return textToShow.length > 160 ? textToShow.substring(0, 160) + '...' : textToShow
    }
  }

  const displayDescription = getDisplayDescription()
  const shouldShowToggle = (full_description && full_description.length > 160) || 
                          (description && description.length > 160) ||
                          (!description && full_description && full_description.length > 160)

  return (
    <Card className={`h-full flex flex-col hover:shadow-lg transition-all ${isPremiumListing ? 'border-brand-gold featured' : ''}`}>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg p-2 flex items-center justify-center border border-gray-200">
            {logo_url ? (
              <Image 
                src={logo_url} 
                alt={`${name} logo`} 
                width={56}
                height={56}
                className="object-contain w-full h-full"
                unoptimized
              />
            ) : (
              <div className="w-8 h-8 text-gray-400 flex items-center justify-center text-xs font-semibold">
                <Building2 className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">
              <Link 
                href={detailHref}
                className="hover:text-brand-gold transition-colors"
              >
                {name}
              </Link>
            </CardTitle>
            <Badge variant="secondary" className="mt-1 text-xs">
              {getCategoryLabel(category)}
            </Badge>
          </div>
          {isPremiumListing && (
            <Badge className="bg-brand-gold text-brand-navy text-xs">
              Featured
            </Badge>
          )}
        </div>
        
        <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
          {canadian_locations > 0 && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{canadian_locations} in Canada</span>
            </div>
          )}
          {usa_locations > 0 && !canadian_locations && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{usa_locations} in USA</span>
            </div>
          )}
          {total_locations > 0 && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{total_locations} total</span>
            </div>
          )}
          {established_year && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Est. {established_year}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-grow p-4 pt-0">
        {displayDescription && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">{displayDescription}</p>
            {shouldShowToggle && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="mt-2 p-0 h-auto text-brand-gold hover:text-brand-navy font-medium"
              >
                {isExpanded ? (
                  <>Show Less <ChevronUp className="w-4 h-4 ml-1" /></>
                ) : (
                  <>Show More <ChevronDown className="w-4 h-4 ml-1" /></>
                )}
              </Button>
            )}
          </div>
        )}
        
        <div className="text-sm mt-auto">
          <p className="font-semibold text-gray-500">Investment Range</p>
          <p className="text-lg font-bold text-brand-navy">
            {formatInvestmentRange(initial_investment_min, initial_investment_max)}
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="w-full flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              className={`flex-1 justify-center items-center ${isInCompare ? 'bg-brand-gold border-brand-gold text-brand-navy hover:bg-brand-gold/90' : ''}`}
              onClick={() => onAddToCompare && onAddToCompare(franchise)}
            >
              {isInCompare ? <Check className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {isInCompare ? 'Comparing' : 'Compare'}
            </Button>
            <Button
              size="sm"
              className={`flex-1 justify-center items-center ${isInRequests ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-brand-navy text-brand-gold hover:bg-brand-navy-light'}`}
              onClick={() => onOpenRequestModal ? onOpenRequestModal(franchise) : (onAddToRequests && onAddToRequests(franchise))}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isInRequests ? 'Added' : 'Request Info'}
            </Button>
          </div>
          
          <Link href={detailHref} onClick={() => window.scrollTo(0, 0)}>
            <Button
              variant="outline"
              className="w-full justify-center items-center"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
