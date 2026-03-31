'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Mail, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipientEmail: string
  recipientName: string
  leadId?: string
  senderName?: string
  senderEmail?: string
}

export default function EmailComposerDialog({
  open,
  onOpenChange,
  recipientEmail,
  recipientName,
  leadId,
  senderName,
  senderEmail,
}: Props) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  function resetForm() {
    setSubject('')
    setBody('')
  }

  async function handleSend() {
    if (!subject.trim() || !body.trim()) {
      toast.error('Subject and message are required')
      return
    }

    setSending(true)
    try {
      const htmlBody = body
        .split('\n')
        .map((line) => (line.trim() === '' ? '<br/>' : `<p>${line}</p>`))
        .join('')

      const res = await fetch('/api/leads/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail,
          subject,
          body: htmlBody,
          leadId,
          senderName,
          replyTo: senderEmail,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to send email')
      }

      toast.success(`Email sent to ${recipientName || recipientEmail}`)
      resetForm()
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to send email')
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Compose Email
          </DialogTitle>
          <DialogDescription>
            Send an email to {recipientName || recipientEmail}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              To
            </label>
            <Input
              value={`${recipientName ? recipientName + ' ' : ''}<${recipientEmail}>`}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Subject
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Message
            </label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message..."
              className="min-h-[200px] resize-none"
            />
          </div>

          {senderEmail && (
            <p className="text-xs text-gray-400">
              Replies will be sent to {senderEmail}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !body.trim()}
            className="bg-brand-navy text-white hover:bg-brand-navy/90"
          >
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
