import { requireFranchisor } from '@/lib/require-role'
import { createAdminClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText } from 'lucide-react'

export const dynamic = 'force-dynamic'

type ApplicationRow = {
  id: string
  applicant_email: string | null
  personal_info: Record<string, any> | null
  financial_info: Record<string, any> | null
  business_experience: Record<string, any> | null
  franchise_specific: Record<string, any> | null
  status: string | null
  submitted_at: string | null
  created_at: string | null
}

export default async function FranchisorApplicationsPage() {
  const { user } = await requireFranchisor('/dashboard/franchisor/applications')
  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('associated_franchise_id')
    .eq('id', user.id)
    .single()

  const franchiseId = profile?.associated_franchise_id || null
  let franchiseName = 'Your Franchise'
  let applications: ApplicationRow[] = []
  let loadError = ''

  if (franchiseId) {
    const franchiseTable = await resolveWorkingTableName(admin, 'franchise', ['franchises'])
    const { data: franchiseData } = await admin
      .from(franchiseTable)
      .select('name')
      .eq('id', franchiseId)
      .single()
    if (franchiseData?.name) franchiseName = franchiseData.name

    const applicationTable = await resolveWorkingTableName(admin, 'franchise_applications', ['applications'])
    const query = await admin
      .from(applicationTable)
      .select(
        'id, applicant_email, personal_info, financial_info, business_experience, franchise_specific, status, submitted_at, created_at'
      )
      .eq('franchise_id', franchiseId)
      .order('submitted_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (query.error) {
      loadError = query.error.message || 'Failed to load applications'
    } else {
      applications = (query.data || []) as ApplicationRow[]
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-brand-gold text-sm font-medium mb-1">Franchisor Dashboard</p>
          <h1 className="text-3xl font-bold">Applications</h1>
          <p className="text-gray-300 mt-1">Applications submitted for {franchiseName}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!franchiseId ? (
          <Card>
            <CardHeader>
              <CardTitle>No Franchise Linked</CardTitle>
              <CardDescription>
                Your account is not linked to a franchise listing yet. Ask an admin to set your associated franchise.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : loadError ? (
          <Card>
            <CardHeader>
              <CardTitle>Could Not Load Applications</CardTitle>
              <CardDescription>{loadError}</CardDescription>
            </CardHeader>
          </Card>
        ) : applications.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Franchise Applications</CardTitle>
              <CardDescription>No applications have been submitted yet.</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">New applications will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              const firstName = String(application.personal_info?.first_name || '').trim()
              const lastName = String(application.personal_info?.last_name || '').trim()
              const fullName = `${firstName} ${lastName}`.trim() || 'Unnamed applicant'
              const submittedAt = application.submitted_at || application.created_at

              return (
                <Card key={application.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-gray-900">{fullName}</h3>
                          <Badge variant="outline" className="capitalize">
                            {application.status || 'submitted'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{application.applicant_email || 'No email'}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Phone: {application.personal_info?.phone || 'Not provided'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Liquid Capital: {formatCurrency(application.financial_info?.liquid_capital)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Net Worth: {formatCurrency(application.financial_info?.net_worth)}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {submittedAt ? new Date(submittedAt).toLocaleString() : 'Unknown date'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function formatCurrency(value: unknown): string {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return 'Not provided'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}

async function resolveWorkingTableName(
  supabase: any,
  preferredTable: string,
  alternatives: string[] = []
): Promise<string> {
  const probePreferred = await supabase.from(preferredTable).select('id').limit(1)
  if (!probePreferred.error) return preferredTable

  const hintedTable = extractMissingTableFromSchemaCacheError(probePreferred.error)
  const candidates = [hintedTable, ...alternatives].filter(Boolean) as string[]

  for (const table of candidates) {
    const probe = await supabase.from(table).select('id').limit(1)
    if (!probe.error) return table
  }

  return preferredTable
}

function extractMissingTableFromSchemaCacheError(error: { hint?: string; message?: string } | null): string | null {
  const hint = error?.hint || ''
  const match = hint.match(/table 'public\.([^']+)'/i)
  if (match?.[1]) return match[1]

  const message = error?.message || ''
  const fromMessage = message.match(/table 'public\.([^']+)'/i)
  return fromMessage?.[1] || null
}
