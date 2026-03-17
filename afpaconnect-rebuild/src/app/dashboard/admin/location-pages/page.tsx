export const dynamic = 'force-dynamic'

import { requireAdmin } from '@/lib/require-role'
import { createAdminClient } from '@/lib/supabase/server'
import LocationPageManager from '@/components/admin/LocationPageManager'

export const metadata = {
  title: 'Location Pages | Admin',
}

export default async function AdminLocationPagesPage() {
  await requireAdmin('/dashboard/admin')

  // Pre-fetch initial data server-side so the component hydrates immediately
  const admin = createAdminClient()
  const { data: locationPages } = await admin
    .from('location_pages')
    .select('*')
    .order('created_at', { ascending: false })

  // Also fetch franchise list so admin can look up descriptions for AI prompts
  const franchiseTable = await (async () => {
    const probe = await admin.from('franchise').select('id').limit(1)
    return probe.error ? 'franchises' : 'franchise'
  })()
  const { data: franchises } = await admin
    .from(franchiseTable)
    .select('id, name, slug, category, description')
    .order('name', { ascending: true })

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Location Pages</h1>
        <p className="text-gray-500 mt-1">
          Manage programmatic SEO pages for franchise &times; city combinations.
          Pages are served at <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">/franchises/[brand]/[city]</code>.
        </p>
      </div>
      <LocationPageManager
        initialPages={locationPages ?? []}
        franchises={franchises ?? []}
      />
    </div>
  )
}
