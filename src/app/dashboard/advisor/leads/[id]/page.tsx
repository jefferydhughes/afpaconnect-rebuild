import { createAdminClient } from '@/lib/supabase/server'
import { requireAdvisor } from '@/lib/require-role'
import { notFound, redirect } from 'next/navigation'
import LeadDetailPanel from '@/components/leads/LeadDetailPanel'

export const metadata = { title: 'Lead Details | Advisor Dashboard' }

export default async function AdvisorLeadDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { user } = await requireAdvisor('/dashboard/advisor/leads')
  const supabase = createAdminClient()

  // Fetch lead — must belong to this advisor
  const { data: lead, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !lead) notFound()

  // Verify this lead belongs to the current advisor
  if (lead.attributed_advisor_id !== user.id) {
    redirect('/dashboard/advisor/leads')
  }

  // Fetch linked quiz result
  let quizResult = null
  if (lead.quiz_result_id) {
    const { data } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', lead.quiz_result_id)
      .single()
    quizResult = data
  } else if (lead.email) {
    const { data } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('email', lead.email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    quizResult = data
  }

  // Fetch matched franchises
  let franchises: any[] = []
  const matchedIds = (quizResult?.matched_franchises as string[]) || []
  if (matchedIds.length > 0) {
    const { data } = await supabase
      .from('franchise')
      .select(
        'id, name, slug, category, logo_url, initial_investment_min, initial_investment_max, business_model, time_commitment'
      )
      .in('id', matchedIds)
    franchises = data || []
  }

  // Advisor profile (self)
  const { data: advisor } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, advisor_image_url, advisor_specialties')
    .eq('id', user.id)
    .single()

  const franchisesMap = franchises.reduce(
    (acc: Record<string, any>, f: any) => {
      acc[f.id] = f
      return acc
    },
    {} as Record<string, any>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <LeadDetailPanel
        lead={lead}
        quizResult={quizResult}
        franchisesMap={franchisesMap}
        advisor={advisor}
        backPath="/dashboard/advisor/leads"
        backLabel="Back to My Leads"
        role="advisor"
      />
    </div>
  )
}
