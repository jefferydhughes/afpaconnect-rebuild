'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

export default function BackfillAdvisorUsersButton() {
  const [running, setRunning] = useState(false)

  async function handleClick() {
    if (running) return
    if (!confirm(
      'This will send a password-reset / invitation email to every advisor ' +
      'who does not yet have a Supabase user account. Continue?'
    )) return

    setRunning(true)
    try {
      const res = await fetch('/api/admin/advisors/backfill-users', {
        method: 'POST',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || 'Backfill failed')
        return
      }
      const r = data.results
      toast.success(
        `Backfill complete — invited ${r.invited}, linked ${r.linked_existing}, ` +
        `already linked ${r.already_linked}, skipped (no email) ${r.skipped_no_email}` +
        (r.errors?.length ? `, errors ${r.errors.length}` : '')
      )
    } catch {
      toast.error('Unexpected error during backfill')
    } finally {
      setRunning(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={running}
      className="border-brand-navy text-brand-navy"
    >
      {running ? (
        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Syncing...</>
      ) : (
        <><UserPlus className="mr-2 h-4 w-4" />Backfill Users</>
      )}
    </Button>
  )
}
