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
    console.warn('RESEND_API_KEY not set — skipping franchisor-signup email')
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
    const {
      name,
      email,
      phone,
      brandName,
      brandUrl,
      locations,
      states,
      notes,
    } = body as {
      name?: string
      email?: string
      phone?: string
      brandName?: string
      brandUrl?: string
      locations?: string | number
      states?: string[]
      notes?: string
    }

    if (!name || !email || !brandName || !brandUrl || !locations) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const stateList = Array.isArray(states) ? states : []
    if (stateList.length === 0) {
      return NextResponse.json(
        { error: 'Select at least one state' },
        { status: 400 }
      )
    }

    const siteUrl = getSiteUrl()
    const firstName = name.split(' ')[0] || name
    const lastName = name.split(' ').slice(1).join(' ') || null

    // Record as a lead for admin follow-up (best-effort)
    const supabase = createAdminClient()
    const leadsTable = supabase.from('leads') as any
    const { error: dbError } = await leadsTable.insert({
      email,
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      source: 'directory_inquiry',
      status: 'new',
      notes: [
        'Franchisor signup',
        `Brand: ${brandName}`,
        `URL: ${brandUrl}`,
        `Locations: ${locations}`,
        `States registered: ${stateList.join(', ')}`,
        notes ? `Notes: ${notes}` : null,
      ].filter(Boolean).join('\n'),
    })
    if (dbError) {
      console.error('Franchisor-signup lead insert error:', dbError)
    }

    // Notify the main site inbox
    const subject = `New Franchisor Signup — ${brandName}`
    const notif = await sendEmail({
      to: NOTIFICATION_EMAIL,
      subject,
      replyTo: email,
      html: `
        <h2>New Franchisor Signup</h2>
        <p>A brand has requested to list on AFPAConnect.</p>
        <table style="border-collapse:collapse;width:100%;max-width:560px;">
          <tr><td style="padding:6px 12px;font-weight:bold;">Name</td><td style="padding:6px 12px;">${name}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Email</td><td style="padding:6px 12px;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Phone</td><td style="padding:6px 12px;">${phone || 'Not provided'}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Brand</td><td style="padding:6px 12px;">${brandName}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">URL</td><td style="padding:6px 12px;"><a href="${brandUrl}">${brandUrl}</a></td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Locations</td><td style="padding:6px 12px;">${locations}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">States Registered</td><td style="padding:6px 12px;">${stateList.join(', ')}</td></tr>
        </table>
        ${notes ? `<h3>Notes</h3><p style="white-space:pre-wrap;">${notes}</p>` : ''}
        <hr/>
        <p style="color:#888;font-size:12px;">Reply to this email to respond to ${firstName} directly.</p>
      `,
      text: [
        'New Franchisor Signup',
        '',
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || 'Not provided'}`,
        `Brand: ${brandName}`,
        `URL: ${brandUrl}`,
        `Locations: ${locations}`,
        `States Registered: ${stateList.join(', ')}`,
        notes ? `\nNotes:\n${notes}` : '',
        '',
        `Sent from ${siteUrl}/franchisor-signup`,
      ].join('\n'),
    })

    // Confirmation to the franchisor
    const confirm = await sendEmail({
      to: email,
      subject: `Thanks for your interest — AFPAConnect`,
      html: `
        <h2>Thanks, ${firstName}!</h2>
        <p>We received your request to list <strong>${brandName}</strong> on AFPAConnect.
        A member of our team will review your details and reach out within 2 business days
        to book a discovery call.</p>
        <p>In the meantime, feel free to explore the directory and advisor network at
        <a href="${siteUrl}">${siteUrl}</a>.</p>
        <hr/>
        <p style="color:#888;font-size:12px;">AFPAConnect — Your Franchise Journey Starts Here</p>
      `,
      text: [
        `Thanks, ${firstName}!`,
        '',
        `We received your request to list ${brandName} on AFPAConnect. A member of our team`,
        'will review your details and reach out within 2 business days to book a call.',
        '',
        `Visit us at ${siteUrl}`,
        '',
        '— AFPAConnect',
      ].join('\n'),
    })

    return NextResponse.json({
      success: true,
      emails: { notification: notif, confirmation: confirm },
    })
  } catch (err: any) {
    console.error('Franchisor-signup API error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
