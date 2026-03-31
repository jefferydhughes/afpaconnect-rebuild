import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient()

    // Verify caller is authenticated admin or advisor
    const authHeader = req.headers.get('authorization')
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '') || ''
    )

    const body = await req.json()
    const { to, subject, body: emailBody, leadId, senderName, replyTo } = body

    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, body' },
        { status: 400 }
      )
    }

    // Send via Resend
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const fromAddress =
      process.env.AFPA_EMAIL_FROM ||
      'AFPAConnect <notifications@afpaconnect.com>'

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: emailBody,
        text: emailBody.replace(/<[^>]*>/g, ''),
        ...(replyTo && { reply_to: replyTo }),
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      console.error('Resend error:', errBody)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    const result = await response.json()

    // Update lead last_contacted_at if leadId provided
    if (leadId) {
      await supabase
        .from('leads')
        .update({
          last_contacted_at: new Date().toISOString(),
          status: 'contacted',
        })
        .eq('id', leadId)
        .eq('status', 'new') // only auto-advance from 'new'
    }

    return NextResponse.json({ success: true, id: result.id })
  } catch (err: any) {
    console.error('Send email error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
