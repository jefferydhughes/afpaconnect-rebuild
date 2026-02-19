import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CandidateInsightsPanel from '@/components/advisor/CandidateInsightsPanel'

export const metadata = { title: 'AI Candidate Insights | Advisor Dashboard' }

export default async function AdvisorAiToolsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard/advisor/ai-tools')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'advisor') redirect('/dashboard')

  // Candidates = quiz results attributed to this advisor
  const { data: quizResults } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('attributed_advisor_id', user.id)
    .order('created_at', { ascending: false })

  // Lead records linked to this advisor (for status & saved notes)
  const { data: leads } = await supabase
    .from('leads')
    .select('id, email, quiz_result_id, status, notes')
    .eq('attributed_advisor_id', user.id)

  // Pre-fetch every franchise that appears in any candidate's matched list
  const allFranchiseIds = Array.from(
    new Set(
      (quizResults ?? []).flatMap((qr) => (qr.matched_franchises as string[] | null) ?? [])
    )
  )

  let franchisesMap: Record<string, any> = {}
  if (allFranchiseIds.length > 0) {
    const { data: franchises } = await supabase
      .from('franchises')
      .select('id, name, category, slug, logo_url, initial_investment_min, initial_investment_max')
      .in('id', allFranchiseIds)

    franchisesMap = (franchises ?? []).reduce(
      (acc, f) => { acc[f.id] = f; return acc },
      {} as Record<string, any>
    )
  }

  // Enrich each quiz result with its matching lead record
  const candidates = (quizResults ?? []).map((qr) => {
    const lead = (leads ?? []).find(
      (l) => l.quiz_result_id === qr.id || l.email === qr.email
    )
    return {
      ...qr,
      lead_id: lead?.id ?? null,
      lead_status: lead?.status ?? 'new',
      lead_notes: lead?.notes ?? '',
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-brand-gold text-sm font-medium mb-1">Advisor Dashboard</p>
          <h1 className="text-3xl font-bold">AI Candidate Insights</h1>
          <p className="text-gray-300 mt-1">
            Review quiz data, matched brands, and call prep for each of your candidates
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CandidateInsightsPanel
          advisorId={user.id}
          candidates={candidates}
          franchisesMap={franchisesMap}
        />
      </div>
    </div>
  )
}
