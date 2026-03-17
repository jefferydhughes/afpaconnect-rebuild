import Link from 'next/link'
import { requireFranchisor } from '@/lib/require-role'
import { Building2, Users, BarChart3, Settings, PlusCircle, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function FranchisorDashboardPage() {
  const { profile } = await requireFranchisor('/dashboard/franchisor')
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brand-gold text-sm font-medium mb-1">Franchisor Dashboard</p>
              <h1 className="text-3xl font-bold">Welcome, {profile?.full_name?.split(' ')[0] || 'Franchisor'}!</h1>
              <p className="text-gray-300 mt-1">Manage your franchise listings and leads</p>
            </div>
            <div className="hidden md:flex gap-3">
              <Link href="/dashboard/franchisor/listings/new">
                <Button className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light"><PlusCircle className="mr-2 h-4 w-4" />Add Listing</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card><CardContent className="p-6 flex items-center gap-4"><div className="p-3 bg-blue-100 rounded-lg"><Building2 className="h-6 w-6 text-blue-600" /></div><div><p className="text-2xl font-bold text-gray-900">—</p><p className="text-sm text-gray-500">Active Listings</p></div></CardContent></Card>
          <Card><CardContent className="p-6 flex items-center gap-4"><div className="p-3 bg-green-100 rounded-lg"><Users className="h-6 w-6 text-green-600" /></div><div><p className="text-2xl font-bold text-gray-900">—</p><p className="text-sm text-gray-500">New Leads</p></div></CardContent></Card>
          <Card><CardContent className="p-6 flex items-center gap-4"><div className="p-3 bg-purple-100 rounded-lg"><BarChart3 className="h-6 w-6 text-purple-600" /></div><div><p className="text-2xl font-bold text-gray-900">—</p><p className="text-sm text-gray-500">Profile Views</p></div></CardContent></Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle><CardDescription>Manage your franchise presence on AFPAConnect</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/franchisor/listings" className="block"><Button variant="outline" className="w-full justify-start"><Building2 className="mr-2 h-4 w-4" />Manage Listings</Button></Link>
            <Link href="/dashboard/franchisor/leads" className="block"><Button variant="outline" className="w-full justify-start"><Users className="mr-2 h-4 w-4" />View Leads</Button></Link>
            <Link href="/dashboard/franchisor/applications" className="block"><Button variant="outline" className="w-full justify-start"><FileText className="mr-2 h-4 w-4" />View Applications</Button></Link>
            <Link href="/dashboard/franchisor/analytics" className="block"><Button variant="outline" className="w-full justify-start"><BarChart3 className="mr-2 h-4 w-4" />View Analytics</Button></Link>
            <Link href="/dashboard/franchisor/settings" className="block"><Button variant="outline" className="w-full justify-start"><Settings className="mr-2 h-4 w-4" />Settings</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
