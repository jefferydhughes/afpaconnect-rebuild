export const DEMO_SESSION_STORAGE_KEY = 'afpa_demo_sessions_v1'

const now = Date.now()
const hoursAgo = (hours: number) => new Date(now - hours * 60 * 60 * 1000).toISOString()

export interface DemoSession {
  id: string
  session_id: string
  franchise_name: string
  franchise_logo_url: string
  franchise_website_url: string
  franchise_category: string
  label: string
  expires_at: string
  is_expired: boolean
  created_date: string
  _source?: 'local' | 'remote'
}

export const DEFAULT_DEMO_SESSION: DemoSession = {
  id: 'local-default-demo',
  session_id: 'local-default-demo',
  franchise_name: 'Summit Franchise Group',
  franchise_logo_url: '',
  franchise_website_url: 'https://example.com',
  franchise_category: 'business_services',
  label: 'Default internal sales demo',
  expires_at: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(),
  is_expired: false,
  created_date: new Date(now).toISOString(),
}

export const DEMO_PERSONAS = {
  franchisor: {
    role: 'Franchisor',
    name: 'Jordan Carter',
    title: 'VP of Franchise Development',
    narrative: 'Needs faster lead qualification, stronger market visibility, and cleaner expansion reporting.',
  },
  advisor: {
    role: 'Advisor',
    name: 'Avery Lopez',
    title: 'Senior Franchise Advisor',
    narrative: 'Needs a cleaner candidate pipeline, stronger fit signals, and fewer low-intent handoffs.',
  },
  candidate: {
    role: 'Candidate',
    name: 'Taylor Morgan',
    title: 'Franchise Buyer',
    narrative: 'Needs clear opportunity matching and guidance through evaluation and application steps.',
  },
}

export const DEMO_DATA = {
  applications: [
    {
      id: 'demo-app-1',
      applicant_name: 'Michael Chen',
      applicant_email: 'demo@example.com',
      status: 'new',
      investment_range: '$150,000 - $250,000',
      location_preference: 'Dallas, TX',
      submitted_date: hoursAgo(40),
      score: 87,
      disc_profile: 'Dominant',
      background: 'Former regional manager at Fortune 500 company',
    },
    {
      id: 'demo-app-2',
      applicant_name: 'Sarah Johnson',
      applicant_email: 'demo2@example.com',
      status: 'in_review',
      investment_range: '$200,000 - $350,000',
      location_preference: 'Austin, TX',
      submitted_date: hoursAgo(76),
      score: 92,
      disc_profile: 'Influential',
      background: 'Serial entrepreneur with two successful exits',
    },
    {
      id: 'demo-app-3',
      applicant_name: 'James Williams',
      applicant_email: 'demo3@example.com',
      status: 'qualified',
      investment_range: '$100,000 - $200,000',
      location_preference: 'Phoenix, AZ',
      submitted_date: hoursAgo(120),
      score: 78,
      disc_profile: 'Steady',
      background: '15 years in operations management',
    },
    {
      id: 'demo-app-4',
      applicant_name: 'Emily Davis',
      applicant_email: 'demo4@example.com',
      status: 'new',
      investment_range: '$250,000 - $400,000',
      location_preference: 'Miami, FL',
      submitted_date: hoursAgo(18),
      score: 95,
      disc_profile: 'Conscientious',
      background: 'MBA and former franchise owner',
    },
  ],
  candidates: [
    {
      id: 'demo-cand-1',
      name: 'Michael Chen',
      email: 'demo@example.com',
      investment_range: '$150,000 - $250,000',
      geographic_preferences: ['Texas', 'Arizona', 'Nevada'],
      compatibility_score: 87,
      disc_primary: 'Dominant',
      disc_secondary: 'Influential',
      goals: ['Financial Freedom', 'Be Own Boss'],
      experience: 'Management',
      timeline: '3-6 months',
    },
    {
      id: 'demo-cand-2',
      name: 'Sarah Johnson',
      email: 'demo2@example.com',
      investment_range: '$200,000 - $350,000',
      geographic_preferences: ['Texas', 'Florida'],
      compatibility_score: 92,
      disc_primary: 'Influential',
      disc_secondary: 'Steady',
      goals: ['Build Wealth', 'Community Impact'],
      experience: 'Entrepreneurship',
      timeline: 'Immediately',
    },
    {
      id: 'demo-cand-3',
      name: 'James Williams',
      email: 'demo3@example.com',
      investment_range: '$100,000 - $200,000',
      geographic_preferences: ['Arizona', 'Colorado'],
      compatibility_score: 78,
      disc_primary: 'Steady',
      disc_secondary: 'Conscientious',
      goals: ['Retirement Income', 'Family Business'],
      experience: 'Operations',
      timeline: '6-12 months',
    },
  ],
  heatmapData: [
    { city: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.797, interest_score: 95, inquiries: 47 },
    { city: 'Austin', state: 'TX', lat: 30.2672, lng: -97.7431, interest_score: 88, inquiries: 38 },
    { city: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698, interest_score: 82, inquiries: 35 },
    { city: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.074, interest_score: 79, inquiries: 29 },
    { city: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918, interest_score: 91, inquiries: 42 },
    { city: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903, interest_score: 74, inquiries: 24 },
    { city: 'Atlanta', state: 'GA', lat: 33.749, lng: -84.388, interest_score: 86, inquiries: 36 },
    { city: 'Nashville', state: 'TN', lat: 36.1627, lng: -86.7816, interest_score: 77, inquiries: 27 },
  ],
  analytics: {
    totalLeads: 156,
    qualifiedLeads: 42,
    conversionRate: 26.9,
    avgTimeToQualify: 4.2,
    topSources: [
      { source: 'Organic Search', leads: 58, percentage: 37 },
      { source: 'Paid Ads', leads: 45, percentage: 29 },
      { source: 'Referral', leads: 32, percentage: 21 },
      { source: 'Social Media', leads: 21, percentage: 13 },
    ],
    monthlyTrend: [
      { month: 'Jul', leads: 18, qualified: 4 },
      { month: 'Aug', leads: 24, qualified: 6 },
      { month: 'Sep', leads: 31, qualified: 8 },
      { month: 'Oct', leads: 28, qualified: 7 },
      { month: 'Nov', leads: 35, qualified: 10 },
      { month: 'Dec', leads: 20, qualified: 7 },
    ],
    funnelStages: [
      { stage: 'Website Visitors', count: 2450 },
      { stage: 'Quiz Started', count: 580 },
      { stage: 'Quiz Completed', count: 312 },
      { stage: 'Info Requested', count: 156 },
      { stage: 'Qualified', count: 42 },
      { stage: 'Application', count: 18 },
    ],
  },
  cityPages: [
    { city: 'Dallas', state: 'TX', status: 'published', lastUpdated: '2025-12-15' },
    { city: 'Austin', state: 'TX', status: 'draft', lastUpdated: '2025-12-20' },
    { city: 'Houston', state: 'TX', status: 'published', lastUpdated: '2025-12-10' },
    { city: 'Phoenix', state: 'AZ', status: 'draft', lastUpdated: '2025-12-22' },
    { city: 'Miami', state: 'FL', status: 'published', lastUpdated: '2025-12-18' },
  ],
}

const hasWindow = () => typeof window !== 'undefined'

const readStoredSessions = (): DemoSession[] => {
  if (!hasWindow()) return []
  try {
    const raw = window.localStorage.getItem(DEMO_SESSION_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeStoredSessions = (sessions: DemoSession[]) => {
  if (!hasWindow()) return
  try {
    window.localStorage.setItem(DEMO_SESSION_STORAGE_KEY, JSON.stringify(sessions))
  } catch {
    // no-op
  }
}

export const listLocalDemoSessions = (): DemoSession[] => {
  const sessions = readStoredSessions().filter(
    (s) => !s?.is_expired && new Date(s?.expires_at || 0) > new Date(),
  )
  return sessions.sort((a, b) => new Date(b.created_date || 0).getTime() - new Date(a.created_date || 0).getTime())
}

export const createLocalDemoSession = (payload: Partial<DemoSession>): DemoSession => {
  const sessionId = `demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
  const session: DemoSession = {
    id: `local-${sessionId}`,
    session_id: sessionId,
    franchise_name: payload.franchise_name || DEFAULT_DEMO_SESSION.franchise_name,
    franchise_logo_url: payload.franchise_logo_url || '',
    franchise_website_url: payload.franchise_website_url || '',
    franchise_category: payload.franchise_category || 'business_services',
    label: payload.label || '',
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    is_expired: false,
    created_date: new Date().toISOString(),
  }

  const sessions = [session, ...readStoredSessions()]
  writeStoredSessions(sessions)
  return session
}

export const deleteLocalDemoSession = (sessionId: string) => {
  const sessions = readStoredSessions().filter((s) => s.id !== sessionId && s.session_id !== sessionId)
  writeStoredSessions(sessions)
}

export const getLocalDemoSessionBySessionId = (sessionId: string): DemoSession | null => {
  if (!sessionId) return null
  return readStoredSessions().find((s) => s.session_id === sessionId) || null
}
