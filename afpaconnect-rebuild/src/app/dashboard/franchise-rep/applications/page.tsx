import { requireFranchiseRep } from '@/lib/require-role'
import { FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default async function FranchiseRepApplicationsPage() {
  await requireFranchiseRep('/dashboard/franchise-rep/applications')
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-brand-gold text-sm font-medium mb-1">Franchise Rep Dashboard</p>
          <h1 className="text-3xl font-bold">Applications</h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader><CardTitle>Franchise Applications</CardTitle><CardDescription>Applications from interested prospects</CardDescription></CardHeader>
          <CardContent className="text-center py-16">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No applications yet.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
