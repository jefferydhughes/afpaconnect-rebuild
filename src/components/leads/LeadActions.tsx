'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Mail,
  Phone,
  MoreHorizontal,
  Eye,
  ArrowRightLeft,
  UserPlus,
  Copy,
  PhoneCall,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import EmailComposerDialog from './EmailComposerDialog'
import UpdateStatusDialog from './UpdateStatusDialog'
import AssignAdvisorDialog from './AssignAdvisorDialog'

type Props = {
  leadId: string
  leadName: string
  email: string
  phone: string | null
  status: string
  advisorId: string | null
  detailPath?: string // admin or advisor path
}

export default function LeadActions({
  leadId,
  leadName,
  email,
  phone,
  status,
  advisorId,
  detailPath,
}: Props) {
  const router = useRouter()
  const [emailOpen, setEmailOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [advisorOpen, setAdvisorOpen] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(status)
  const [currentAdvisorId, setCurrentAdvisorId] = useState(advisorId)

  function handleCopyPhone() {
    if (phone) {
      navigator.clipboard.writeText(phone)
      toast.success('Phone number copied')
    }
  }

  return (
    <>
      <div className="flex gap-1 items-center">
        {/* Email button — opens composer */}
        {email && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEmailOpen(true)}
            title="Send email"
          >
            <Mail className="h-4 w-4" />
          </Button>
        )}

        {/* Phone button — tel: link + copy option */}
        {phone && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" title="Call options">
                <Phone className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <a href={`tel:${phone}`} className="flex items-center gap-2">
                  <PhoneCall className="h-4 w-4" />
                  Call {phone}
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyPhone}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Number
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Three-dot actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() =>
                router.push(detailPath || `/dashboard/admin/leads/${leadId}`)
              }
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusOpen(true)}>
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Update Status
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setAdvisorOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Advisor
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Dialogs */}
      <EmailComposerDialog
        open={emailOpen}
        onOpenChange={setEmailOpen}
        recipientEmail={email}
        recipientName={leadName}
        leadId={leadId}
      />
      <UpdateStatusDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        leadId={leadId}
        leadName={leadName}
        currentStatus={currentStatus}
        onStatusUpdated={(s) => {
          setCurrentStatus(s)
          router.refresh()
        }}
      />
      <AssignAdvisorDialog
        open={advisorOpen}
        onOpenChange={setAdvisorOpen}
        leadId={leadId}
        leadName={leadName}
        currentAdvisorId={currentAdvisorId}
        onAdvisorAssigned={(id, name) => {
          setCurrentAdvisorId(id)
          router.refresh()
        }}
      />
    </>
  )
}
