'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2, CheckCircle, FileText, Download } from 'lucide-react'
import { toast } from 'sonner'

interface FddLeadCaptureModalProps {
  franchiseName: string
  fddUrl: string
}

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia',
]

const CA_PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
  'Newfoundland and Labrador', 'Nova Scotia', 'Ontario',
  'Prince Edward Island', 'Quebec', 'Saskatchewan',
  'Northwest Territories', 'Nunavut', 'Yukon',
]

export default function FddLeadCaptureModal({ franchiseName, fddUrl }: FddLeadCaptureModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    city: '',
    state: '',
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
        city: '',
        state: '',
      })
      setIsSubmitted(false)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const firstName = formData.first_name.trim()
    const lastName = formData.last_name.trim()
    const email = formData.email.trim().toLowerCase()
    const city = formData.city.trim()
    const state = formData.state

    if (!firstName || !lastName || !email) {
      toast.error('First name, last name, and email are required.')
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('leads')
        .insert({
          email,
          first_name: firstName,
          last_name: lastName,
          city: city || null,
          state: state || null,
          source: 'fdd_request',
          notes: `FDD Request: ${franchiseName}`,
          status: 'new',
        })

      if (error) {
        console.error('Error creating lead:', error)
        toast.error('Failed to submit request. Please try again.')
      } else {
        setIsSubmitted(true)
        toast.success('Request submitted successfully!')
      }
    } catch (error) {
      console.error('Error submitting FDD request:', error)
      toast.error('Failed to submit request. Please try again.')
    }

    setIsSubmitting(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <FileText className="mr-2 h-4 w-4" />
          View FDD
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border-slate-200 shadow-xl max-w-md mx-auto">
        {isSubmitted ? (
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-900 mb-2">
              Thank You!
            </DialogTitle>
            <DialogDescription className="text-slate-600 mb-6">
              Your FDD request for {franchiseName} has been received. Click below to download the document.
            </DialogDescription>
            <div className="space-y-3">
              <a href={fddUrl} target="_blank" rel="noopener noreferrer" download>
                <Button className="w-full bg-brand-navy hover:bg-brand-navy-light text-brand-gold">
                  <Download className="w-4 h-4 mr-2" />
                  Download FDD
                </Button>
              </a>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-bold text-slate-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-brand-gold" />
                View FDD - {franchiseName}
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Please provide your contact information to access the Franchise Disclosure Document.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fdd_first_name" className="text-slate-700 font-medium">First Name</Label>
                  <Input
                    id="fdd_first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                    className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-brand-gold focus:ring-brand-gold"
                  />
                </div>
                <div>
                  <Label htmlFor="fdd_last_name" className="text-slate-700 font-medium">Last Name</Label>
                  <Input
                    id="fdd_last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                    className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-brand-gold focus:ring-brand-gold"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fdd_email" className="text-slate-700 font-medium">Email</Label>
                <Input
                  type="email"
                  id="fdd_email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-brand-gold focus:ring-brand-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fdd_city" className="text-slate-700 font-medium">City</Label>
                  <Input
                    id="fdd_city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g., Dallas"
                    className="mt-1 bg-white border-slate-300 text-slate-900 focus:border-brand-gold focus:ring-brand-gold"
                  />
                </div>
                <div>
                  <Label htmlFor="fdd_state" className="text-slate-700 font-medium">State / Province</Label>
                  <select
                    id="fdd_state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-gold focus:ring-brand-gold focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <optgroup label="United States">
                      {US_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Canada">
                      {CA_PROVINCES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
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
                      Submitting...
                    </>
                  ) : (
                    'Submit'
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
