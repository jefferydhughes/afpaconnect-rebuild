import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/require-role'
import { Search, Users, Shield, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import UsersTable from '@/components/admin/UsersTable'

async function getUsers(search?: string) {
  const supabase = createAdminClient()

  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
  }

  const { data } = await query.limit(50)
  return data || []
}

async function getFranchiseNames(ids: string[]): Promise<Record<string, string>> {
  if (ids.length === 0) return {}
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('franchise')
    .select('id, name')
    .in('id', ids)
  if (!data) return {}
  return Object.fromEntries(data.map((f: { id: string; name: string }) => [f.id, f.name]))
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
  await requireAdmin('/dashboard/admin/users')

  const users = await getUsers(searchParams.search)

  // Collect all unique franchise IDs so we can show names in the table
  const franchiseIds = [...new Set(
    users
      .map((u) => u.associated_franchise_id)
      .filter((id): id is string => !!id)
  )]
  const franchiseNames = await getFranchiseNames(franchiseIds)

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    advisors: users.filter(u => u.role === 'advisor').length,
    franchisors: users.filter(u => u.role === 'franchisor').length,
    franchiseReps: users.filter(u => u.role === 'franchise_rep').length,
    users: users.filter(u => u.role === 'user').length,
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-600">{stats.total} total users</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-gray-400" />
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Shield className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{stats.admins}</p>
              <p className="text-sm text-gray-500">Admins</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <UserCheck className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{stats.advisors}</p>
              <p className="text-sm text-gray-500">Advisors</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{stats.franchisors}</p>
              <p className="text-sm text-gray-500">Franchisors</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <UserCheck className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{stats.franchiseReps}</p>
              <p className="text-sm text-gray-500">Franchise Reps</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-gray-400" />
            <div>
              <p className="text-2xl font-bold">{stats.users}</p>
              <p className="text-sm text-gray-500">Prospects</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <form className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                name="search"
                placeholder="Search by name or email..."
                defaultValue={searchParams.search}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {users.length > 0 ? (
            <UsersTable users={users} franchiseNames={franchiseNames} />
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">
                {searchParams.search ? 'Try a different search term' : 'No users have signed up yet'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
