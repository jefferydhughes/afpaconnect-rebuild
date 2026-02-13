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
  Phone,
  Link2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

async function getPartnerData(userId: string) {
  const supabase = createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  const { data: partnerships } = await supabase
    .from('partnerships')
    .select('*')
    .eq('partner_id', userId)
    .order('created_at', { ascending: false })

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('partner_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: commissions } = await supabase
    .from('commissions')
    .select('*')
    .eq('partner_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  return {
    profile,
    partnerships: partnerships || [],
    leads: leads || [],
    commissions: commissions || [],
  }
}

export default async function PartnerDashboardPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirect=/partner')
  }

  const { profile, partnerships, leads, commissions } = await getPartnerData(user.id)

  const totalRevenue = commissions.reduce((sum: number, c: any) => sum + (c.amount || 0), 0)
  const pendingCommissions = commissions
    .filter((c: any) => c.status === 'pending')
    .reduce((sum: number, c: any) => sum + (c.amount || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Partner Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your partnerships and track your earnings
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/partner/referrals">
                <Button className="bg-brand-navy text-brand-gold">
                  <Users className="mr-2 h-4 w-4" />
                  Invite Partner
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Partnerships</p>
                  <p className="text-2xl font-bold">{partnerships.length}</p>
                </div>
                <Link2 className="h-8 w-8 text-brand-navy" />
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
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold">${pendingCommissions.toLocaleString()}</p>
                </div>
                <Clock className="h-8 w-8 text-brand-navy" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Leads
                <Link href="/partner/leads">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leads.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No leads yet</p>
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
                      <Badge variant={lead.status === 'converted' ? 'default' : 'secondary'}>
                        {lead.status === 'converted' ? 'Converted' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Commissions
                <Link href="/partner/commissions">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {commissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No commissions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {commissions.slice(0, 5).map((commission: any) => (
                    <div key={commission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">${commission.amount?.toLocaleString() || 0}</p>
                        <p className="text-sm text-gray-500">
                          {commission.description || 'Referral commission'}
                        </p>
                      </div>
                      <Badge variant={commission.status === 'paid' ? 'default' : 'secondary'}>
                        {commission.status || 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>My Partnerships</CardTitle>
          </CardHeader>
          <CardContent>
            {partnerships.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active partnerships</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {partnerships.slice(0, 6).map((partnership: any) => (
                  <div key={partnership.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{partnership.name || partnership.company_name}</h3>
                      <Badge variant={partnership.status === 'active' ? 'default' : 'secondary'}>
                        {partnership.status || 'Active'}
                      </Badge>
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
