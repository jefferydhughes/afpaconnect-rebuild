'use client'

/**
 * TourResetButton
 * ---------------
 * Clears the tour-completed flag for the current role and reloads the page
 * so the tour fires again on the next render.
 *
 * Drop this anywhere in the role's Settings page:
 *   <TourResetButton role="admin" />
 */

import { tourStorageKey } from './TourManager'
import { Button } from '@/components/ui/button'
import { PlayCircle } from 'lucide-react'

interface Props {
  role: string
  label?: string
}

export default function TourResetButton({ role, label = 'Replay Onboarding Tour' }: Props) {
  function handleReset() {
    localStorage.removeItem(tourStorageKey(role))
    window.location.reload()
  }

  return (
    <Button variant="outline" onClick={handleReset} className="gap-2">
      <PlayCircle className="h-4 w-4" />
      {label}
    </Button>
  )
}
