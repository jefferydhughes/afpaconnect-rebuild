import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * GET /api/analytics/callback/[platform]
 * OAuth 2.0 callback handler for all Google platforms.
 * Google redirects here after the user grants permission.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  const { platform } = params
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const stateRaw = searchParams.get('state')
  const error = searchParams.get('error')

  const dashboardUrl = new URL('/dashboard/franchisor/analytics', request.url)

  if (error || !code || !stateRaw) {
    dashboardUrl.searchParams.set('error', error || 'oauth_cancelled')
    dashboardUrl.searchParams.set('platform', platform)
    return NextResponse.redirect(dashboardUrl.toString())
  }

  let state: { userId: string; franchiseId?: string; platform: string }
  try {
    state = JSON.parse(Buffer.from(stateRaw, 'base64url').toString())
  } catch {
    dashboardUrl.searchParams.set('error', 'invalid_state')
    return NextResponse.redirect(dashboardUrl.toString())
  }

  // Exchange code for tokens
  const isGoogle = ['google_my_business', 'google_ads', 'google_analytics'].includes(platform)
  if (!isGoogle) {
    dashboardUrl.searchParams.set('error', 'unsupported_platform')
    return NextResponse.redirect(dashboardUrl.toString())
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID!
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET!
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/analytics/callback/${platform}`

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  const tokens = await tokenRes.json()

  if (!tokenRes.ok || !tokens.access_token) {
    dashboardUrl.searchParams.set('error', 'token_exchange_failed')
    return NextResponse.redirect(dashboardUrl.toString())
  }

  const expiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : null

  // Persist connection in Supabase (upsert so reconnecting updates tokens)
  const admin = createAdminClient()
  await admin.from('platform_connections').upsert(
    {
      user_id: state.userId,
      franchise_id: state.franchiseId || null,
      platform,
      status: 'connected',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? null,
      token_expires_at: expiresAt,
      error_message: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,platform' }
  )

  dashboardUrl.searchParams.set('connected', platform)
  return NextResponse.redirect(dashboardUrl.toString())
}
