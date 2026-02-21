'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export function useDemoAccess() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true

    const checkAccess = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )
        const { data: { user } } = await supabase.auth.getUser()
        if (!mounted) return
        if (!user) { setHasAccess(false); return }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (!mounted) return
        setHasAccess(profile?.role === 'admin' || profile?.role === 'advisor')
      } catch {
        if (!mounted) return
        setHasAccess(false)
      }
    }

    checkAccess()
    return () => { mounted = false }
  }, [])

  return hasAccess
}
