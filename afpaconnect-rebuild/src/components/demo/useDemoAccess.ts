'use client'

import { useEffect, useState } from 'react'

export function useDemoAccess() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true

    fetch('/api/me')
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return
        setHasAccess(data.role === 'admin' || data.role === 'advisor')
      })
      .catch(() => {
        if (!mounted) return
        setHasAccess(false)
      })

    return () => { mounted = false }
  }, [])

  return hasAccess
}
