'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  DEFAULT_DEMO_SESSION,
  DEMO_DATA,
  DEMO_PERSONAS,
  DemoSession,
  getLocalDemoSessionBySessionId,
} from '@/components/demo/demoData'

interface DemoContextValue {
  session: DemoSession | null
  loading: boolean
  error: string | null
  isExpired: boolean
  demoData: typeof DEMO_DATA
  personas: typeof DEMO_PERSONAS
  getBrandedData: (dataKey: keyof typeof DEMO_DATA) => (typeof DEMO_DATA)[keyof typeof DEMO_DATA]
}

const DemoContext = createContext<DemoContextValue | null>(null)

export function DemoProvider({ children, sessionId }: { children: React.ReactNode; sessionId?: string | null }) {
  const [session, setSession] = useState<DemoSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const loadSession = async () => {
      try {
        if (!sessionId) {
          setSession(DEFAULT_DEMO_SESSION)
          setLoading(false)
          return
        }

        const localSession = getLocalDemoSessionBySessionId(sessionId)
        if (localSession) {
          if (new Date(localSession.expires_at) < new Date() || localSession.is_expired) {
            setIsExpired(true)
            setError('This demo session has expired')
          } else {
            setSession(localSession)
          }
          setLoading(false)
          return
        }

        // No remote lookup — fall back to default session with this session_id
        setSession({ ...DEFAULT_DEMO_SESSION, session_id: sessionId })
        setError(null)
      } catch (err) {
        console.error('Error loading demo session, using local default:', err)
        setSession({ ...DEFAULT_DEMO_SESSION, session_id: sessionId || DEFAULT_DEMO_SESSION.session_id })
        setError(null)
      }

      setLoading(false)
    }

    loadSession()
  }, [sessionId])

  const value: DemoContextValue = {
    session,
    loading,
    error,
    isExpired,
    demoData: DEMO_DATA,
    personas: DEMO_PERSONAS,
    getBrandedData: (dataKey) => DEMO_DATA[dataKey],
  }

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemoContext() {
  const context = useContext(DemoContext)
  if (!context) {
    throw new Error('useDemoContext must be used within a DemoProvider')
  }
  return context
}

export default DemoContext
