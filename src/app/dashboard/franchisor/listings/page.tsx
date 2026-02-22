import { requireFranchisor } from '@/lib/require-role'
import { createAdminClient } from '@/lib/supabase/server'
import { Building2, ExternalLink, Pencil } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function FranchisorListingsPage() {
  const { user } = await requireFranchisor('/dashboard/franchisor/listings')

  const admin = createAdminClient()

  // Get the franchise linked to this franchisor
  const { data: profile } = await admin
    .from('profiles')
    .select('associated_franchise_id')
    .eq('id', user.id)
    .single()

  let franchise = null
  if (profile?.associated_franchise_id) {
    const { data } = await admin
      .from('franchises')
      .select('*')
      .eq('id', profile.associated_franchise_id)
      .single()
    franchise = data
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-brand-gold text-sm font-medium mb-1">Franchisor Dashboard</p>
          <h1 className="text-3xl font-bold">My Listings</h1>
          <p className="text-gray-300 mt-1">Manage your franchise listing on AFPAConnect</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {franchise ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  {franchise.logo_url && (
                    <img
                      src={franchise.logo_url}
                      alt={franchise.name}
                      className="h-16 w-16 object-contain rounded-lg border bg-white p-1"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h2 className="text-xl font-bold text-gray-900">{franchise.name}</h2>
                      {franchise.listing_plan && (
                        <Badge className="bg-brand-gold text-brand-navy capitalize">
                          {franchise.listing_plan}
                        </Badge>
                      )}
                      {franchise.is_featured && (
                        <Badge variant="outline">Featured</Badge>
                      )}
                      <Badge variant={franchise.is_active ? 'default' : 'secondary'}>
                        {franchise.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {franchise.description && (
                      <p className="text-sm text-gray-500 max-w-lg">{franchise.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link href={`/directory/${franchise.slug}`} target="_blank">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      View Listing
                    </Button>
                  </Link>
                  <Link href={`/dashboard/franchisor/listings/${franchise.id}/edit`}>
                    <Button size="sm" className="bg-brand-navy text-white hover:bg-brand-navy-light">
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      Edit Listing Page
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Listing Found</CardTitle>
              <CardDescription>
                Your account hasn&apos;t been linked to a franchise listing yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-10">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Contact your administrator to get your franchise listing set up.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
