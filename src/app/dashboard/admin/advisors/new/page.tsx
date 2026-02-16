// import { redirect } from 'next/navigation'
import Link from 'next/link'
// import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AdvisorForm from '@/components/admin/AdvisorForm'

export default async function NewAdvisorPage() {
  // TODO: RE-ENABLE AUTH BEFORE PRODUCTION
  // const supabase = createClient()
  // const { data: { user } } = await supabase.auth.getUser()
  // if (!user) redirect('/login?redirect=/dashboard/admin/advisors/new')
  // const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  // if (!profile || profile.role !== 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin/advisors">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <p className="text-brand-gold text-sm font-medium">Admin &rarr; Advisors</p>
              <h1 className="text-2xl font-bold">Add New Advisor</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <AdvisorForm />
        </div>
      </div>
    </div>
  )
}
