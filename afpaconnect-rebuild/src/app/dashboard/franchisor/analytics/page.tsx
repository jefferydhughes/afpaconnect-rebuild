import { requireFranchisor } from '@/lib/require-role'
import { createAdminClient } from '@/lib/supabase/server'
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'

export const dynamic = 'force-dynamic'

export default async function FranchisorAnalyticsPage() {
  const { user } = await requireFranchisor('/dashboard/franchisor/analytics')

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('associated_franchise_id')
    .eq('id', user.id)
    .single()

  const franchiseId = profile?.associated_franchise_id ?? undefined

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-brand-gold text-sm font-medium mb-1">Franchisor Dashboard</p>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-gray-300 mt-1">
            Track your marketing performance across all connected platforms
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnalyticsDashboard franchiseId={franchiseId} />
      </div>
    </div>
  )
}
