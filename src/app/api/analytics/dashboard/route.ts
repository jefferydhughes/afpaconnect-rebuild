import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const franchiseId = request.nextUrl.searchParams.get('franchiseId')
  const dateRange = request.nextUrl.searchParams.get('dateRange') || '30days'

  const daysAgo = dateRange === '7days' ? 7 : dateRange === '90days' ? 90 : 30
  const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  // Fetch all platform connections for this user
  let connQuery = admin
    .from('platform_connections')
    .select('*')
    .eq('user_id', user.id)
  if (franchiseId) connQuery = connQuery.eq('franchise_id', franchiseId)
  const { data: connections } = await connQuery

  const dashboardData: Record<string, unknown> = {
    connections: connections || [],
    gmb: null,
    ads: null,
    website: null,
    summary: {
      totalSpend: 0,
      totalLeads: 0,
      totalClicks: 0,
      totalImpressions: 0,
      avgCostPerLead: 0,
      websiteVisits: 0,
    },
  }

  if (!connections || connections.length === 0) {
    return NextResponse.json(dashboardData)
  }

  const connectedIds = connections
    .filter((c) => c.status === 'connected')
    .map((c) => c.id)

  if (connectedIds.length === 0) {
    return NextResponse.json(dashboardData)
  }

  // GMB metrics
  const gmbConn = connections.find(
    (c) => c.platform === 'google_my_business' && c.status === 'connected'
  )
  if (gmbConn) {
    const { data: gmbMetrics } = await admin
      .from('gmb_metrics')
      .select('*')
      .eq('connection_id', gmbConn.id)
      .gte('date', startDate)
      .order('date', { ascending: false })

    if (gmbMetrics && gmbMetrics.length > 0) {
      const totalCalls = gmbMetrics.reduce((s, m) => s + (m.actions_phone || 0), 0)
      const totalDirections = gmbMetrics.reduce((s, m) => s + (m.actions_driving_directions || 0), 0)
      const totalWebsiteClicks = gmbMetrics.reduce((s, m) => s + (m.actions_website || 0), 0)
      const totalViews = gmbMetrics.reduce(
        (s, m) => s + (m.views_maps || 0) + (m.views_search || 0), 0
      )
      dashboardData.gmb = {
        metrics: gmbMetrics,
        summary: {
          totalCalls,
          totalDirections,
          totalWebsiteClicks,
          avgDailyViews: gmbMetrics.length > 0 ? totalViews / gmbMetrics.length : 0,
        },
      }
    }
  }

  // Ad metrics (Meta, Google Ads, LinkedIn)
  const adConns = connections.filter(
    (c) =>
      ['meta_ads', 'google_ads', 'linkedin_ads'].includes(c.platform) &&
      c.status === 'connected'
  )
  if (adConns.length > 0) {
    const { data: adMetrics } = await admin
      .from('ad_campaign_metrics')
      .select('*')
      .in('connection_id', adConns.map((c) => c.id))
      .gte('date', startDate)
      .order('date', { ascending: true })

    if (adMetrics && adMetrics.length > 0) {
      const totalSpend = adMetrics.reduce((s, m) => s + (m.spend || 0), 0)
      const totalLeads = adMetrics.reduce((s, m) => s + (m.leads || 0), 0)
      const totalClicks = adMetrics.reduce((s, m) => s + (m.clicks || 0), 0)
      const totalImpressions = adMetrics.reduce((s, m) => s + (m.impressions || 0), 0)

      dashboardData.ads = {
        metrics: adMetrics,
        summary: {
          totalSpend,
          totalLeads,
          totalClicks,
          totalImpressions,
          avgCostPerLead: totalLeads > 0 ? totalSpend / totalLeads : 0,
          avgCTR: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        },
      }

      const summary = dashboardData.summary as Record<string, number>
      summary.totalSpend = totalSpend
      summary.totalLeads = totalLeads
      summary.totalClicks = totalClicks
      summary.totalImpressions = totalImpressions
      summary.avgCostPerLead = totalLeads > 0 ? totalSpend / totalLeads : 0
    }
  }

  // Website metrics (Google Analytics)
  const gaConn = connections.find(
    (c) => c.platform === 'google_analytics' && c.status === 'connected'
  )
  if (gaConn) {
    const { data: webMetrics } = await admin
      .from('website_traffic_metrics')
      .select('*')
      .eq('connection_id', gaConn.id)
      .gte('date', startDate)
      .order('date', { ascending: true })

    if (webMetrics && webMetrics.length > 0) {
      const totalSessions = webMetrics.reduce((s, m) => s + (m.sessions || 0), 0)
      const totalUsers = webMetrics.reduce((s, m) => s + (m.users || 0), 0)
      const totalPageViews = webMetrics.reduce((s, m) => s + (m.page_views || 0), 0)
      const avgBounce =
        webMetrics.length > 0
          ? webMetrics.reduce((s, m) => s + (m.bounce_rate || 0), 0) / webMetrics.length
          : 0

      dashboardData.website = {
        metrics: webMetrics,
        summary: { totalSessions, totalUsers, totalPageViews, avgBounceRate: avgBounce },
      }
      ;(dashboardData.summary as Record<string, number>).websiteVisits = totalSessions
    }
  }

  return NextResponse.json(dashboardData)
}
