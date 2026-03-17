import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const PLATFORM_OAUTH: Record<string, { authUrl: string; scopes: string }> = {
  google_my_business: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: 'https://www.googleapis.com/auth/business.manage',
  },
  google_ads: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: 'https://www.googleapis.com/auth/adwords',
  },
  google_analytics: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: 'https://www.googleapis.com/auth/analytics.readonly',
  },
  meta_ads: {
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    scopes: 'ads_read,ads_management,read_insights',
  },
  linkedin_ads: {
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    scopes: 'r_ads,r_ads_reporting',
  },
}

/**
 * GET /api/analytics/connect/[platform]?franchiseId=
 * Initiates the OAuth flow for the given platform.
 * Requires the following env vars per platform:
 *   GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET
 *   META_APP_ID / META_APP_SECRET
 *   LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const { platform } = params
  const franchiseId = request.nextUrl.searchParams.get('franchiseId') || ''
  const config = PLATFORM_OAUTH[platform]

  if (!config) {
    return NextResponse.json({ error: 'Unknown platform' }, { status: 400 })
  }

  // Determine the correct client ID env var
  const isGoogle = ['google_my_business', 'google_ads', 'google_analytics'].includes(platform)
  const clientId = isGoogle
    ? process.env.GOOGLE_OAUTH_CLIENT_ID
    : platform === 'meta_ads'
    ? process.env.META_APP_ID
    : process.env.LINKEDIN_CLIENT_ID

  if (!clientId) {
    // OAuth not yet configured — upsert a placeholder connection row so the
    // UI can show a "setup required" state rather than a raw error
    const admin = createAdminClient()
    await admin.from('platform_connections').upsert(
      {
        user_id: user.id,
        franchise_id: franchiseId || null,
        platform,
        status: 'disconnected',
        error_message: 'OAuth credentials not configured. Add the required env vars to enable this integration.',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,platform' }
    )
    return NextResponse.redirect(
      new URL(`/dashboard/franchisor/analytics?error=oauth_not_configured&platform=${platform}`, request.url)
    )
  }

  const state = Buffer.from(
    JSON.stringify({ userId: user.id, franchiseId, platform })
  ).toString('base64url')

  const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/analytics/callback/${platform}`

  const url = new URL(config.authUrl)
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', callbackUrl)
  url.searchParams.set('scope', config.scopes)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('state', state)
  if (isGoogle) url.searchParams.set('access_type', 'offline')

  return NextResponse.redirect(url.toString())
}
