'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2 } from 'lucide-react'

type FranchiseOption = {
  id: string
  name: string
}

type FormState = {
  franchise_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  city: string
  state: string
  liquid_capital: string
  net_worth: string
  management_experience_years: string
  business_ownership: boolean
  franchise_experience: boolean
  timeline_to_open: string
  why_this_franchise: string
  business_goals: string
}

const initialForm: FormState = {
  franchise_id: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  city: '',
  state: '',
  liquid_capital: '',
  net_worth: '',
  management_experience_years: '',
  business_ownership: false,
  franchise_experience: false,
  timeline_to_open: '',
  why_this_franchise: '',
  business_goals: '',
}

export default function FranchiseApplicationPage() {
  const searchParams = useSearchParams()
  const [franchises, setFranchises] = useState<FranchiseOption[]>([])
  const [form, setForm] = useState<FormState>(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    let isMounted = true
    const queryFranchiseId = searchParams.get('franchise_id') || ''

    async function loadFranchises() {
      try {
        const response = await fetch('/api/franchise-applications', { cache: 'no-store' })
        const data = await response.json()
        if (!response.ok) throw new Error(data?.error || 'Failed to load franchises')
        if (!isMounted) return

        const options = (data.franchises || []) as FranchiseOption[]
        setFranchises(options)

        setForm((prev) => {
          if (queryFranchiseId && options.some((f) => f.id === queryFranchiseId)) {
            return { ...prev, franchise_id: queryFranchiseId }
          }
          if (!prev.franchise_id && options[0]?.id) {
            return { ...prev, franchise_id: options[0].id }
          }
          return prev
        })
      } catch (error) {
        if (!isMounted) return
        setSubmitError(error instanceof Error ? error.message : 'Failed to load franchises')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadFranchises()
    return () => {
      isMounted = false
    }
  }, [searchParams])

  const selectedFranchiseName = useMemo(
    () => franchises.find((f) => f.id === form.franchise_id)?.name || '',
    [franchises, form.franchise_id]
  )

  const handleChange = (key: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitError('')
    setIsSubmitting(true)

    try {
      const payload = {
        ...form,
        liquid_capital: form.liquid_capital || 0,
        net_worth: form.net_worth || 0,
        management_experience_years: form.management_experience_years || 0,
      }

      const response = await fetch('/api/franchise-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data?.error || 'Failed to submit application')
      setIsSubmitted(true)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit application')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-3xl mx-auto text-center text-gray-600">Loading application form...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Franchise Application</h1>
          <p className="text-gray-600 mt-2">
            Submit your interest and the selected franchisor will be notified.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application Form</CardTitle>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="text-center py-10">
                <CheckCircle2 className="h-14 w-14 text-green-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Application Submitted</h2>
                <p className="text-gray-600">
                  Your application for {selectedFranchiseName || 'this franchise'} was saved and sent to the franchisor.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="franchise">Franchise Brand</Label>
                  <select
                    id="franchise"
                    value={form.franchise_id}
                    onChange={(e) => handleChange('franchise_id', e.target.value)}
                    className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    required
                  >
                    <option value="" disabled>
                      Select a franchise
                    </option>
                    {franchises.map((franchise) => (
                      <option key={franchise.id} value={franchise.id}>
                        {franchise.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input id="first_name" value={form.first_name} onChange={(e) => handleChange('first_name', e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input id="last_name" value={form.last_name} onChange={(e) => handleChange('last_name', e.target.value)} required />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={form.city} onChange={(e) => handleChange('city', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="state">State/Province</Label>
                    <Input id="state" value={form.state} onChange={(e) => handleChange('state', e.target.value)} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="liquid_capital">Liquid Capital (USD)</Label>
                    <Input id="liquid_capital" type="number" min="0" value={form.liquid_capital} onChange={(e) => handleChange('liquid_capital', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="net_worth">Net Worth (USD)</Label>
                    <Input id="net_worth" type="number" min="0" value={form.net_worth} onChange={(e) => handleChange('net_worth', e.target.value)} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="management_experience_years">Management Experience (Years)</Label>
                    <Input
                      id="management_experience_years"
                      type="number"
                      min="0"
                      value={form.management_experience_years}
                      onChange={(e) => handleChange('management_experience_years', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeline_to_open">Preferred Timeline</Label>
                    <select
                      id="timeline_to_open"
                      value={form.timeline_to_open}
                      onChange={(e) => handleChange('timeline_to_open', e.target.value)}
                      className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Select timeline</option>
                      <option value="immediate">Immediately</option>
                      <option value="3_6_months">3-6 months</option>
                      <option value="6_12_months">6-12 months</option>
                      <option value="12_plus_months">12+ months</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.business_ownership}
                      onChange={(e) => handleChange('business_ownership', e.target.checked)}
                    />
                    Previous business owner
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.franchise_experience}
                      onChange={(e) => handleChange('franchise_experience', e.target.checked)}
                    />
                    Previous franchise experience
                  </label>
                </div>

                <div>
                  <Label htmlFor="why_this_franchise">Why this franchise?</Label>
                  <Textarea
                    id="why_this_franchise"
                    rows={4}
                    value={form.why_this_franchise}
                    onChange={(e) => handleChange('why_this_franchise', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="business_goals">Business goals</Label>
                  <Textarea
                    id="business_goals"
                    rows={4}
                    value={form.business_goals}
                    onChange={(e) => handleChange('business_goals', e.target.value)}
                  />
                </div>

                {submitError && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {submitError}
                  </div>
                )}

                <Button type="submit" disabled={isSubmitting || !form.franchise_id}>
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
