import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-role'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Search, Building2, Edit, Eye, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import DeleteFranchiseButton from '@/components/admin/DeleteFranchiseButton'
import { formatCurrency } from '@/lib/utils'
import type { Franchise } from '@/types/database'

async function getFranchises(supabase: any, search?: string, page = 1) {
  const pageSize = 50
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('franchise')
    .select('*', { count: 'exact' })
    .order('name')
    .range(from, to)

  if (search) query = query.ilike('name', `%${search}%`)

  const { data, count } = await query
  return { franchises: (data || []) as Franchise[], total: count || 0, pageSize }
}

export default async function AdminFranchisesPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string }
}) {
  await requireAdmin('/dashboard/admin/franchises')

  const parsedPage = Number.parseInt(searchParams.page ?? '1', 10)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1
  const { franchises, total, pageSize } = await getFranchises(createAdminClient(), searchParams.search, page)
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Franchises</h1>
          <p className="text-gray-500 text-sm">{total} total franchises</p>
        </div>
        <Link href="/dashboard/admin/franchises/new">
          <Button className="bg-brand-navy text-brand-gold hover:bg-brand-navy-light">
            <Plus className="mr-2 h-4 w-4" />
            Add Franchise
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <form className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                name="search"
                placeholder="Search by franchise name..."
                defaultValue={searchParams.search}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
            {searchParams.search && (
              <Link href="/dashboard/admin/franchises">
                <Button variant="outline">Clear</Button>
              </Link>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Franchise</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Investment</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {franchises.map((franchise: Franchise) => (
                  <tr key={franchise.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border">
                          {franchise.logo_url ? (
                            <Image
                              src={franchise.logo_url}
                              alt={franchise.name || 'Franchise logo'}
                              width={36}
                              height={36}
                              className="object-contain"
                            />
                          ) : (
                            <Building2 className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-gray-900 text-sm">{franchise.name}</p>
                            {franchise.is_featured && (
                              <Star className="h-3.5 w-3.5 text-brand-gold fill-brand-gold" />
                            )}
                          </div>
                          <p className="text-xs text-gray-400">{franchise.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <Badge variant="outline" className="text-xs capitalize">
                        {franchise.category?.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 hidden lg:table-cell">
                      {franchise.initial_investment_min && franchise.initial_investment_max ? (
                        <span>{formatCurrency(franchise.initial_investment_min)} – {formatCurrency(franchise.initial_investment_max)}</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={franchise.is_active
                        ? 'bg-green-100 text-green-700 border-0 text-xs'
                        : 'bg-gray-100 text-gray-500 border-0 text-xs'
                      }>
                        {franchise.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/directory/${franchise.slug}`} target="_blank">
                          <Button variant="ghost" size="sm" className="text-gray-500 h-8 px-2">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/admin/franchises/${franchise.id}`}>
                          <Button variant="ghost" size="sm" className="text-brand-navy h-8 px-2">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                        <DeleteFranchiseButton id={franchise.id} name={franchise.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {franchises.length === 0 && (
            <div className="text-center py-16">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No franchises found</h3>
              <p className="text-gray-500 mb-4">
                {searchParams.search ? `No results for "${searchParams.search}"` : 'Get started by adding your first franchise'}
              </p>
              <Link href="/dashboard/admin/franchises/new">
                <Button className="bg-brand-navy text-brand-gold">Add Franchise</Button>
              </Link>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages} · {total} franchises
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={`?${new URLSearchParams({ ...(searchParams.search ? { search: searchParams.search } : {}), page: String(page - 1) })}`}>
                    <Button variant="outline" size="sm">Previous</Button>
                  </Link>
                )}
                {page < totalPages && (
                  <Link href={`?${new URLSearchParams({ ...(searchParams.search ? { search: searchParams.search } : {}), page: String(page + 1) })}`}>
                    <Button variant="outline" size="sm">Next</Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
