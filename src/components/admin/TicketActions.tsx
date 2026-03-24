'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Save, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

type Ticket = {
  id: string
  status: string
  admin_notes: string | null
  [key: string]: unknown
}

export default function TicketActions({ ticket }: { ticket: Ticket }) {
  const router = useRouter()
  const [notes, setNotes] = useState(ticket.admin_notes || '')
  const [saving, setSaving] = useState(false)

  async function updateTicket(updates: Record<string, unknown>) {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/support-tickets?id=${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Ticket updated!')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const isResolved = ticket.status === 'resolved' || ticket.status === 'closed'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Admin Notes & Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          rows={4}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Add internal notes about this ticket..."
          className="font-mono text-sm"
        />

        <div className="flex flex-wrap gap-3">
          <Button
            size="sm"
            disabled={saving}
            onClick={() => updateTicket({ admin_notes: notes })}
            className="bg-brand-navy text-brand-gold hover:bg-brand-navy-light"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Notes
          </Button>

          {!isResolved && (
            <>
              {ticket.status === 'open' && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={saving}
                  onClick={() => updateTicket({ status: 'in_progress' })}
                >
                  Mark In Progress
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                disabled={saving}
                onClick={() => updateTicket({ status: 'resolved', admin_notes: notes })}
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Resolve
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={saving}
                onClick={() => updateTicket({ status: 'closed', admin_notes: notes })}
                className="border-gray-300 text-gray-500 hover:bg-gray-50"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Close
              </Button>
            </>
          )}

          {isResolved && (
            <Button
              size="sm"
              variant="outline"
              disabled={saving}
              onClick={() => updateTicket({ status: 'open', resolved_at: null })}
            >
              Reopen
            </Button>
          )}
        </div>

        {/* Status change dropdown */}
        <div className="pt-2 border-t">
          <p className="text-xs text-gray-400 mb-2">Change Status</p>
          <select
            value={ticket.status}
            onChange={e => updateTicket({ status: e.target.value })}
            disabled={saving}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="ai_diagnosing">AI Diagnosing</option>
            <option value="ai_fixed">AI Fixed</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </CardContent>
    </Card>
  )
}
