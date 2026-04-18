import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import type { Advisor } from '@/types/database'

const FALLBACK_NOTIFICATION = 'notifications@afpaconnect.com'

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
  to: string | string[]
  subject: string
  html: string
  text: string
  replyTo?: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping advisor contact email')
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
    const { advisorId, name, email, state, subject, message } = body as {
      advisorId?: string
      name?: string
      email?: string
      state?: string
      subject?: string
      message?: string
    }

    if (!advisorId || !name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const { data: advisorData, error: advisorError } = await supabase
      .from('advisor')
      .select('id, name, email')
      .eq('id', advisorId)
      .single()

    const advisor = advisorData as Pick<Advisor, 'id' | 'name' | 'email'> | null

    if (advisorError || !advisor) {
      return NextResponse.json({ error: 'Advisor not found' }, { status: 404 })
    }

    const advisorEmail = advisor.email || FALLBACK_NOTIFICATION
    const advisorName = advisor.name || 'Advisor'
    const firstName = (name.split(' ')[0] || name).trim()
    const lastName = name.split(' ').slice(1).join(' ').trim() || null
    const siteUrl = getSiteUrl()

    // Save as a lead for tracking (best-effort; do not block email on failure)
    const leadsTable = supabase.from('leads') as any
    const { error: leadError } = await leadsTable.insert({
      email,
      first_name: firstName,
      last_name: lastName,
      phone: null,
      state: state || null,
      source: 'directory_inquiry',
      attributed_advisor_id: advisor.id,
      status: 'new',
      notes: `Advisor: ${advisorName}\nSubject: ${subject}\n\n${message}`,
    })
    if (leadError) {
      console.error('Advisor-contact lead insert error:', leadError)
    }

    const recipients = Array.from(new Set([advisorEmail, FALLBACK_NOTIFICATION]))

    const notifResult = await sendEmail({
      to: recipients,
      subject: `New message for ${advisorName}: ${subject}`,
      replyTo: email,
      html: `
        <h2>New Message via AFPAConnect</h2>
        <p>A prospective franchisee has reached out to <strong>${advisorName}</strong>.</p>
        <table style="border-collapse:collapse;width:100%;max-width:540px;">
          <tr><td style="padding:6px 12px;font-weight:bold;">Name</td><td style="padding:6px 12px;">${name}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Email</td><td style="padding:6px 12px;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">State</td><td style="padding:6px 12px;">${state || 'Not provided'}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Subject</td><td style="padding:6px 12px;">${subject}</td></tr>
        </table>
        <h3>Message</h3>
        <p style="white-space:pre-wrap;">${message}</p>
        <hr/>
        <p style="color:#888;font-size:12px;">Reply directly to this email to respond to ${firstName}.</p>
      `,
      text: [
        `New message for ${advisorName}`,
        '',
        `Name: ${name}`,
        `Email: ${email}`,
        `State: ${state || 'Not provided'}`,
        `Subject: ${subject}`,
        '',
        'Message:',
        message,
        '',
        `Sent from ${siteUrl}`,
      ].join('\n'),
    })

    const confirmResult = await sendEmail({
      to: email,
      subject: `Your message to ${advisorName} — AFPAConnect`,
      html: `
        <h2>Thanks, ${firstName}!</h2>
        <p>Your message has been sent to <strong>${advisorName}</strong>. They&apos;ll reply to you directly at
        <a href="mailto:${email}">${email}</a> shortly.</p>
        <p><strong>Your message:</strong></p>
        <blockquote style="border-left:3px solid #ccc;padding-left:12px;color:#555;">${message}</blockquote>
        <p style="color:#888;font-size:12px;">AFPAConnect — Your Franchise Journey Starts Here</p>
      `,
      text: [
        `Thanks, ${firstName}!`,
        '',
        `Your message has been sent to ${advisorName}. They'll reply shortly.`,
        '',
        'Your message:',
        message,
        '',
        '— AFPAConnect',
      ].join('\n'),
    })

    return NextResponse.json({
      success: true,
      emails: { notification: notifResult, confirmation: confirmResult },
    })
  } catch (err: any) {
    console.error('Advisor-contact API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
