import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Search, UserCheck, Edit, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import DeleteAdvisorButton from '@/components/admin/DeleteAdvisorButton'

async function getAdvisors(search?: string, page = 1) {
  const supabase = createClient()
  const pageSize = 50
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('advisor')
    .select('*', { count: 'exact' })
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })
    .range(from, to)

  if (search) query = query.ilike('name', `%${search}%`)

  const { data, count } = await query
  return { advisors: data || [], total: count || 0, pageSize }
}

export default async function AdminAdvisorsPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string }
}) {
  const page = parseInt(searchParams.page ?? '1', 10)
  const { advisors, total, pageSize } = await getAdvisors(searchParams.search, page)
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Advisors</h1>
          <p className="text-gray-500 text-sm">{total} advisor{total !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/dashboard/admin/advisors/new">
          <Button className="bg-brand-navy text-brand-gold hover:bg-brand-navy-light">
            <Plus className="mr-2 h-4 w-4" />
            Add New Advisor
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
                placeholder="Search advisors..."
                defaultValue={searchParams.search}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
            {searchParams.search && (
              <Link href="/dashboard/admin/advisors">
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
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Title</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Contact</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {advisors.map((advisor) => (
                  <tr key={advisor.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-brand-cream flex items-center justify-center overflow-hidden flex-shrink-0 border">
                          {advisor.image_url ? (
                            <img
                              src={advisor.image_url}
                              alt={advisor.name || ''}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="font-semibold text-brand-navy text-sm">
                              {advisor.name?.[0] || advisor.email?.[0]?.toUpperCase() || 'A'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{advisor.name || 'Unnamed Advisor'}</p>
                          {advisor.years_experience && (
                            <p className="text-xs text-gray-400">{advisor.years_experience} years experience</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className="text-sm text-gray-700">{advisor.title || '—'}</span>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <div className="space-y-0.5">
                        {advisor.email && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {advisor.email}
                          </p>
                        )}
                        {advisor.phone && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            {advisor.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={advisor.is_active
                        ? 'bg-green-100 text-green-700 border-0 text-xs'
                        : 'bg-gray-100 text-gray-500 border-0 text-xs'
                      }>
                        {advisor.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/admin/advisors/${advisor.id}`}>
                          <Button variant="ghost" size="sm" className="text-brand-navy h-8 px-2">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                        <DeleteAdvisorButton id={advisor.id} name={advisor.name || 'Advisor'} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {advisors.length === 0 && (
            <div className="text-center py-16">
              <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No advisors found</h3>
              <p className="text-gray-500 mb-4">
                {searchParams.search ? `No results for "${searchParams.search}"` : 'Get started by adding your first advisor'}
              </p>
              <Link href="/dashboard/admin/advisors/new">
                <Button className="bg-brand-navy text-brand-gold">Add Advisor</Button>
              </Link>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages} · {total} advisors
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
