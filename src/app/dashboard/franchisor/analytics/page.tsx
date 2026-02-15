import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default async function FranchisorAnalyticsDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard/franchisor/analytics')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'franchisor') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-brand-gold text-sm font-medium mb-1">Franchisor Dashboard</p>
          <h1 className="text-3xl font-bold">Analytics</h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Performance Analytics</CardTitle>
            <CardDescription>Views, leads, and conversion data for your listings</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-16">
            <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Analytics coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
