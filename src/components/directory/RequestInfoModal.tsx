'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Loader2, CheckCircle, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface RequestInfoModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  franchise: any
}

export default function RequestInfoModal({ isOpen, onOpenChange, franchise }: RequestInfoModalProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        message: franchise ? `I'd like to learn more about the ${franchise.name} franchise opportunity.` : ''
      })
      setIsSubmitted(false)
    }
  }, [isOpen, franchise])

  if (!franchise) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const { error } = await supabase
        .from('leads')
        .insert({
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          lead_source: 'listing_request_info',
          notes: `Request Info from Listing Page - ${franchise.name}\nMessage: ${formData.message}`
        })

      if (error) {
        console.error('Error creating lead:', error)
        toast.error('Failed to submit request. Please try again.')
      } else {
        setIsSubmitted(true)
        toast.success('Request sent successfully!')
      }
    } catch (error) {
      console.error("Error submitting request:", error)
      toast.error('Failed to submit request. Please try again.')
    }
    
    setIsSubmitting(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-slate-200 shadow-xl max-w-md mx-auto">
        {isSubmitted ? (
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-900 mb-2">Request Sent!</DialogTitle>
            <DialogDescription className="text-slate-600 mb-6">
              Thank you for your interest in {franchise.name}. We&apos;ll send you detailed information shortly and a representative may contact you.
            </DialogDescription>
            <Button 
              onClick={() => onOpenChange(false)} 
              className="bg-brand-navy hover:bg-brand-navy-light text-brand-gold px-6 py-2"
            >
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-bold text-slate-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-brand-gold" />
                Request Information - {franchise.name}
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Get detailed franchise information, investment requirements, and territory availability.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name_req" className="text-slate-700 font-medium">First Name</Label>
                  <Input 
                    id="first_name_req" 
                    value={formData.first_name} 
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})} 
                    required 
                    className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-brand-gold focus:ring-brand-gold"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name_req" className="text-slate-700 font-medium">Last Name</Label>
                  <Input 
                    id="last_name_req" 
                    value={formData.last_name} 
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})} 
                    required 
                    className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-brand-gold focus:ring-brand-gold"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email_req" className="text-slate-700 font-medium">Email</Label>
                <Input 
                  type="email" 
                  id="email_req" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  required 
                  className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-brand-gold focus:ring-brand-gold"
                />
              </div>
              
              <div>
                <Label htmlFor="phone_req" className="text-slate-700 font-medium">Phone (Optional)</Label>
                <Input 
                  type="tel" 
                  id="phone_req" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                  className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-brand-gold focus:ring-brand-gold"
                />
              </div>
              
              <div>
                <Label htmlFor="message_req" className="text-slate-700 font-medium">Message (Optional)</Label>
                <Textarea 
                  id="message_req" 
                  value={formData.message} 
                  onChange={(e) => setFormData({...formData, message: e.target.value})} 
                  className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-brand-gold focus:ring-brand-gold h-24"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="flex-1 bg-brand-navy hover:bg-brand-navy-light text-brand-gold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 
                      Sending...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Request Info
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
