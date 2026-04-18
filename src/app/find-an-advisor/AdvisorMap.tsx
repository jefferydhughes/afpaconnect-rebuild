'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { Advisor } from '@/types/database'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  Loader2,
} from 'lucide-react'
import AdvisorContactForm from '@/components/advisor/AdvisorContactForm'

// Dynamically import the map to avoid SSR issues with Leaflet
const MapWithNoSSR = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-gray-100 flex items-center justify-center rounded-lg">
      <Loader2 className="w-8 h-8 text-brand-navy animate-spin" />
    </div>
  ),
})

const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' }, { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' }, { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' }, { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' }, { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' }, { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' }, { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' }, { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' }, { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' }, { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
]

const STATE_CENTERS: Record<string, [number, number]> = {
  AL: [32.806671, -86.79113], AK: [61.370716, -152.404419], AZ: [33.729759, -111.431221],
  AR: [34.969704, -92.373123], CA: [36.116203, -119.681564], CO: [39.059811, -105.311104],
  CT: [41.597782, -72.755371], DE: [39.318523, -75.507141], FL: [27.766279, -81.686783],
  GA: [33.040619, -83.643074], HI: [21.094318, -157.498337], ID: [44.240459, -114.478828],
  IL: [40.349457, -88.986137], IN: [39.849426, -86.258278], IA: [42.011539, -93.210526],
  KS: [38.5266, -96.726486], KY: [37.66814, -84.670067], LA: [31.169546, -91.867805],
  ME: [44.693947, -69.381927], MD: [39.063946, -76.802101], MA: [42.230171, -71.530106],
  MI: [43.326618, -84.536095], MN: [45.694454, -93.900192], MS: [32.741646, -89.678696],
  MO: [38.456085, -92.288368], MT: [46.921925, -110.454353], NE: [41.12537, -98.268082],
  NV: [38.313515, -117.055374], NH: [43.452492, -71.563896], NJ: [40.298904, -74.521011],
  NM: [34.840515, -106.248482], NY: [42.165726, -74.948051], NC: [35.630066, -79.806419],
  ND: [47.528912, -99.784012], OH: [40.388783, -82.764915], OK: [35.565342, -96.928917],
  OR: [44.572021, -122.070938], PA: [40.590752, -77.209755], RI: [41.680893, -71.51178],
  SC: [33.856892, -80.945007], SD: [44.299782, -99.438828], TN: [35.747845, -86.692345],
  TX: [31.054487, -97.563461], UT: [40.150032, -111.862434], VT: [44.045876, -72.710686],
  VA: [37.769337, -78.169968], WA: [47.400902, -121.490494], WV: [38.491226, -80.954453],
  WI: [44.268543, -89.616508], WY: [42.755966, -107.30249],
}

function toSlug(name: string | null): string {
  return (name ?? '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function getAdvisorCoords(advisor: Advisor): [number, number] | null {
  if (advisor.latitude && advisor.longitude) {
    return [advisor.latitude, advisor.longitude]
  }
  if (advisor.state) {
    return STATE_CENTERS[advisor.state] ?? null
  }
  return null
}

interface AdvisorMapProps {
  advisors: Advisor[]
}

export default function AdvisorMap({ advisors }: AdvisorMapProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedState, setSelectedState] = useState('all')

  const filteredAdvisors = useMemo(() => {
    let results = advisors

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      results = results.filter(
        (a) =>
          a.name?.toLowerCase().includes(term) ||
          a.city?.toLowerCase().includes(term) ||
          a.specialties?.some((s) => s.toLowerCase().includes(term))
      )
    }

    if (selectedState && selectedState !== 'all') {
      results = results.filter((a) => a.state === selectedState)
    }

    return results
  }, [advisors, searchTerm, selectedState])

  const mapCenter: [number, number] =
    selectedState && selectedState !== 'all'
      ? STATE_CENTERS[selectedState] ?? [39.8283, -98.5795]
      : [39.8283, -98.5795]

  const mapZoom = selectedState && selectedState !== 'all' ? 6 : 4

  return (
    <>
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, city, or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {US_STATES.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="h-[500px]">
              <MapWithNoSSR
                advisors={filteredAdvisors}
                center={mapCenter}
                zoom={mapZoom}
              />
            </div>
          </Card>
        </div>

        {/* Advisor List */}
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            {filteredAdvisors.length} Advisor
            {filteredAdvisors.length !== 1 ? 's' : ''} Found
          </h2>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
            {filteredAdvisors.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No advisors found matching your criteria.
                </CardContent>
              </Card>
            ) : (
              filteredAdvisors.map((advisor) => (
                <Card
                  key={advisor.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {advisor.image_url ? (
                        <img
                          src={advisor.image_url}
                          alt={advisor.name ?? 'Advisor'}
                          className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-brand-navy flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                          {advisor.name?.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {advisor.name}
                        </h3>
                        <p className="text-sm text-gray-600">{advisor.title}</p>
                        {advisor.city && advisor.state && (
                          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                            <MapPin className="w-3 h-3" />
                            {advisor.city}, {advisor.state}
                          </div>
                        )}
                        {advisor.specialties && advisor.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {advisor.specialties.slice(0, 2).map((spec) => (
                              <Badge
                                key={spec}
                                variant="secondary"
                                className="text-xs"
                              >
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t flex gap-2">
                      <Link
                        href={`/advisors/${toSlug(advisor.name)}`}
                        className="flex-1"
                      >
                        <Button
                          size="sm"
                          className="w-full bg-brand-navy text-brand-gold hover:bg-brand-navy-light"
                        >
                          View Profile
                        </Button>
                      </Link>
                      {advisor.calendar_embed_code ? (
                        <Link
                          href={`/advisors/${toSlug(advisor.name)}#calendar`}
                          className="flex-1"
                        >
                          <Button size="sm" variant="outline" className="w-full">
                            <Calendar className="w-4 h-4 mr-1" />
                            Schedule
                          </Button>
                        </Link>
                      ) : advisor.email ? (
                        <div className="flex-1">
                          <AdvisorContactForm
                            advisorId={advisor.id}
                            advisorName={advisor.name ?? 'this advisor'}
                            trigger={
                              <Button size="sm" variant="outline" className="w-full">
                                <Mail className="w-4 h-4 mr-1" />
                                Contact
                              </Button>
                            }
                          />
                        </div>
                      ) : null}
                      {advisor.phone && (
                        <a href={`tel:${advisor.phone}`}>
                          <Button size="sm" variant="outline">
                            <Phone className="w-4 h-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
