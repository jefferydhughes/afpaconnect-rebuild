'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2, UserPlus, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

type Advisor = {
  id: string
  full_name: string | null
  email: string
  advisor_specialties: string[] | null
  advisor_image_url: string | null
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  leadId: string
  leadName: string
  currentAdvisorId: string | null
  onAdvisorAssigned: (advisorId: string, advisorName: string) => void
}

export default function AssignAdvisorDialog({
  open,
  onOpenChange,
  leadId,
  leadName,
  currentAdvisorId,
  onAdvisorAssigned,
}: Props) {
  const supabase = createClient()
  const [advisors, setAdvisors] = useState<Advisor[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState<string | null>(currentAdvisorId)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!open) return
    setLoading(true)
    supabase
      .from('profiles')
      .select('id, full_name, email, advisor_specialties, advisor_image_url')
      .eq('role', 'advisor')
      .eq('advisor_is_active', true)
      .order('full_name')
      .then(({ data }) => {
        setAdvisors(data || [])
        setLoading(false)
      })
  }, [open])

  const filtered = advisors.filter((a) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      a.full_name?.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.advisor_specialties?.some((s) => s.toLowerCase().includes(q))
    )
  })

  async function handleAssign() {
    if (!selected) return
    setSaving(true)
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attributed_advisor_id: selected }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to assign advisor')
      }

      const advisor = advisors.find((a) => a.id === selected)
      toast.success(
        `${leadName} assigned to ${advisor?.full_name || 'advisor'}`
      )
      onAdvisorAssigned(selected, advisor?.full_name || 'Advisor')
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign advisor')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-green-600" />
            Assign Advisor
          </DialogTitle>
          <DialogDescription>
            Select an advisor for {leadName}
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search advisors..."
            className="pl-10"
          />
        </div>

        <div className="max-h-64 overflow-y-auto space-y-1 border rounded-lg p-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">
              No advisors found
            </p>
          ) : (
            filtered.map((advisor) => (
              <button
                key={advisor.id}
                onClick={() => setSelected(advisor.id)}
                className={`w-full text-left px-3 py-2.5 rounded-md flex items-center gap-3 transition-colors ${
                  selected === advisor.id
                    ? 'bg-brand-navy/10 border border-brand-navy/30'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="h-9 w-9 rounded-full bg-brand-cream flex items-center justify-center flex-shrink-0">
                  {advisor.advisor_image_url ? (
                    <img
                      src={advisor.advisor_image_url}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-brand-navy">
                      {(advisor.full_name || advisor.email)[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {advisor.full_name || advisor.email}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{advisor.email}</p>
                </div>
                {advisor.id === currentAdvisorId && (
                  <span className="ml-auto text-xs text-brand-navy bg-brand-cream px-2 py-0.5 rounded-full flex-shrink-0">
                    Current
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={saving || !selected || selected === currentAdvisorId}
            className="bg-brand-navy text-white hover:bg-brand-navy/90"
          >
            {saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Assigning...</>
            ) : (
              'Assign Advisor'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
