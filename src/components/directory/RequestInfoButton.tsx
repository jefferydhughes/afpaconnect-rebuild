'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'
import RequestInfoModal from './RequestInfoModal'

interface RequestInfoButtonProps {
  franchise: {
    id: string
    name: string
    broker_email?: string | null
  }
  className?: string
  variant?: 'default' | 'outline'
  children?: React.ReactNode
}

export default function RequestInfoButton({ franchise, className, variant, children }: RequestInfoButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className={className}
        variant={variant}
      >
        {children ?? (
          <>
            <Mail className="mr-2 h-4 w-4" />
            Request Information
          </>
        )}
      </Button>
      <RequestInfoModal
        isOpen={open}
        onOpenChange={setOpen}
        franchise={franchise}
      />
    </>
  )
}
