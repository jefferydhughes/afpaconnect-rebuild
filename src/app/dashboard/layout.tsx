import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import TourManager from '@/components/onboarding/TourManager'
import {
  Home,
  Building2,
  Users,
  FileText,
  Settings,
  BarChart3,
  LogOut,
  Target,
  Mail,
  Briefcase,
  MapPin,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

async function getUserRole(userId: string) {
  // Use admin client so RLS on profiles table doesn't prevent reading own role
  const supabase = createAdminClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', userId)
    .single()

  return profile
}

// admin — full platform management
const adminNavItems = [
  { href: '/dashboard/admin', label: 'Overview', icon: Home },
  { href: '/dashboard/admin/franchises', label: 'Franchises', icon: Building2 },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users },
  { href: '/dashboard/admin/advisors', label: 'Advisors', icon: Briefcase },
  { href: '/dashboard/admin/leads', label: 'Leads', icon: Mail },
  { href: '/dashboard/admin/quizzes', label: 'Quiz Results', icon: FileText },
  { href: '/dashboard/admin/location-pages', label: 'Location Pages', icon: MapPin },
  { href: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
  { href: '/dashboard/admin/docs', label: 'Platform Guide', icon: BookOpen },
]

// advisor — franchise consultant who earns via referrals
const advisorNavItems = [
  { href: '/dashboard/advisor', label: 'Overview', icon: Home },
  { href: '/dashboard/advisor/leads', label: 'My Leads', icon: Users },
  { href: '/dashboard/advisor/ai-tools', label: 'AI Tools', icon: Target },
  { href: '/dashboard/advisor/settings', label: 'Settings', icon: Settings },
]

// franchisor — brand/franchisor managing their listings
const franchisorNavItems = [
  { href: '/dashboard/franchisor', label: 'Overview', icon: Home },
  { href: '/dashboard/franchisor/listings', label: 'My Listings', icon: Building2 },
  { href: '/dashboard/franchisor/leads', label: 'Leads', icon: Users },
  { href: '/dashboard/franchisor/applications', label: 'Applications', icon: FileText },
  { href: '/dashboard/franchisor/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/franchisor/settings', label: 'Settings', icon: Settings },
]

// franchise_rep — representative for a specific franchise brand
const franchiseRepNavItems = [
  { href: '/dashboard/franchise-rep', label: 'Overview', icon: Home },
  { href: '/dashboard/franchise-rep/leads', label: 'My Leads', icon: Users },
  { href: '/dashboard/franchise-rep/applications', label: 'Applications', icon: FileText },
  { href: '/dashboard/franchise-rep/settings', label: 'Settings', icon: Settings },
]

// user — prospective franchisee
const userNavItems = [
  { href: '/dashboard', label: 'Overview', icon: Home },
  { href: '/quiz', label: 'Take Quiz', icon: FileText },
  { href: '/directory', label: 'Browse Franchises', icon: Building2 },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirect=/dashboard')
  }

  const profile = await getUserRole(user.id)
  const role = profile?.role || 'user'

  let navItems = userNavItems
  if (role === 'admin') {
    navItems = adminNavItems
  } else if (role === 'advisor') {
    navItems = advisorNavItems
  } else if (role === 'franchisor') {
    navItems = franchisorNavItems
  } else if (role === 'franchise_rep') {
    navItems = franchiseRepNavItems
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar for mobile */}
      <div className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy">
            <span className="text-sm font-bold text-brand-gold">A</span>
          </div>
          <span className="font-bold text-brand-navy">AFPA</span>
        </Link>
        <span className="text-sm text-gray-500 capitalize">{role.replace(/_/g, ' ')} Dashboard</span>
      </div>

      <div className="flex">
        {/* Sidebar - hidden on mobile */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-1 bg-white border-r">
            {/* Logo */}
            <div className="flex items-center h-16 px-6 border-b">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-navy">
                  <span className="font-bold text-brand-gold">A</span>
                </div>
                <span className="text-lg font-bold text-brand-navy">AFPA</span>
              </Link>
            </div>

            {/* Role Badge */}
            <div className="px-6 py-4 border-b">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Dashboard</p>
              <p className="font-medium text-gray-900 capitalize">{role.replace(/_/g, ' ')}</p>
              {profile?.full_name && (
                <p className="text-sm text-gray-500 truncate">{profile.full_name}</p>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-brand-cream hover:text-brand-navy transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Sign Out */}
            <div className="p-4 border-t">
              <form action="/api/auth/signout" method="POST">
                <Button 
                  type="submit"
                  variant="ghost" 
                  className="w-full justify-start text-gray-600 hover:text-red-600"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:pl-64">
          {children}
        </main>
      </div>

      {/* Onboarding tour — fires once per role, config in /public/tours.json */}
      <TourManager role={role} />

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-3 py-2 text-gray-600 hover:text-brand-navy"
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
