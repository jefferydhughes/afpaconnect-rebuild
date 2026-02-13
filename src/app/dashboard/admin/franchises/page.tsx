import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Plus, 
  Search, 
  Building2, 
  Edit, 
  Trash2, 
  Eye,
  Star,
  MoreHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency } from '@/lib/utils'

async function getFranchises(search?: string) {
  const supabase = createClient()
  
  let query = supabase
    .from('franchises')
    .select('*')
    .order('name')

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data, count } = await query.limit(50)

  return { franchises: data || [], total: count || 0 }
}

export default async function AdminFranchisesPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
  const { franchises, total } = await getFranchises(searchParams.search)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Franchises</h1>
          <p className="text-gray-600">{franchises.length} franchises in directory</p>
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
          <form className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                name="search"
                placeholder="Search franchises..."
                defaultValue={searchParams.search}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Franchises Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Franchise
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Investment
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {franchises.map((franchise) => (
                  <tr key={franchise.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {franchise.logo_url ? (
                            <Image
                              src={franchise.logo_url}
                              alt={franchise.name}
                              width={40}
                              height={40}
                              className="object-contain"
                            />
                          ) : (
                            <Building2 className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{franchise.name}</p>
                          <p className="text-sm text-gray-500">{franchise.slug}</p>
                        </div>
                        {franchise.is_featured && (
                          <Star className="h-4 w-4 text-brand-gold fill-brand-gold" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize">
                        {franchise.category?.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {franchise.initial_investment_min && franchise.initial_investment_max ? (
                        <span>
                          {formatCurrency(franchise.initial_investment_min)} - {formatCurrency(franchise.initial_investment_max)}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={franchise.is_active ? 'bg-green-100 text-green-700 border-0' : 'bg-gray-100 text-gray-700 border-0'}>
                        {franchise.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/directory/${franchise.slug}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/admin/franchises/${franchise.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {franchises.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No franchises found</h3>
              <p className="text-gray-500 mb-4">
                {searchParams.search ? 'Try a different search term' : 'Get started by adding your first franchise'}
              </p>
              <Link href="/dashboard/admin/franchises/new">
                <Button>Add Franchise</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
