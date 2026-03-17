import { createAdminClient } from '@/lib/supabase/server'
import { getAuthUserRole } from '@/lib/require-role'
import { redirect } from 'next/navigation'
import Fit360ProfilePage from '@/components/assessment/Fit360ProfilePage'
import { Brain } from 'lucide-react'

export const metadata = {
  title: 'FranchiseFit360™ Results | AFPA',
  description: 'View your FranchiseFit360 personality profile and franchise recommendations.',
}

interface Props {
  searchParams: { email?: string; profileId?: string }
}

export default async function Fit360ResultsPage({ searchParams }: Props) {
  const { user, profile } = await getAuthUserRole().catch(() => ({ user: null, profile: null }))

  const requestedEmail = searchParams.email
  const requestedProfileId = searchParams.profileId

  const supabase = createAdminClient()

  let profileData: any = null

  if (requestedProfileId) {
    // Direct profile ID lookup (e.g. from email link)
    const { data } = await supabase
      .from('fit360_profile')
      .select('*')
      .eq('id', requestedProfileId)
      .single()

    if (data) {
      // Permission check: must own the profile or be admin/franchisor
      const isOwner = user && data.user_id === user.id
      const isPrivileged = profile?.role === 'admin' || profile?.role === 'franchisor'
      if (!isOwner && !isPrivileged) redirect('/login')
      profileData = data
    }

  } else if (requestedEmail) {
    // Email-based lookup (admin/franchisor viewing a candidate)
    const isPrivileged = profile?.role === 'admin' || profile?.role === 'franchisor'
    const isOwnEmail = user?.email === requestedEmail

    if (!isPrivileged && !isOwnEmail) redirect('/login')

    const { data } = await supabase
      .from('fit360_profile')
      .select('*')
      .eq('email', requestedEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    profileData = data

  } else if (user) {
    // No params — show the current user's latest profile
    const { data } = await supabase
      .from('fit360_profile')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    profileData = data
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">No Profile Found</h2>
          <p className="text-slate-600 mb-6">
            {requestedEmail
              ? `No FranchiseFit360™ profile found for ${requestedEmail}.`
              : "You haven't completed the FranchiseFit360™ assessment yet."}
          </p>
          <a
            href="/fit360"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Take the Assessment
          </a>
        </div>
      </div>
    )
  }

  return <Fit360ProfilePage profileData={profileData} />
}
