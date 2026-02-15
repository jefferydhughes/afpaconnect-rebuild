import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Users, FileText, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function FranchiseRepDashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/dashboard/franchise-rep')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'franchise_rep') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div>
            <p className="text-brand-gold text-sm font-medium mb-1">Franchise Rep Dashboard</p>
            <h1 className="text-3xl font-bold">
              Welcome, {profile?.full_name?.split(' ')[0] || 'Rep'}!
            </h1>
            <p className="text-gray-300 mt-1">Manage your leads and applications</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your franchise rep activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/franchise-rep/leads" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                My Leads
              </Button>
            </Link>
            <Link href="/dashboard/franchise-rep/applications" className="block">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Applications
              </Button>
            </Link>
            <Link href="/dashboard/franchise-rep/settings" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
