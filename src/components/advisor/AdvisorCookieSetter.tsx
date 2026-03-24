'use client'

import { useEffect } from 'react'
import { setAdvisorCookie } from '@/lib/utils'

interface AdvisorCookieSetterProps {
  advisorId: string
}

export default function AdvisorCookieSetter({ advisorId }: AdvisorCookieSetterProps) {
  useEffect(() => {
    // Set the advisor cookie when the component mounts
    setAdvisorCookie(advisorId)
  }, [advisorId])

  // This component doesn't render anything
  return null
}