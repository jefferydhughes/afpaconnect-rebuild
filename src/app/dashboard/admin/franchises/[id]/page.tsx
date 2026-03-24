import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-role'
import { ArrowLeft, ExternalLink, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import FranchiseForm from '@/components/admin/FranchiseForm'

// Resolves a franchise by UUID id or by slug (prefixed with "slug:")
async function resolveFranchise(identifier: string) {
  const adminSupabase = createAdminClient()

  // If the identifier starts with "slug:", look up by slug
  if (identifier.startsWith('slug:')) {
    const slug = identifier.slice(5)
    const { data } = await adminSupabase
      .from('franchise')
      .select('*')
      .eq('slug', slug)
      .single()
    return data
  }

  // Try by UUID first
  const { data: byId } = await adminSupabase
    .from('franchise')
    .select('*')
    .eq('id', identifier)
    .maybeSingle()

  if (byId) return byId

  // Fallback: try as slug directly (handles bookmarks, manual URLs)
  const { data: bySlug } = await adminSupabase
    .from('franchise')
    .select('*')
    .eq('slug', identifier)
    .maybeSingle()

  return bySlug
}

export default async function EditFranchisePage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { created?: string }
}) {
  await requireAdmin('/dashboard/admin/franchises')

  const franchise = await resolveFranchise(params.id)

  if (!franchise) notFound()

  const justCreated = searchParams.created === '1'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin/franchises">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <p className="text-brand-gold text-sm font-medium">Admin → Franchises</p>
              <h1 className="text-2xl font-bold">Edit: {franchise.name}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success banner shown after franchise creation */}
        {justCreated && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-5">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 text-lg">
                  Franchise created successfully!
                </h3>
                <p className="text-green-700 text-sm mt-1">
                  <strong>{franchise.name}</strong> is now live. Here are the pages that were automatically created:
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link
                    href={`/directory/${franchise.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-green-200 px-3 py-2 text-sm font-medium text-green-800 hover:bg-green-100 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Directory Listing Page
                  </Link>
                  <Link
                    href="/directory"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-green-200 px-3 py-2 text-sm font-medium text-green-800 hover:bg-green-100 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Full Directory
                  </Link>
                </div>
                <p className="text-green-600 text-xs mt-3">
                  You can continue editing below. All changes save automatically to the directory and listing pages.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <FranchiseForm franchise={franchise} />
        </div>
      </div>
    </div>
  )
}
