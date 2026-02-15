import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Settings, Globe, Bell, Shield, Database, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function AdminSettingsPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/dashboard/admin/settings')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div>
            <p className="text-brand-gold text-sm font-medium mb-1">Admin Dashboard</p>
            <h1 className="text-3xl font-bold">Platform Settings</h1>
            <p className="text-gray-300 mt-1">Manage system configuration and preferences</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Admin Account */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Admin Account</CardTitle>
                <CardDescription>Your administrator account details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Name</p>
                <p className="font-medium text-gray-900">{profile.full_name || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Role</p>
                <Badge className="bg-brand-navy text-white border-0 capitalize">{profile.role}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Account ID</p>
                <p className="font-mono text-xs text-gray-600 truncate">{user.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Globe className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>Platform Configuration</CardTitle>
                <CardDescription>General platform settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium text-gray-900">Platform Name</p>
                  <p className="text-sm text-gray-500">AFPAConnect</p>
                </div>
                <Badge className="bg-green-100 text-green-700 border-0">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium text-gray-900">AI Matching Engine</p>
                  <p className="text-sm text-gray-500">OpenAI GPT-4o-mini + Embeddings</p>
                </div>
                <Badge className="bg-green-100 text-green-700 border-0">Connected</Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium text-gray-900">Database</p>
                  <p className="text-sm text-gray-500">Supabase PostgreSQL</p>
                </div>
                <Badge className="bg-green-100 text-green-700 border-0">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium text-gray-900">Authentication</p>
                  <p className="text-sm text-gray-500">Supabase Auth</p>
                </div>
                <Badge className="bg-green-100 text-green-700 border-0">Enabled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Bell className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure admin alert preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'New Lead Alerts', description: 'Receive email when a new lead is generated', status: true },
                { label: 'New User Registrations', description: 'Notify on new platform signups', status: true },
                { label: 'Weekly Analytics Report', description: 'Summary of platform metrics every Monday', status: false },
                { label: 'System Health Alerts', description: 'Alerts for database or API issues', status: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  <Badge className={item.status ? 'bg-green-100 text-green-700 border-0' : 'bg-gray-100 text-gray-500 border-0'}>
                    {item.status ? 'On' : 'Off'}
                  </Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Notification configuration coming soon. Contact your development team to update these settings.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
