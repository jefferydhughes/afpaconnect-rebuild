import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const NOTIFICATION_EMAIL = 'notifications@afpaconnect.com'

function getFromAddress(): string {
  return (
    process.env.AFPA_EMAIL_FROM ||
    process.env.EMAIL_FROM ||
    'AFPAConnect <notifications@afpaconnect.com>'
  )
}

function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL
  if (explicit) return explicit.replace(/\/+$/, '')
  const vercel = process.env.VERCEL_URL
  if (vercel) return `https://${vercel}`.replace(/\/+$/, '')
  return 'http://localhost:3000'
}

async function sendEmail(args: {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping email')
    return { skipped: true }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: getFromAddress(),
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
      reply_to: args.replyTo,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error(`Resend error (${res.status}):`, body)
    return { error: body, status: res.status }
  }

  return await res.json()
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, subject, message } = body

    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 1. Save as lead in Supabase
    const supabase = createAdminClient()
    const { error: dbError } = await supabase.from('leads').insert({
      email,
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      source: 'contact_form',
      notes: `Subject: ${subject}\n\n${message}`,
      status: 'new',
    })

    if (dbError) {
      console.error('Lead insert error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      )
    }

    const fullName = `${firstName} ${lastName}`
    const siteUrl = getSiteUrl()

    // 2. Send notification email to AFPA team
    const notifResult = await sendEmail({
      to: NOTIFICATION_EMAIL,
      subject: `New Contact Form: ${subject} — ${fullName}`,
      replyTo: email,
      html: `
        <h2>New Contact Form Submission</h2>
        <table style="border-collapse:collapse;width:100%;max-width:500px;">
          <tr><td style="padding:6px 12px;font-weight:bold;">Name</td><td style="padding:6px 12px;">${fullName}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Email</td><td style="padding:6px 12px;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Phone</td><td style="padding:6px 12px;">${phone || 'Not provided'}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Subject</td><td style="padding:6px 12px;">${subject}</td></tr>
        </table>
        <h3>Message</h3>
        <p style="white-space:pre-wrap;">${message}</p>
        <hr/>
        <p style="color:#888;font-size:12px;">Sent from the contact form at <a href="${siteUrl}">${siteUrl}</a></p>
      `,
      text: [
        'New Contact Form Submission',
        '',
        `Name: ${fullName}`,
        `Email: ${email}`,
        `Phone: ${phone || 'Not provided'}`,
        `Subject: ${subject}`,
        '',
        'Message:',
        message,
        '',
        `Sent from ${siteUrl}`,
      ].join('\n'),
    })

    // 3. Send thank-you email to the person who submitted
    const thankYouResult = await sendEmail({
      to: email,
      subject: 'Thank you for contacting AFPAConnect',
      html: `
        <h2>Thank you, ${firstName}!</h2>
        <p>We received your message and will get back to you within 24 business hours.</p>
        <p><strong>Your message:</strong></p>
        <blockquote style="border-left:3px solid #ccc;padding-left:12px;color:#555;">
          ${message}
        </blockquote>
        <p>In the meantime, feel free to explore franchise opportunities on our site:</p>
        <p><a href="${siteUrl}" style="color:#1a365d;font-weight:bold;">Visit AFPAConnect</a></p>
        <hr/>
        <p style="color:#888;font-size:12px;">AFPAConnect — Your Franchise Journey Starts Here</p>
      `,
      text: [
        `Thank you, ${firstName}!`,
        '',
        'We received your message and will get back to you within 24 business hours.',
        '',
        'Your message:',
        message,
        '',
        `Visit us at ${siteUrl}`,
        '',
        '— AFPAConnect',
      ].join('\n'),
    })

    return NextResponse.json({
      success: true,
      emailsSent: {
        notification: notifResult,
        thankYou: thankYouResult,
      },
    })
  } catch (err: any) {
    console.error('Contact API error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
