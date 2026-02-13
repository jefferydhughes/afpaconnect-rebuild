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
  Calendar,
  MapPin,
  Mail,
  Phone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

async function getFranchisorData(userId: string) {
  const supabase = createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  const { data: franchises } = await supabase
    .from('franchises')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('franchisor_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .eq('franchisor_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  return {
    profile,
    franchises: franchises || [],
    leads: leads || [],
    applications: applications || [],
  }
}

export default async function FranchisorDashboardPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirect=/franchisor')
  }

  const { profile, franchises, leads, applications } = await getFranchisorData(user.id)

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
                Franchisor Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your franchise opportunities and applicants
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/franchisor/listings/new">
                <Button className="bg-brand-navy text-brand-gold">
                  <Building2 className="mr-2 h-4 w-4" />
                  Add Franchise
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
                  <p className="text-sm text-gray-500">Total Inquiries</p>
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
                  <p className="text-sm text-gray-500">Profile Views</p>
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
          {/* Recent Inquiries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Inquiries
                <Link href="/franchisor/leads">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leads.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No inquiries yet</p>
                  <p className="text-sm">Inquiries will appear here when prospects request information</p>
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
                      <div className="flex items-center gap-2">
                        <Badge variant={lead.status === 'new' ? 'default' : 'secondary'}>
                          {lead.status || 'New'}
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
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
                <Link href="/franchisor/applications">
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
                          {app.franchise_name && `Applied for: ${app.franchise_name}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            app.status === 'approved' ? 'default' : 
                            app.status === 'rejected' ? 'destructive' : 'secondary'
                          }
                        >
                          {app.status || 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* My Franchises */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              My Franchise Listings
              <Link href="/franchisor/listings">
                <Button variant="ghost" size="sm">Manage All</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {franchises.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No listings yet</p>
                <Link href="/franchisor/listings/new">
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

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Link href="/franchisor/profile">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-brand-navy" />
                <h3 className="font-semibold mb-2">Edit Profile</h3>
                <p className="text-sm text-gray-500">Update your franchisor profile information</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/franchisor/analytics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-brand-navy" />
                <h3 className="font-semibold mb-2">View Analytics</h3>
                <p className="text-sm text-gray-500">See detailed performance metrics</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/franchisor/settings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-brand-navy" />
                <h3 className="font-semibold mb-2">Settings</h3>
                <p className="text-sm text-gray-500">Manage notifications and preferences</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
