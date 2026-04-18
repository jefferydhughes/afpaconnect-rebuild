import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Advisor, Profile } from '@/types/database'
import { z } from 'zod'

const advisorPayloadSchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().min(1).max(120).optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  title: z.string().trim().max(120).optional().nullable(),
  bio: z.string().trim().max(5000).optional().nullable(),
  image_url: z.string().trim().url().max(2048).optional().nullable(),
  video_url: z.string().trim().url().max(2048).optional().nullable(),
  calendar_embed_code: z.string().trim().max(12000).optional().nullable(),
  blog_url: z.string().trim().url().max(2048).optional().nullable(),
  linkedin: z.string().trim().url().max(2048).optional().nullable(),
  personal_quote: z.string().trim().max(1000).optional().nullable(),
  testimonials: z.array(z.object({
    quote: z.string().trim().min(1).max(1000),
    author: z.string().trim().min(1).max(200),
  })).max(20).optional().nullable(),
  credentials: z.array(z.string().trim().min(1).max(200)).max(50).optional().nullable(),
  specialties: z.array(z.string().trim().min(1).max(200)).max(50).optional().nullable(),
  years_experience: z.number().int().min(0).max(80).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
  state: z.string().trim().length(2).optional().nullable(),
  display_order: z.number().int().min(0).max(100000).optional().nullable(),
  is_active: z.boolean().optional().nullable(),
  is_leadership: z.boolean().optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
}).strict()

/**
 * Ensures there is a Supabase auth user + profile for this advisor email.
 * Returns the auth user id. If one already exists, it's reused (and its
 * profile is upgraded to role='advisor' if needed). If not, a new user is
 * invited so they can set their own password.
 */
async function ensureAdvisorUser(
  adminClient: ReturnType<typeof createAdminClient>,
  email: string,
  fullName: string | null
): Promise<{ userId: string; invited: boolean } | { error: string }> {
  const normalizedEmail = email.toLowerCase()

  // 1) Does a profile already exist with this email?
  const { data: existingProfile } = await adminClient
    .from('profiles')
    .select('id, role')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (existingProfile?.id) {
    if (existingProfile.role !== 'admin' && existingProfile.role !== 'advisor') {
      const profilesTable = adminClient.from('profiles') as any
      await profilesTable
        .update({ role: 'advisor', full_name: fullName ?? undefined })
        .eq('id', existingProfile.id)
    }
    return { userId: existingProfile.id, invited: false }
  }

  // 2) No profile — invite via Supabase Auth. The DB trigger creates a profile.
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const redirectTo = `${siteUrl.replace(/\/+$/, '')}/reset-password`

  const { data: invited, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    normalizedEmail,
    {
      data: fullName ? { full_name: fullName } : undefined,
      redirectTo,
    }
  )

  if (inviteError || !invited?.user?.id) {
    return { error: inviteError?.message || 'Failed to invite advisor user' }
  }

  // Promote their profile to advisor role
  const profilesTable = adminClient.from('profiles') as any
  await profilesTable
    .update({ role: 'advisor', full_name: fullName ?? undefined })
    .eq('id', invited.user.id)

  return { userId: invited.user.id, invited: true }
}

export async function POST(request: NextRequest) {
  try {
    // Verify caller is admin
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const profile = profileData as Pick<Profile, 'role'> | null

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const parsedBody = advisorPayloadSchema.safeParse(await request.json())
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: 'Invalid advisor payload', details: parsedBody.error.flatten() },
        { status: 400 }
      )
    }
    const payload = parsedBody.data
    const normalizedEmail = payload.email.toLowerCase()

    const adminClient = createAdminClient()

    // Ensure an auth user / profile exists for this advisor
    const userResult = await ensureAdvisorUser(
      adminClient,
      normalizedEmail,
      payload.name ?? null
    )
    if ('error' in userResult) {
      return NextResponse.json({ error: userResult.error }, { status: 400 })
    }

    // Insert into the advisor table
    const advisorTable = adminClient.from('advisor') as any
    const { data: advisorData, error: insertError } = await advisorTable
      .insert({
        ...payload,
        email: normalizedEmail,
        name: payload.name || null,
        created_by: userResult.userId,
      })
      .select('id')
      .single()

    const advisor = advisorData as Pick<Advisor, 'id'> | null

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    if (!advisor) {
      return NextResponse.json({ error: 'Advisor creation failed' }, { status: 500 })
    }

    return NextResponse.json({
      id: advisor.id,
      userId: userResult.userId,
      invited: userResult.invited,
      success: true,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
