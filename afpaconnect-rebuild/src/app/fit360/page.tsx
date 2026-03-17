import { createClient } from '@/lib/supabase/server'
import FranchiseFit360Assessment from '@/components/assessment/FranchiseFit360Assessment'

export const metadata = {
  title: 'FranchiseFit360™ Personality Assessment | AFPA',
  description: 'Discover your franchise personality profile with our 60-question psychometric assessment. Find the franchise type that fits who you are.',
}

export default async function Fit360Page() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }))

  return (
    <FranchiseFit360Assessment
      serverUser={user ? { id: user.id, email: user.email ?? undefined } : null}
    />
  )
}
