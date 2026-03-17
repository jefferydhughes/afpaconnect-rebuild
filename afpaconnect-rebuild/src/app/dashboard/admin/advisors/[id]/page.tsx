import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-role'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AdvisorForm from '@/components/admin/AdvisorForm'

export default async function EditAdvisorPage({
  params,
}: {
  params: { id: string }
}) {
  await requireAdmin('/dashboard/admin/advisors')

  const adminSupabase = createAdminClient()
  const { data: advisor } = await adminSupabase
    .from('advisor')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!advisor) notFound()

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
              <h1 className="text-2xl font-bold">Edit: {advisor.name}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <AdvisorForm advisor={advisor} />
        </div>
      </div>
    </div>
  )
}
