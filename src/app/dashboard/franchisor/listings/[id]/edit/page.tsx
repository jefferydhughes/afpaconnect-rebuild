import { redirect } from 'next/navigation'
import { requireFranchisor } from '@/lib/require-role'
import { createAdminClient } from '@/lib/supabase/server'
import { FranchisorListingForm } from '@/components/franchisor/FranchisorListingForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const { user } = await requireFranchisor(
    `/dashboard/franchisor/listings/${params.id}/edit`
  )

  const admin = createAdminClient()

  // Verify this franchisor is linked to this listing
  const { data: profile } = await admin
    .from('profiles')
    .select('associated_franchise_id')
    .eq('id', user.id)
    .single()

  if (!profile?.associated_franchise_id || profile.associated_franchise_id !== params.id) {
    redirect('/dashboard/franchisor/listings')
  }

  // Fetch full franchise data
  const { data: franchise, error } = await admin
    .from('franchises')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !franchise) redirect('/dashboard/franchisor/listings')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/dashboard/franchisor/listings"
            className="inline-flex items-center text-brand-gold text-sm font-medium mb-3 hover:text-brand-gold-light"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to My Listings
          </Link>
          <p className="text-brand-gold text-sm font-medium mb-1">Franchisor Dashboard</p>
          <h1 className="text-3xl font-bold">Edit Listing</h1>
          <p className="text-gray-300 mt-1">{franchise.name}</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FranchisorListingForm franchise={franchise} />
      </div>
    </div>
  )
}
