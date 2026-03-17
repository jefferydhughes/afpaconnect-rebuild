/**
 * Auth helpers that verify the user session (via JWT) and then look up the
 * profile role using the service-role admin client, bypassing any RLS policies
 * on the profiles table.  This is the correct pattern for server-side role
 * guards: authentication is validated by Supabase auth, authorization is
 * checked against the service-role read of the profiles table.
 */
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'

async function getAuthAndProfile() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, profile: null }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  return { user, profile }
}

/** Returns the current user + profile without enforcing a specific role. */
export async function getAuthUserRole() {
  return getAuthAndProfile()
}

/** Enforces admin role. Redirects to login or /dashboard if not authorized. */
export async function requireAdmin(loginRedirect = '/dashboard/admin') {
  const { user, profile } = await getAuthAndProfile()
  if (!user) redirect(`/login?redirect=${loginRedirect}`)
  if (!profile || profile.role !== 'admin') redirect('/dashboard')
  return { user: user!, profile: profile! }
}

/** Enforces advisor role. Redirects to login or /dashboard if not authorized. */
export async function requireAdvisor(loginRedirect = '/dashboard/advisor') {
  const { user, profile } = await getAuthAndProfile()
  if (!user) redirect(`/login?redirect=${loginRedirect}`)
  if (!profile || profile.role !== 'advisor') redirect('/dashboard')
  return { user: user!, profile: profile! }
}

/** Enforces franchisor role. Redirects to login or /dashboard if not authorized. */
export async function requireFranchisor(loginRedirect = '/dashboard/franchisor') {
  const { user, profile } = await getAuthAndProfile()
  if (!user) redirect(`/login?redirect=${loginRedirect}`)
  if (!profile || profile.role !== 'franchisor') redirect('/dashboard')
  return { user: user!, profile: profile! }
}

/** Enforces franchise_rep role. Redirects to login or /dashboard if not authorized. */
export async function requireFranchiseRep(loginRedirect = '/dashboard/franchise-rep') {
  const { user, profile } = await getAuthAndProfile()
  if (!user) redirect(`/login?redirect=${loginRedirect}`)
  if (!profile || profile.role !== 'franchise_rep') redirect('/dashboard')
  return { user: user!, profile: profile! }
}
