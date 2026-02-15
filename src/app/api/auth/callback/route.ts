import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// This route handles:
// 1. Email confirmation links (Supabase sends ?code=xxx back here)
// 2. OAuth provider callbacks (Google, etc. - future use)
// 3. Password reset confirmations
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle errors from Supabase (e.g. expired confirmation link)
  if (error) {
    console.error('Auth callback error:', error, errorDescription)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    )
  }

  if (code) {
    const supabase = createClient()

    // Exchange the auth code for a session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Code exchange error:', exchangeError)
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
      )
    }

    if (data?.user) {
      // Ensure a profiles row exists for this user.
      // This covers cases where the trigger hasn't fired or is missing.
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: data.user.user_metadata?.full_name || null,
          role: 'user',
        })
      }
    }

    // Redirect to the intended destination (default: /dashboard)
    return NextResponse.redirect(`${origin}${next}`)
  }

  // No code present — redirect to login
  return NextResponse.redirect(`${origin}/login`)
}
