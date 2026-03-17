'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2, Search, X, Loader2 } from 'lucide-react'

interface FranchiseResult {
  id: string
  name: string
  logo_url: string | null
}

interface UserProfile {
  id: string
  full_name: string | null
  email: string
  role: string
  associated_franchise_id: string | null
}

interface EditUserDialogProps {
  user: UserProfile
  currentFranchiseName?: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  advisor: 'Advisor',
  franchisor: 'Franchisor',
  franchise_rep: 'Franchise Rep',
  user: 'User',
}

const FRANCHISE_ROLES = ['franchisor', 'franchise_rep']

export default function EditUserDialog({
  user,
  currentFranchiseName,
  open,
  onOpenChange,
}: EditUserDialogProps) {
  const router = useRouter()

  const [fullName, setFullName] = useState(user.full_name || '')
  const [role, setRole] = useState(user.role)
  const [franchiseId, setFranchiseId] = useState<string | null>(user.associated_franchise_id)
  const [franchiseName, setFranchiseName] = useState(currentFranchiseName || '')

  const [franchiseQuery, setFranchiseQuery] = useState('')
  const [franchiseResults, setFranchiseResults] = useState<FranchiseResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Reset state when dialog opens with a (possibly different) user
  useEffect(() => {
    if (open) {
      setFullName(user.full_name || '')
      setRole(user.role)
      setFranchiseId(user.associated_franchise_id)
      setFranchiseName(currentFranchiseName || '')
      setFranchiseQuery('')
      setFranchiseResults([])
      setShowDropdown(false)
      setError(null)
    }
  }, [open, user, currentFranchiseName])

  const searchFranchises = useCallback(async (q: string) => {
    setSearchLoading(true)
    try {
      const res = await fetch(`/api/admin/franchises/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setFranchiseResults(Array.isArray(data) ? data : [])
      setShowDropdown(true)
    } catch {
      setFranchiseResults([])
    } finally {
      setSearchLoading(false)
    }
  }, [])

  function handleFranchiseInput(value: string) {
    setFranchiseQuery(value)
    setFranchiseId(null)
    setFranchiseName('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.length === 0) {
      setFranchiseResults([])
      setShowDropdown(false)
      return
    }
    debounceRef.current = setTimeout(() => searchFranchises(value), 300)
  }

  function handleFranchiseSelect(f: FranchiseResult) {
    setFranchiseId(f.id)
    setFranchiseName(f.name)
    setFranchiseQuery(f.name)
    setShowDropdown(false)
  }

  function handleClearFranchise() {
    setFranchiseId(null)
    setFranchiseName('')
    setFranchiseQuery('')
    setFranchiseResults([])
    setShowDropdown(false)
  }

  // When role changes away from franchise roles, clear franchise
  function handleRoleChange(newRole: string) {
    setRole(newRole)
    if (!FRANCHISE_ROLES.includes(newRole)) {
      handleClearFranchise()
    } else if (!franchiseId && FRANCHISE_ROLES.includes(newRole)) {
      // Open search automatically
      searchFranchises('')
    }
  }

  async function handleSave() {
    setError(null)

    if (FRANCHISE_ROLES.includes(role) && !franchiseId) {
      setError('Please select a franchise for this role.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName || null,
          role,
          associated_franchise_id: FRANCHISE_ROLES.includes(role) ? franchiseId : null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to update user.')
        return
      }

      onOpenChange(false)
      router.refresh()
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setSaving(false)
    }
  }

  const needsFranchise = FRANCHISE_ROLES.includes(role)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Read-only email */}
          <div className="space-y-1.5">
            <Label className="text-gray-500 text-xs">Email</Label>
            <p className="text-sm text-gray-700 font-medium">{user.email}</p>
          </div>

          {/* Full name */}
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
            />
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Franchise search — only shown for franchisor / franchise_rep */}
          {needsFranchise && (
            <div className="space-y-1.5">
              <Label>
                Associated Franchise <span className="text-red-500">*</span>
              </Label>

              {/* Selected franchise pill */}
              {franchiseId && franchiseName ? (
                <div className="flex items-center gap-2 p-2 rounded-md border bg-gray-50">
                  <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-medium flex-1">{franchiseName}</span>
                  <button
                    type="button"
                    onClick={handleClearFranchise}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative" ref={searchRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={franchiseQuery}
                      onChange={(e) => handleFranchiseInput(e.target.value)}
                      onFocus={() => {
                        if (franchiseResults.length > 0) setShowDropdown(true)
                        else if (!franchiseQuery) searchFranchises('')
                      }}
                      placeholder="Search franchise name..."
                      className="pl-9 pr-8"
                    />
                    {searchLoading && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                    )}
                  </div>

                  {showDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white rounded-md border shadow-lg max-h-52 overflow-y-auto">
                      {franchiseResults.length === 0 ? (
                        <p className="text-sm text-gray-500 px-3 py-2">No franchises found.</p>
                      ) : (
                        franchiseResults.map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleFranchiseSelect(f)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-left"
                          >
                            <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            {f.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || (needsFranchise && !franchiseId)}
            className="bg-brand-navy text-brand-gold hover:bg-brand-navy-light"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
