import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Advisor, Profile } from '@/types/database'

/**
 * Admin-only maintenance endpoint.
 *
 * For every advisor in the `advisor` table that has an email but no matching
 * Supabase auth user, send an invitation email so they can set a password.
 * The DB trigger on `auth.users` will create the matching row in `profiles`;
 * we also upgrade that profile's role to `advisor` and set `created_by` on
 * the advisor record so the two are linked.
 */
export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const callerRole = (callerProfile as Pick<Profile, 'role'> | null)?.role
  if (callerRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()

  const { data: advisorsData, error: advisorsError } = await admin
    .from('advisor')
    .select('id, email, name, created_by')

  if (advisorsError) {
    return NextResponse.json({ error: advisorsError.message }, { status: 500 })
  }

  const advisors = (advisorsData || []) as Pick<
    Advisor,
    'id' | 'email' | 'name' | 'created_by'
  >[]

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  const redirectTo = `${siteUrl.replace(/\/+$/, '')}/reset-password`

  const results = {
    total: advisors.length,
    skipped_no_email: 0,
    already_linked: 0,
    linked_existing: 0,
    invited: 0,
    errors: [] as { advisorId: string; email: string | null; error: string }[],
  }

  for (const advisor of advisors) {
    const rawEmail = advisor.email?.trim().toLowerCase()
    if (!rawEmail) {
      results.skipped_no_email += 1
      continue
    }

    try {
      // Does a profile already exist for this email?
      const { data: profileRow } = await admin
        .from('profiles')
        .select('id, role')
        .eq('email', rawEmail)
        .maybeSingle()

      const existingProfile = profileRow as Pick<Profile, 'id' | 'role'> | null

      if (existingProfile?.id) {
        // Promote to advisor role if needed
        if (existingProfile.role !== 'admin' && existingProfile.role !== 'advisor') {
          const profilesTable = admin.from('profiles') as any
          await profilesTable
            .update({ role: 'advisor' })
            .eq('id', existingProfile.id)
        }
        // Link advisor.created_by to the user if not already set
        if (!advisor.created_by) {
          const advisorTable = admin.from('advisor') as any
          await advisorTable
            .update({ created_by: existingProfile.id })
            .eq('id', advisor.id)
          results.linked_existing += 1
        } else {
          results.already_linked += 1
        }
        continue
      }

      // No profile — send an invite so they can set a password
      const { data: invited, error: inviteError } =
        await admin.auth.admin.inviteUserByEmail(rawEmail, {
          data: advisor.name ? { full_name: advisor.name } : undefined,
          redirectTo,
        })

      if (inviteError || !invited?.user?.id) {
        results.errors.push({
          advisorId: advisor.id,
          email: rawEmail,
          error: inviteError?.message || 'Invite returned no user',
        })
        continue
      }

      const profilesTable = admin.from('profiles') as any
      await profilesTable
        .update({ role: 'advisor', full_name: advisor.name ?? undefined })
        .eq('id', invited.user.id)

      const advisorTable = admin.from('advisor') as any
      await advisorTable
        .update({ created_by: invited.user.id })
        .eq('id', advisor.id)

      results.invited += 1
    } catch (err: any) {
      results.errors.push({
        advisorId: advisor.id,
        email: rawEmail,
        error: err?.message || 'Unknown error',
      })
    }
  }

  return NextResponse.json({ success: true, results })
}
