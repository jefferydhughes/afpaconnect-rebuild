import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { sendFranchiseApplicationNotificationEmail } from '@/lib/notifications/email'

const submitSchema = z.object({
  franchise_id: z.string().trim().uuid(),
  first_name: z.string().trim().min(1).max(120),
  last_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().max(40).optional().default(''),
  city: z.string().trim().max(120).optional().default(''),
  state: z.string().trim().max(60).optional().default(''),
  liquid_capital: z.coerce.number().min(0).max(1_000_000_000).optional().default(0),
  net_worth: z.coerce.number().min(0).max(1_000_000_000).optional().default(0),
  management_experience_years: z.coerce.number().min(0).max(80).optional().default(0),
  business_ownership: z.boolean().optional().default(false),
  franchise_experience: z.boolean().optional().default(false),
  timeline_to_open: z.string().trim().max(80).optional().default(''),
  why_this_franchise: z.string().trim().max(4000).optional().default(''),
  business_goals: z.string().trim().max(4000).optional().default(''),
}).strict()

export async function GET() {
  try {
    const admin = createAdminClient()
    const franchiseTable = await resolveWorkingTableName(admin, 'franchise', ['franchises'])
    const { data, error } = await admin
      .from(franchiseTable)
      .select('id, name')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) throw error
    return NextResponse.json({ franchises: data || [] })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message || 'Failed to load franchises' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsedBody = submitSchema.safeParse(await request.json())
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: 'Invalid application payload', details: parsedBody.error.flatten() },
        { status: 400 }
      )
    }

    const body = parsedBody.data
    const admin = createAdminClient()
    const franchiseTable = await resolveWorkingTableName(admin, 'franchise', ['franchises'])
    const applicationTable = await resolveWorkingTableName(admin, 'franchise_applications', ['applications'])

    const { data: franchise, error: franchiseError } = await admin
      .from(franchiseTable)
      .select('id, name, broker_email')
      .eq('id', body.franchise_id)
      .single()

    if (franchiseError || !franchise) {
      return NextResponse.json({ error: 'Selected franchise was not found' }, { status: 404 })
    }

    const insertPayload = {
      applicant_email: body.email.toLowerCase(),
      franchise_id: body.franchise_id,
      personal_info: {
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email.toLowerCase(),
        phone: body.phone || null,
        city: body.city || null,
        state: body.state || null,
      },
      financial_info: {
        liquid_capital: body.liquid_capital,
        net_worth: body.net_worth,
      },
      business_experience: {
        management_experience_years: body.management_experience_years,
        business_ownership: body.business_ownership,
        franchise_experience: body.franchise_experience,
      },
      franchise_specific: {
        timeline_to_open: body.timeline_to_open || null,
        why_this_franchise: body.why_this_franchise || null,
        business_goals: body.business_goals || null,
      },
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    }

    const { data: application, error: insertError } = await admin
      .from(applicationTable)
      .insert(insertPayload)
      .select('id')
      .single()

    if (insertError || !application) {
      const message = insertError?.message || 'Failed to submit application'
      return NextResponse.json({ error: message }, { status: 500 })
    }

    const { data: franchisorProfiles } = await admin
      .from('profiles')
      .select('email')
      .eq('role', 'franchisor')
      .eq('associated_franchise_id', body.franchise_id)

    const recipients = new Set<string>()
    if (franchise.broker_email) recipients.add(String(franchise.broker_email).toLowerCase())
    for (const row of franchisorProfiles || []) {
      if (row?.email) recipients.add(String(row.email).toLowerCase())
    }

    const applicantName = `${body.first_name} ${body.last_name}`.trim()
    await Promise.allSettled(
      Array.from(recipients).map((recipient) =>
        sendFranchiseApplicationNotificationEmail({
          to: recipient,
          franchiseName: franchise.name,
          applicantName,
          applicantEmail: body.email,
          applicationId: application.id,
        })
      )
    )

    return NextResponse.json({ success: true, id: application.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message || 'Failed to submit application' }, { status: 500 })
  }
}

async function resolveWorkingTableName(
  supabase: any,
  preferredTable: string,
  alternatives: string[] = []
): Promise<string> {
  const probePreferred = await supabase.from(preferredTable).select('id').limit(1)
  if (!probePreferred.error) return preferredTable

  const hintedTable = extractMissingTableFromSchemaCacheError(probePreferred.error)
  const candidates = [hintedTable, ...alternatives].filter(Boolean) as string[]

  for (const table of candidates) {
    const probe = await supabase.from(table).select('id').limit(1)
    if (!probe.error) return table
  }

  return preferredTable
}

function extractMissingTableFromSchemaCacheError(error: { hint?: string; message?: string } | null): string | null {
  const hint = error?.hint || ''
  const match = hint.match(/table 'public\.([^']+)'/i)
  if (match?.[1]) return match[1]

  const message = error?.message || ''
  const fromMessage = message.match(/table 'public\.([^']+)'/i)
  return fromMessage?.[1] || null
}
