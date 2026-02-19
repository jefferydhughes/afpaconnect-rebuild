import { requireFranchiseRep } from '@/lib/require-role'
import { Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default async function FranchiseRepLeadsPage() {
  await requireFranchiseRep('/dashboard/franchise-rep/leads')
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-brand-gold text-sm font-medium mb-1">Franchise Rep Dashboard</p>
          <h1 className="text-3xl font-bold">My Leads</h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader><CardTitle>Assigned Leads</CardTitle><CardDescription>Prospects assigned to you for follow-up</CardDescription></CardHeader>
          <CardContent className="text-center py-16">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No leads assigned yet.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
