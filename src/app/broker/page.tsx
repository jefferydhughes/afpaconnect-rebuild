import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { 
  Building2,
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  ArrowRight,
  CheckCircle,
  Clock,
  Eye,
  Star,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

async function getBrokerData(userId: string) {
  const supabase = createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  const { data: franchises } = await supabase
    .from('franchises')
    .select('*')
    .eq('listed_by', userId)
    .order('created_at', { ascending: false })

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('broker_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .eq('broker_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  return {
    profile,
    franchises: franchises || [],
    leads: leads || [],
    applications: applications || [],
  }
}

export default async function BrokerDashboardPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirect=/broker')
  }

  const { profile, franchises, leads, applications } = await getBrokerData(user.id)

  const totalViews = franchises.reduce((sum: number, f: any) => sum + (f.view_count || 0), 0)
  const totalApplications = applications.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Broker Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your franchise listings and leads
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/broker/franchises/new">
                <Button className="bg-brand-navy text-brand-gold">
                  <Building2 className="mr-2 h-4 w-4" />
                  Add Listing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Listings</p>
                  <p className="text-2xl font-bold">{franchises.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-brand-navy" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Leads</p>
                  <p className="text-2xl font-bold">{leads.length}</p>
                </div>
                <Users className="h-8 w-8 text-brand-navy" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Views</p>
                  <p className="text-2xl font-bold">{totalViews}</p>
                </div>
                <Eye className="h-8 w-8 text-brand-navy" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Applications</p>
                  <p className="text-2xl font-bold">{totalApplications}</p>
                </div>
                <FileText className="h-8 w-8 text-brand-navy" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Leads */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Leads
                <Link href="/broker/leads">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leads.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No leads yet</p>
                  <p className="text-sm">Leads will appear here when prospects request information</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leads.slice(0, 5).map((lead: any) => (
                    <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{lead.name || lead.email}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={lead.status === 'new' ? 'default' : 'secondary'}>
                        {lead.status || 'New'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Applications
                <Link href="/broker/applications">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No applications yet</p>
                  <p className="text-sm">Applications will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.slice(0, 5).map((app: any) => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{app.applicant_name || 'Anonymous'}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={app.status === 'pending' ? 'default' : 'secondary'}>
                        {app.status || 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* My Listings */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              My Listings
              <Link href="/broker/franchises">
                <Button variant="ghost" size="sm">Manage All</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {franchises.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No listings yet</p>
                <Link href="/broker/franchises/new">
                  <Button className="mt-4">Create Your First Listing</Button>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {franchises.slice(0, 6).map((franchise: any) => (
                  <div key={franchise.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{franchise.name}</h3>
                      <Badge variant={franchise.is_active ? 'default' : 'secondary'}>
                        {franchise.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{franchise.category}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {franchise.view_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {franchise.lead_count || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
