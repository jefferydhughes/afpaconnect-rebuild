import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserCheck, Mail, Phone, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

async function getAdvisors() {
  const supabase = createClient()

  const { data: advisors } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'advisor')
    .order('created_at', { ascending: false })

  if (!advisors) return []

  // Get lead counts per advisor
  const advisorsWithStats = await Promise.all(
    advisors.map(async (advisor) => {
      const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('attributed_advisor_id', advisor.id)

      const { count: convertedLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('attributed_advisor_id', advisor.id)
        .eq('status', 'converted')

      return {
        ...advisor,
        totalLeads: totalLeads || 0,
        convertedLeads: convertedLeads || 0,
      }
    })
  )

  return advisorsWithStats
}

export default async function AdminAdvisorsPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/dashboard/admin/advisors')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  const advisors = await getAdvisors()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brand-gold text-sm font-medium mb-1">Admin Dashboard</p>
              <h1 className="text-3xl font-bold">Manage Advisors</h1>
              <p className="text-gray-300 mt-1">
                {advisors.length} active advisor{advisors.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>All Advisors</CardTitle>
            <CardDescription>Franchise advisors registered on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {advisors.length > 0 ? (
              <div className="space-y-3">
                {advisors.map((advisor) => (
                  <div
                    key={advisor.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:border-brand-gold transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-brand-cream flex items-center justify-center">
                        <span className="font-semibold text-brand-navy">
                          {advisor.full_name?.[0] || advisor.email?.[0]?.toUpperCase() || 'A'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {advisor.full_name || 'Unnamed Advisor'}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          {advisor.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {advisor.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-900">{advisor.totalLeads} leads</p>
                        <p className="text-xs text-gray-500">{advisor.convertedLeads} converted</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-0">Active</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">No advisors yet</h3>
                <p className="text-gray-500">
                  Advisors will appear here once they register on the platform.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
