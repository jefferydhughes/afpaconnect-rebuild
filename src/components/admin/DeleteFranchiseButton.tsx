'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function DeleteFranchiseButton({
  id,
  name,
}: {
  id: string
  name: string
}) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('franchises').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete: ' + error.message)
      setDeleting(false)
      setConfirming(false)
    } else {
      toast.success(`"${name}" deleted.`)
      router.refresh()
    }
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs font-medium text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded disabled:opacity-60"
        >
          {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirm'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
        >
          Cancel
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4" />
      Delete
    </button>
  )
}
