import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { to, subject, body: emailBody, leadId, senderName, replyTo } = body

    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, body' },
        { status: 400 }
      )
    }

    // Send via Resend — mirrors the proven test-email route pattern
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY is not set' }, { status: 500 })
    }

    const from =
      process.env.AFPA_EMAIL_FROM ||
      process.env.EMAIL_FROM ||
      'AFPAConnect Notifications <notifications@afpaconnect.com>'

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html: emailBody,
        text: emailBody.replace(/<[^>]*>/g, ''),
        ...(replyTo && { reply_to: replyTo }),
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Resend error:', JSON.stringify(result))
      return NextResponse.json(
        { error: 'Failed to send email', detail: result },
        { status: 500 }
      )
    }

    // Update lead last_contacted_at if leadId provided
    if (leadId) {
      try {
        const supabase = createAdminClient()
        await supabase
          .from('leads')
          .update({
            last_contacted_at: new Date().toISOString(),
            status: 'contacted',
          })
          .eq('id', leadId)
          .eq('status', 'new') // only auto-advance from 'new'
      } catch (dbErr) {
        // Non-critical — email was already sent
        console.error('Failed to update lead after email:', dbErr)
      }
    }

    return NextResponse.json({ success: true, id: result.id })
  } catch (err: any) {
    console.error('Send email error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
