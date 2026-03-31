'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, ArrowRightLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

const STATUSES = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-700' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'qualified', label: 'Qualified', color: 'bg-purple-100 text-purple-700' },
  { value: 'nurturing', label: 'Nurturing', color: 'bg-orange-100 text-orange-700' },
  { value: 'converted', label: 'Converted', color: 'bg-green-100 text-green-700' },
  { value: 'unqualified', label: 'Unqualified', color: 'bg-gray-100 text-gray-700' },
]

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  leadId: string
  leadName: string
  currentStatus: string
  onStatusUpdated: (newStatus: string) => void
}

export default function UpdateStatusDialog({
  open,
  onOpenChange,
  leadId,
  leadName,
  currentStatus,
  onStatusUpdated,
}: Props) {
  const [selected, setSelected] = useState(currentStatus)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (selected === currentStatus) {
      onOpenChange(false)
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selected }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update status')
      }

      toast.success(`${leadName} moved to "${selected}"`)
      onStatusUpdated(selected)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-purple-600" />
            Update Status
          </DialogTitle>
          <DialogDescription>
            Change pipeline stage for {leadName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 py-2">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setSelected(s.value)}
              className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                selected === s.value
                  ? 'border-brand-navy ring-2 ring-brand-navy/20 ' + s.color
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              } ${
                s.value === currentStatus && selected !== s.value
                  ? 'opacity-50'
                  : ''
              }`}
            >
              {s.label}
              {s.value === currentStatus && (
                <span className="block text-xs font-normal mt-0.5 opacity-60">
                  Current
                </span>
              )}
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || selected === currentStatus}
            className="bg-brand-navy text-white hover:bg-brand-navy/90"
          >
            {saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
            ) : (
              'Update Status'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
