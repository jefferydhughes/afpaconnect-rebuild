import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Settings, User, Link as LinkIcon, Copy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function AdvisorSettingsPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/dashboard/advisor/settings')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'advisor') {
    redirect('/dashboard')
  }

  const affiliateLink = `https://afpaconnect.com/quiz?advisor=${user.id}`

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div>
            <p className="text-brand-gold text-sm font-medium mb-1">Advisor Dashboard</p>
            <h1 className="text-3xl font-bold">Profile & Settings</h1>
            <p className="text-gray-300 mt-1">Manage your advisor profile and preferences</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Advisor Profile</CardTitle>
                <CardDescription>Your public-facing advisor information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Full Name</p>
                <p className="font-medium text-gray-900">{profile.full_name || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Role</p>
                <Badge className="bg-brand-navy text-white border-0">Advisor</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Member Since</p>
                <p className="font-medium text-gray-900">
                  {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400 pt-2">
              To update your profile information, please contact support at support@afpaconnect.com
            </p>
          </CardContent>
        </Card>

        {/* Affiliate Link */}
        <Card className="border-brand-gold bg-brand-cream">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-navy rounded-lg">
                <LinkIcon className="h-5 w-5 text-brand-gold" />
              </div>
              <div>
                <CardTitle>Your Affiliate Link</CardTitle>
                <CardDescription>Share this link to track leads back to you</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-white rounded-lg text-sm border truncate">
                {affiliateLink}
              </code>
              <Button
                size="sm"
                variant="outline"
                className="flex-shrink-0 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white"
                onClick={() => {}}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              All quiz submissions via this link will be attributed to your account. Share it on social media,
              email campaigns, and with prospects.
            </p>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Security and account preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="font-medium text-gray-900">Password</p>
                <p className="text-sm text-gray-500">Last changed: unknown</p>
              </div>
              <Button variant="outline" size="sm">
                Change Password
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive alerts for new leads</p>
              </div>
              <Badge className="bg-green-100 text-green-700 border-0">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-red-200">
              <div>
                <p className="font-medium text-red-600">Sign Out</p>
                <p className="text-sm text-gray-500">Sign out of your account</p>
              </div>
              <form action="/api/auth/signout" method="POST">
                <Button type="submit" variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50">
                  Sign Out
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
