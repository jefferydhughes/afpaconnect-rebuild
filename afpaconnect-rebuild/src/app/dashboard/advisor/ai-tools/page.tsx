import { requireAdvisor } from '@/lib/require-role'
import { createAdminClient } from '@/lib/supabase/server'
import CandidateInsightsPanel from '@/components/advisor/CandidateInsightsPanel'

export const metadata = { title: 'AI Candidate Insights | Advisor Dashboard' }

export default async function AdvisorAiToolsPage() {
  const { user } = await requireAdvisor('/dashboard/advisor/ai-tools')
  const supabase = createAdminClient()
  const { data: quizResults } = await supabase.from('quiz_results').select('*').eq('attributed_advisor_id', user.id).order('created_at', { ascending: false })
  const { data: leads } = await supabase.from('leads').select('id, email, quiz_result_id, status, notes').eq('attributed_advisor_id', user.id)
  const allFranchiseIds = Array.from(new Set((quizResults ?? []).flatMap((qr) => (qr.matched_franchises as string[] | null) ?? [])))
  let franchisesMap: Record<string, any> = {}
  if (allFranchiseIds.length > 0) {
    const { data: franchises } = await supabase.from('franchise').select('id, name, category, slug, logo_url, initial_investment_min, initial_investment_max').in('id', allFranchiseIds)
    franchisesMap = (franchises ?? []).reduce((acc, f) => { acc[f.id] = f; return acc }, {} as Record<string, any>)
  }
  const candidates = (quizResults ?? []).map((qr) => {
    const lead = (leads ?? []).find((l) => l.quiz_result_id === qr.id || l.email === qr.email)
    return { ...qr, lead_id: lead?.id ?? null, lead_status: lead?.status ?? 'new', lead_notes: lead?.notes ?? ''}
  })
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-brand-gold text-sm font-medium mb-1">Advisor Dashboard</p>
          <h1 className="text-3xl font-bold">AI Candidate Insights</h1>
          <p className="text-gray-300 mt-1">Review quiz data, matched brands, and call prep for each of your candidates</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CandidateInsightsPanel advisorId={user.id} candidates={candidates} franchisesMap={franchisesMap} />
      </div>
    </div>
  )
}
