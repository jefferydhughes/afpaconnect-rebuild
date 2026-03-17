'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import Link from 'next/link'
import type { Advisor } from '@/types/database'
import { MapPin, ExternalLink } from 'lucide-react'
import { getAdvisorCoords } from './AdvisorMap'
import 'leaflet/dist/leaflet.css'

// Fix default marker icon issue with Leaflet + webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function toSlug(name: string | null): string {
  return (name ?? '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

/** Syncs the map view when center/zoom props change */
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [map, center, zoom])
  return null
}

interface LeafletMapProps {
  advisors: Advisor[]
  center: [number, number]
  zoom: number
}

export default function LeafletMap({ advisors, center, zoom }: LeafletMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <ChangeView center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {advisors.map((advisor) => {
        const coords = getAdvisorCoords(advisor)
        if (!coords) return null
        return (
          <Marker key={advisor.id} position={coords}>
            <Popup>
              <div className="min-w-[200px]">
                <div className="flex items-center gap-3 mb-2">
                  {advisor.image_url ? (
                    <img
                      src={advisor.image_url}
                      alt={advisor.name ?? 'Advisor'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#202C3D] flex items-center justify-center text-white font-bold">
                      {advisor.name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {advisor.name}
                    </h3>
                    {advisor.title && (
                      <p className="text-xs text-gray-600">{advisor.title}</p>
                    )}
                  </div>
                </div>
                {advisor.city && advisor.state && (
                  <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3 inline" />
                    {advisor.city}, {advisor.state}
                  </p>
                )}
                <Link
                  href={`/advisors/${toSlug(advisor.name)}`}
                  className="inline-flex items-center text-sm text-blue-600 hover:underline"
                >
                  View Profile <ExternalLink className="w-3 h-3 ml-1" />
                </Link>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
