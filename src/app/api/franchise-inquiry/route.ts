import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

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
    const { name, email, phone, message, subject, recipient } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Determine the recipient
    const recipientEmail = recipient || NOTIFICATION_EMAIL

    // 1. Save as lead in Supabase
    const supabase = createAdminClient()
    const { error: dbError } = await supabase.from('leads').insert({
      email,
      first_name: name.split(' ')[0] || name,
      last_name: name.split(' ').slice(1).join(' ') || '',
      phone: phone || null,
      source: 'directory_inquiry',
      message: message,
      status: 'new',
    })

    if (dbError) {
      console.error('Lead insert error:', dbError)
      // Log but don't block — still attempt to send email
    }

    const siteUrl = getSiteUrl()

    // 2. Send inquiry email to the appropriate recipient
    const inquiryResult = await sendEmail({
      to: recipientEmail,
      subject: subject || 'Franchise Information Request',
      replyTo: email,
      html: `
        <h2>New Franchise Inquiry</h2>
        <table style="border-collapse:collapse;width:100%;max-width:500px;">
          <tr><td style="padding:6px 12px;font-weight:bold;">Name</td><td style="padding:6px 12px;">${name}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Email</td><td style="padding:6px 12px;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Phone</td><td style="padding:6px 12px;">${phone || 'Not provided'}</td></tr>
        </table>
        <h3>Message</h3>
        <p style="white-space:pre-wrap;">${message}</p>
        <hr/>
        <p style="color:#888;font-size:12px;">Sent from the franchise directory at <a href="${siteUrl}">${siteUrl}</a></p>
      `,
      text: [
        'New Franchise Inquiry',
        '',
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || 'Not provided'}`,
        '',
        'Message:',
        message,
        '',
        `Sent from ${siteUrl}`,
      ].join('\n'),
    })

    if (inquiryResult.error) {
      console.error('Failed to send inquiry email:', inquiryResult.error)
      // Don't fail the request — lead is already saved
    }

    // 3. Send thank-you email to the person who submitted
    const thankYouResult = await sendEmail({
      to: email,
      subject: 'Thank you for your franchise inquiry',
      html: `
        <h2>Thank you, ${name.split(' ')[0]}!</h2>
        <p>We received your franchise inquiry and will get back to you within 24 business hours.</p>
        <p><strong>Your message:</strong></p>
        <blockquote style="border-left:3px solid #ccc;padding-left:12px;color:#555;">
          ${message}
        </blockquote>
        <p>In the meantime, feel free to explore more franchise opportunities on our site:</p>
        <p><a href="${siteUrl}" style="color:#1a365d;font-weight:bold;">Visit AFPAConnect</a></p>
        <hr/>
        <p style="color:#888;font-size:12px;">AFPAConnect — Your Franchise Journey Starts Here</p>
      `,
      text: [
        `Thank you, ${name.split(' ')[0]}!`,
        '',
        'We received your franchise inquiry and will get back to you within 24 business hours.',
        '',
        'Your message:',
        message,
        '',
        `Visit AFPAConnect: ${siteUrl}`,
      ].join('\n'),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Franchise inquiry error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}