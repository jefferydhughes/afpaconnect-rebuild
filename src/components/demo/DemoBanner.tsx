'use client'

import { FlaskConical, Clock } from 'lucide-react'

export default function DemoBanner({ franchiseName, expiresAt }: { franchiseName?: string; expiresAt?: string }) {
  const getTimeRemaining = () => {
    if (!expiresAt) return ''
    const diff = new Date(expiresAt).getTime() - Date.now()
    if (diff <= 0) return 'Expired'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return hours > 0 ? `${hours}h ${minutes}m remaining` : `${minutes}m remaining`
  }

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2 text-center text-sm font-medium sticky top-0 z-[100] shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4" />
          <span>Sandbox Demo Mode</span>
        </div>
        <span className="hidden sm:inline">-</span>
        <span className="hidden sm:inline">
          Data shown is simulated for <strong>{franchiseName || 'Demo Brand'}</strong>
        </span>
        {expiresAt && (
          <>
            <span className="hidden md:inline">|</span>
            <div className="hidden md:flex items-center gap-1 text-amber-800">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs">{getTimeRemaining()}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
