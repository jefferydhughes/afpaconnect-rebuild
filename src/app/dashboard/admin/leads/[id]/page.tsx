import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-role'
import { notFound } from 'next/navigation'
import LeadDetailPanel from '@/components/leads/LeadDetailPanel'

export const metadata = { title: 'Lead Details | Admin Dashboard' }

async function getLeadDetail(id: string) {
  const supabase = createAdminClient()

  // Fetch lead
  const { data: lead, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !lead) return null

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

  // Fetch assigned advisor profile
  let advisor = null
  if (lead.attributed_advisor_id) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, advisor_image_url, advisor_specialties')
      .eq('id', lead.attributed_advisor_id)
      .single()
    advisor = data
  }

  return { lead, quizResult, franchises, advisor }
}

export default async function AdminLeadDetailPage({
  params,
}: {
  params: { id: string }
}) {
  await requireAdmin('/dashboard/admin/leads')
  const data = await getLeadDetail(params.id)

  if (!data) {
    notFound()
  }

  const franchisesMap = data.franchises.reduce(
    (acc: Record<string, any>, f: any) => {
      acc[f.id] = f
      return acc
    },
    {} as Record<string, any>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <LeadDetailPanel
        lead={data.lead}
        quizResult={data.quizResult}
        franchisesMap={franchisesMap}
        advisor={data.advisor}
        backPath="/dashboard/admin/leads"
        backLabel="Back to All Leads"
        role="admin"
      />
    </div>
  )
}
