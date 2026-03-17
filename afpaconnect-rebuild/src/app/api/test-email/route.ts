import { NextResponse } from 'next/server'

/**
 * Temporary test endpoint — DELETE after verifying email works.
 * GET /api/test-email?to=your@email.com
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const to = searchParams.get('to')

  if (!to) {
    return NextResponse.json({ error: 'Missing ?to= query param' }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY is not set' }, { status: 500 })
  }

  const from =
    process.env.AFPA_EMAIL_FROM ||
    process.env.EMAIL_FROM ||
    'AFPAConnect Notifications <notifications@afpaconnect.com>'

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject: 'AFPAConnect Email Test',
        html: '<h2>Email is working!</h2><p>This is a test from AFPAConnect. If you see this, Resend is configured correctly.</p>',
        text: 'Email is working! This is a test from AFPAConnect.',
      }),
    })

    const body = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Resend API error', status: res.status, detail: body },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, resendResponse: body, from, to })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
