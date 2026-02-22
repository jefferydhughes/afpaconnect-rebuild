'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Mail, Pencil } from 'lucide-react'
import EditUserDialog from './EditUserDialog'

interface UserRow {
  id: string
  full_name: string | null
  email: string
  role: string
  associated_franchise_id: string | null
  created_at: string
}

interface UsersTableProps {
  users: UserRow[]
  franchiseNames: Record<string, string>
}

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  advisor: 'bg-blue-100 text-blue-700',
  franchisor: 'bg-green-100 text-green-700',
  franchise_rep: 'bg-purple-100 text-purple-700',
  user: 'bg-gray-100 text-gray-700',
}

export default function UsersTable({ users, franchiseNames }: UsersTableProps) {
  const [editingUser, setEditingUser] = useState<UserRow | null>(null)

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">User</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Role</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 hidden md:table-cell">Franchise</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Joined</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-brand-cream flex items-center justify-center flex-shrink-0">
                      <span className="font-semibold text-brand-navy">
                        {user.full_name?.[0] || user.email[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.full_name || 'No name'}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Badge className={`${roleColors[user.role] || roleColors.user} border-0 capitalize`}>
                    {user.role?.replace(/_/g, ' ')}
                  </Badge>
                </td>
                <td className="py-3 px-4 hidden md:table-cell text-sm text-gray-500">
                  {user.associated_franchise_id
                    ? (franchiseNames[user.associated_franchise_id] || '—')
                    : '—'}
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
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
                        <a href={`mailto:${user.email}`}>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingUser(user)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          currentFranchiseName={
            editingUser.associated_franchise_id
              ? franchiseNames[editingUser.associated_franchise_id] ?? null
              : null
          }
          open={!!editingUser}
          onOpenChange={(open) => { if (!open) setEditingUser(null) }}
        />
      )}
    </>
  )
}
